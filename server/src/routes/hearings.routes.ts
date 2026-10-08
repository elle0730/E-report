import { Router, Response } from 'express';
import { db, generateReferenceNumber } from '../db/index.js';
import { requireAuth, AuthRequest, requireRole } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';

const router = Router();

// List Hearings (Residents see their own reports' hearings; Staff see all)
router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { date, venue, status } = req.query;

  let query = `
    SELECT h.*, r.ref_number as report_ref_number, r.title as report_title, r.resident_id
    FROM hearings h
    LEFT JOIN reports r ON h.report_id = r.id
    WHERE h.archived_at IS NULL
  `;
  const params: any[] = [];

  if (user.role === 'resident') {
    query += ' AND r.resident_id = ?';
    params.push(user.id);
  }

  if (date) {
    query += ' AND h.hearing_date = ?';
    params.push(date);
  }

  if (venue) {
    query += ' AND h.venue = ?';
    params.push(venue);
  }

  if (status) {
    query += ' AND h.status = ?';
    params.push(status);
  }

  query += ' ORDER BY h.hearing_date ASC, h.hearing_time ASC';

  const hearings = db.prepare(query).all(...params);
  res.json({ hearings });
});

// Schedule Hearing (From Report)
router.post('/', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthRequest, res: Response) => {
  try {
    const {
      reportId,
      hearingDate,
      hearingTime,
      venue,
      partiesInvolved,
      assignedAdminIds = [],
      purpose
    } = req.body;
    const user = req.user!;

    if (!reportId || !hearingDate || !hearingTime || !venue || !partiesInvolved || !purpose) {
      res.status(400).json({ error: 'All fields (report, date, time, venue, parties, purpose) are required.' });
      return;
    }

    // 1. Conflict & Double-Booking Detection: Check venue booking
    const conflict = db.prepare(`
      SELECT id, ref_number, hearing_time, purpose
      FROM hearings
      WHERE hearing_date = ? AND venue = ? AND status = 'Scheduled' AND archived_at IS NULL
    `).get(hearingDate, venue) as any;

    if (conflict) {
      res.status(409).json({
        error: `Schedule conflict detected! The venue "${venue}" is already booked on ${hearingDate} for hearing ${conflict.ref_number} ("${conflict.purpose}"). Please choose another venue or time slot.`
      });
      return;
    }

    const report = db.prepare('SELECT id, ref_number, resident_id, title FROM reports WHERE id = ?').get(reportId) as any;
    if (!report) {
      res.status(404).json({ error: 'Report not found.' });
      return;
    }

    const refNumber = generateReferenceNumber('BSN-H', new Date().getFullYear());
    const id = `hrg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO hearings (
        id, ref_number, report_id, hearing_date, hearing_time, venue,
        parties_involved, assigned_admin_ids, purpose, status, attendance_json,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, 'Scheduled', '[]',
        ?, ?
      )
    `).run(
      id,
      refNumber,
      reportId,
      hearingDate,
      hearingTime,
      venue,
      partiesInvolved,
      JSON.stringify(assignedAdminIds.length > 0 ? assignedAdminIds : [user.id]),
      purpose,
      now,
      now
    );

    // Record initial history
    db.prepare(`
      INSERT INTO hearing_history (id, hearing_id, action, notes, changed_by, created_at)
      VALUES (?, ?, 'SCHEDULED', ?, ?, ?)
    `).run(`hh-${Date.now()}`, id, `Initial schedule set for ${hearingDate} at ${hearingTime}.`, user.id, now);

    // Notify resident
    const notifId = `not-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, link, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `).run(
      notifId,
      report.resident_id,
      'Hearing Scheduled (Patawag)',
      `A mediation hearing (${refNumber}) has been scheduled on ${hearingDate} at ${hearingTime} regarding report ${report.ref_number}.`,
      `/track/${report.ref_number}`,
      now
    );

    logAudit(user.id, user.full_name, user.role, 'SCHEDULE_HEARING', 'Hearing', id, `Scheduled hearing ${refNumber} for report ${report.ref_number}.`, req);

    res.status(201).json({
      message: `Hearing ${refNumber} scheduled successfully.`,
      hearingId: id,
      refNumber
    });
  } catch (err: any) {
    console.error('Schedule hearing error:', err);
    res.status(500).json({ error: 'Failed to schedule hearing.' });
  }
});

// Update Hearing Details / Reschedule / Cancel / Minutes / Outcome
router.patch('/:id', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, hearingDate, hearingTime, venue, minutes, outcome, attendance, actionNotes } = req.body;
  const user = req.user!;

  const hearing = db.prepare('SELECT * FROM hearings WHERE id = ?').get(id) as any;
  if (!hearing) {
    res.status(404).json({ error: 'Hearing not found.' });
    return;
  }

  // Conflict check if rescheduling
  if (hearingDate && venue && (hearingDate !== hearing.hearing_date || venue !== hearing.venue)) {
    const conflict = db.prepare(`
      SELECT id, ref_number FROM hearings
      WHERE hearing_date = ? AND venue = ? AND status = 'Scheduled' AND id != ? AND archived_at IS NULL
    `).get(hearingDate, venue, id) as any;

    if (conflict) {
      res.status(409).json({ error: `Conflict: Venue "${venue}" is already booked on ${hearingDate} for hearing ${conflict.ref_number}.` });
      return;
    }
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE hearings SET
      status = COALESCE(?, status),
      hearing_date = COALESCE(?, hearing_date),
      hearing_time = COALESCE(?, hearing_time),
      venue = COALESCE(?, venue),
      minutes = COALESCE(?, minutes),
      outcome = COALESCE(?, outcome),
      attendance_json = COALESCE(?, attendance_json),
      updated_at = ?
    WHERE id = ?
  `).run(
    status || null,
    hearingDate || null,
    hearingTime || null,
    venue || null,
    minutes || null,
    outcome || null,
    attendance ? JSON.stringify(attendance) : null,
    now,
    id
  );

  // Record history
  const historyAction = status ? (status === 'Rescheduled' ? 'RESCHEDULED' : status === 'Cancelled' ? 'CANCELLED' : 'UPDATED') : 'UPDATED';
  db.prepare(`
    INSERT INTO hearing_history (id, hearing_id, action, notes, changed_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    `hh-${Date.now()}`,
    id,
    historyAction,
    actionNotes || `Hearing updated by ${user.full_name}. Status: ${status || hearing.status}.`,
    user.id,
    now
  );

  logAudit(user.id, user.full_name, user.role, 'UPDATE_HEARING', 'Hearing', id, `Updated hearing ${hearing.ref_number}.`, req);

  res.json({ message: 'Hearing record updated successfully.' });
});

// Soft-Archive Hearing
router.post('/:id/archive', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const user = req.user!;

  if (!reason) {
    res.status(400).json({ error: 'Archive reason required.' });
    return;
  }

  const now = new Date().toISOString();
  db.prepare('UPDATE hearings SET archived_at = ?, archived_by = ?, archive_reason = ?, updated_at = ? WHERE id = ?')
    .run(now, user.id, reason, now, id);

  logAudit(user.id, user.full_name, user.role, 'ARCHIVE_HEARING', 'Hearing', id, `Archived hearing. Reason: ${reason}`, req);
  res.json({ message: 'Hearing record safely archived.' });
});

// Get Hearing History
router.get('/:id/history', requireAuth, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const history = db.prepare(`
    SELECT hh.*, u.full_name as changer_name, u.role as changer_role
    FROM hearing_history hh
    JOIN users u ON hh.changed_by = u.id
    WHERE hh.hearing_id = ?
    ORDER BY hh.created_at DESC
  `).all(id);

  res.json({ history });
});

export default router;

