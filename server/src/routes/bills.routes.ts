import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { requireAuth, AuthRequest, requireRole, verifySuperAdminPassword } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';

const router = Router();

// List Bills (Residents: Read-only transparency; Staff: Management view)
router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
  const { status, billType, search, month } = req.query;

  let query = `
    SELECT b.*, u.full_name as created_by_name, u.role as created_by_role
    FROM bills b
    LEFT JOIN users u ON b.created_by = u.id
    WHERE b.archived_at IS NULL
  `;
  const params: any[] = [];

  if (status) {
    query += ' AND b.status = ?';
    params.push(status);
  }

  if (billType) {
    query += ' AND b.bill_type = ?';
    params.push(billType);
  }

  if (search) {
    query += ' AND (b.title LIKE ? OR b.payee LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term);
  }

  if (month) {
    // format YYYY-MM
    query += ' AND b.due_date LIKE ?';
    params.push(`${month}%`);
  }

  query += ' ORDER BY b.due_date DESC, b.created_at DESC';

  const bills = db.prepare(query).all(...params) as any[];

  // Compute monthly totals & status breakdown
  let totalAmount = 0;
  let paidAmount = 0;
  let unpaidAmount = 0;
  let overdueAmount = 0;

  for (const b of bills) {
    totalAmount += b.amount;
    if (b.status === 'Paid') paidAmount += b.amount;
    else if (b.status === 'Unpaid') unpaidAmount += b.amount;
    else if (b.status === 'Overdue') overdueAmount += b.amount;
  }

  res.json({
    bills,
    summary: {
      totalAmount,
      paidAmount,
      unpaidAmount,
      overdueAmount,
      totalCount: bills.length
    }
  });
});

// Add Bill Entry (Admins and Super Admin can add)
router.post('/', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthRequest, res: Response) => {
  try {
    const { title, amount, dueDate, payee, status = 'Unpaid', billType, attachmentUrl } = req.body;
    const user = req.user!;

    if (!title || !amount || !dueDate || !payee || !billType) {
      res.status(400).json({ error: 'Title, amount, due date, payee, and bill type are required.' });
      return;
    }

    const id = `bill-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO bills (
        id, title, amount, due_date, payee, status, bill_type, attachment_url, created_by, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `).run(
      id,
      title.trim(),
      parseFloat(amount),
      dueDate,
      payee.trim(),
      status,
      billType.trim(),
      attachmentUrl || null,
      user.id,
      now,
      now
    );

    // Add to file tree under Bills
    db.prepare(`
      INSERT INTO file_tree (
        id, parent_id, owner_id, type, name, path, file_url, size, mime_type,
        metadata_json, permissions, version, created_at, updated_at
      ) VALUES (
        ?, 'folder-bills', ?, 'file', ?, ?, ?, 2048, 'application/pdf',
        ?, 'resident_view', 1, ?, ?
      )
    `).run(
      `file-${id}`,
      user.id,
      `${title.trim()}.pdf`,
      `/Barangay Bills & Financial Transparency/${title.trim()}.pdf`,
      attachmentUrl || '/uploads/bill-receipt.pdf',
      JSON.stringify({ amount, payee, status }),
      now,
      now
    );

    logAudit(user.id, user.full_name, user.role, 'CREATE_BILL', 'Bill', id, `Added bill record "${title}" (₱${amount}) to transparency ledger.`, req);

    res.status(201).json({ message: 'Bill recorded successfully.', billId: id });
  } catch (err: any) {
    console.error('Create bill error:', err);
    res.status(500).json({ error: 'Failed to record bill entry.' });
  }
});

// Edit Bill Entry (SUPER ADMIN ONLY! Admins are strictly prohibited)
router.put('/:id', requireAuth, requireRole(['super_admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, amount, dueDate, payee, status, billType, attachmentUrl } = req.body;
  const user = req.user!;

  const existing = db.prepare('SELECT id, title FROM bills WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Bill entry not found.' });
    return;
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE bills SET
      title = COALESCE(?, title),
      amount = COALESCE(?, amount),
      due_date = COALESCE(?, due_date),
      payee = COALESCE(?, payee),
      status = COALESCE(?, status),
      bill_type = COALESCE(?, bill_type),
      attachment_url = COALESCE(?, attachment_url),
      updated_at = ?
    WHERE id = ?
  `).run(
    title ? title.trim() : null,
    amount ? parseFloat(amount) : null,
    dueDate || null,
    payee ? payee.trim() : null,
    status || null,
    billType || null,
    attachmentUrl || null,
    now,
    id
  );

  logAudit(user.id, user.full_name, user.role, 'UPDATE_BILL', 'Bill', id, `Super Admin updated bill "${existing.title}".`, req);

  res.json({ message: 'Bill entry updated successfully.' });
});

// Soft-Archive Bill Entry (SUPER ADMIN ONLY! Admins are strictly prohibited)
router.post('/:id/archive', requireAuth, requireRole(['super_admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { reason, superAdminPassword } = req.body;
  const user = req.user!;

  if (!superAdminPassword || !verifySuperAdminPassword(user.id, superAdminPassword)) {
    res.status(401).json({ error: 'Super Admin password re-verification required to archive financial bills.', requiresPassword: true });
    return;
  }

  if (!reason) {
    res.status(400).json({ error: 'Archive reason required.' });
    return;
  }

  const bill = db.prepare('SELECT id, title FROM bills WHERE id = ?').get(id) as any;
  if (!bill) {
    res.status(404).json({ error: 'Bill not found.' });
    return;
  }

  const now = new Date().toISOString();
  db.prepare('UPDATE bills SET archived_at = ?, archived_by = ?, archive_reason = ?, updated_at = ? WHERE id = ?')
    .run(now, user.id, reason, now, id);

  logAudit(user.id, user.full_name, user.role, 'ARCHIVE_BILL', 'Bill', id, `Archived bill "${bill.title}". Reason: ${reason}`, req);

  res.json({ message: 'Bill record safely archived.' });
});

export default router;

