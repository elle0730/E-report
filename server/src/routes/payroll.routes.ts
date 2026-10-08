import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { requireAuth, AuthRequest, requireRole } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';

const router = Router();

// Staff log own attendance (Time In / Time Out)
router.post('/attendance/log', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const today = new Date().toISOString().split('T')[0];
  const timeNow = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Check if existing record for today
  const existing = db.prepare('SELECT * FROM payroll_attendance WHERE user_id = ? AND date = ?').get(user.id, today) as any;

  if (!existing) {
    // Time In
    const id = `att-${Date.now()}`;
    db.prepare(`
      INSERT INTO payroll_attendance (id, user_id, date, time_in, total_hours, status, created_at)
      VALUES (?, ?, ?, ?, 0, 'Present', ?)
    `).run(id, user.id, today, timeNow, new Date().toISOString());

    logAudit(user.id, user.full_name, user.role, 'ATTENDANCE_TIME_IN', 'Attendance', id, `Logged Time In at ${timeNow}.`, req);
    res.json({ message: `Time In recorded at ${timeNow}.`, type: 'in', time: timeNow });
  } else if (!existing.time_out) {
    // Time Out
    const totalHours = 8.0; // standard workday calculation
    db.prepare(`
      UPDATE payroll_attendance SET
        time_out = ?,
        total_hours = ?
      WHERE id = ?
    `).run(timeNow, totalHours, existing.id);

    logAudit(user.id, user.full_name, user.role, 'ATTENDANCE_TIME_OUT', 'Attendance', existing.id, `Logged Time Out at ${timeNow}. Total: ${totalHours} hrs.`, req);
    res.json({ message: `Time Out recorded at ${timeNow}. Total hours: ${totalHours} hrs.`, type: 'out', time: timeNow });
  } else {
    res.json({ message: `Attendance for today is already completed (In: ${existing.time_in}, Out: ${existing.time_out}).`, type: 'completed' });
  }
});

// Staff get own attendance & request history
router.get('/my-records', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const attendance = db.prepare('SELECT * FROM payroll_attendance WHERE user_id = ? ORDER BY date DESC LIMIT 30').all(user.id);
  const requests = db.prepare('SELECT * FROM payroll_requests WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
  const payrolls = db.prepare('SELECT * FROM payroll_records WHERE user_id = ? ORDER BY period_end DESC').all(user.id);

  res.json({ attendance, requests, payrolls });
});

// Staff submit leave or cash advance request
router.post('/requests', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthRequest, res: Response) => {
  const { type, amountOrDays, reason } = req.body;
  const user = req.user!;

  if (!type || !amountOrDays || !reason) {
    res.status(400).json({ error: 'Type, amount/days, and reason are required.' });
    return;
  }

  const id = `req-${Date.now()}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO payroll_requests (id, user_id, type, amount_or_days, reason, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'Pending', ?, ?)
  `).run(id, user.id, type, parseFloat(amountOrDays), reason.trim(), now, now);

  logAudit(user.id, user.full_name, user.role, 'SUBMIT_PAYROLL_REQUEST', 'PayrollRequest', id, `Submitted ${type} request (${amountOrDays}).`, req);

  res.status(201).json({ message: 'Request submitted for Punong Barangay / Super Admin approval.', requestId: id });
});

// ============================================
// SUPER ADMIN ONLY ENDPOINTS (Admins blocked)
// ============================================

// List all staff attendance & requests
router.get('/admin/all', requireAuth, requireRole(['super_admin']), (req: AuthRequest, res: Response) => {
  const attendance = db.prepare(`
    SELECT pa.*, u.full_name, u.position
    FROM payroll_attendance pa
    JOIN users u ON pa.user_id = u.id
    ORDER BY pa.date DESC LIMIT 100
  `).all();

  const requests = db.prepare(`
    SELECT pr.*, u.full_name, u.position, rev.full_name as reviewed_by_name
    FROM payroll_requests pr
    JOIN users u ON pr.user_id = u.id
    LEFT JOIN users rev ON pr.reviewed_by = rev.id
    ORDER BY pr.created_at DESC
  `).all();

  const payrolls = db.prepare(`
    SELECT pr.*, u.full_name, u.position
    FROM payroll_records pr
    JOIN users u ON pr.user_id = u.id
    ORDER BY pr.period_end DESC
  `).all();

  const staff = db.prepare("SELECT id, full_name, role, position FROM users WHERE role IN ('admin', 'super_admin') AND status = 'active'").all();

  res.json({ attendance, requests, payrolls, staff });
});

// Super Admin approve/reject leave or cash advance request
router.patch('/requests/:id', requireAuth, requireRole(['super_admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, reviewNotes } = req.body; // status: 'Approved' | 'Rejected'
  const user = req.user!;

  const request = db.prepare('SELECT pr.*, u.full_name FROM payroll_requests pr JOIN users u ON pr.user_id = u.id WHERE pr.id = ?').get(id) as any;
  if (!request) {
    res.status(404).json({ error: 'Request not found.' });
    return;
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE payroll_requests SET
      status = ?,
      review_notes = ?,
      reviewed_by = ?,
      updated_at = ?
    WHERE id = ?
  `).run(status, reviewNotes || null, user.id, now, id);

  // Notify staff member
  const notifId = `not-${Date.now()}`;
  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, link, is_read, created_at)
    VALUES (?, ?, ?, ?, '/payroll', 0, ?)
  `).run(notifId, request.user_id, `HR Request ${status}`, `Your ${request.type} request was ${status} by ${user.full_name}.`, now);

  logAudit(user.id, user.full_name, user.role, 'REVIEW_PAYROLL_REQUEST', 'PayrollRequest', id, `${status} ${request.type} request for ${request.full_name}.`, req);

  res.json({ message: `Request has been ${status}.` });
});

// Super Admin generate / create payroll entry
router.post('/records', requireAuth, requireRole(['super_admin']), (req: AuthRequest, res: Response) => {
  const { userId, periodStart, periodEnd, basicPay, overtimePay = 0, deductions = 0 } = req.body;
  const user = req.user!;

  if (!userId || !periodStart || !periodEnd || basicPay === undefined) {
    res.status(400).json({ error: 'Staff user, pay period dates, and basic pay amount are required.' });
    return;
  }

  const bPay = parseFloat(basicPay);
  const otPay = parseFloat(overtimePay);
  const ded = parseFloat(deductions);
  const netPay = bPay + otPay - ded;

  const id = `pay-${Date.now()}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO payroll_records (
      id, user_id, period_start, period_end, basic_pay, overtime_pay, deductions, net_pay, status, created_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, 'Generated', ?
    )
  `).run(id, userId, periodStart, periodEnd, bPay, otPay, ded, netPay, now);

  logAudit(user.id, user.full_name, user.role, 'GENERATE_PAYROLL', 'PayrollRecord', id, `Generated payroll for staff (Net: ₱${netPay}).`, req);

  res.status(201).json({ message: 'Payroll record created successfully.', payrollId: id });
});

export default router;

