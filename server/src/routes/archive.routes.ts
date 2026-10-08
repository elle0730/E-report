import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { requireAuth, AuthRequest, requireRole, verifySuperAdminPassword } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';

const router = Router();

// List all archived items across modules
router.get('/', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthRequest, res: Response) => {
  const { type, search } = req.query;

  const items: any[] = [];

  // 1. Archived Reports
  if (!type || type === 'reports') {
    const repQuery = `
      SELECT 'report' as item_type, r.id, r.ref_number as title, r.title as subtitle,
             r.archived_at, r.archived_by, r.archive_reason, u.full_name as archived_by_name
      FROM reports r
      LEFT JOIN users u ON r.archived_by = u.id
      WHERE r.archived_at IS NOT NULL
    `;
    items.push(...db.prepare(repQuery).all());
  }

  // 2. Archived Hearings
  if (!type || type === 'hearings') {
    const hrgQuery = `
      SELECT 'hearing' as item_type, h.id, h.ref_number as title, h.purpose as subtitle,
             h.archived_at, h.archived_by, h.archive_reason, u.full_name as archived_by_name
      FROM hearings h
      LEFT JOIN users u ON h.archived_by = u.id
      WHERE h.archived_at IS NOT NULL
    `;
    items.push(...db.prepare(hrgQuery).all());
  }

  // 3. Archived Subpoenas
  if (!type || type === 'subpoenas') {
    const subQuery = `
      SELECT 'subpoena' as item_type, s.id, s.ref_number as title, s.reason as subtitle,
             s.archived_at, s.archived_by, s.archive_reason, u.full_name as archived_by_name
      FROM subpoenas s
      LEFT JOIN users u ON s.archived_by = u.id
      WHERE s.archived_at IS NOT NULL
    `;
    items.push(...db.prepare(subQuery).all());
  }

  // 4. Archived Bills
  if (!type || type === 'bills') {
    const billQuery = `
      SELECT 'bill' as item_type, b.id, b.title as title, '₱' || b.amount || ' - ' || b.payee as subtitle,
             b.archived_at, b.archived_by, b.archive_reason, u.full_name as archived_by_name
      FROM bills b
      LEFT JOIN users u ON b.archived_by = u.id
      WHERE b.archived_at IS NOT NULL
    `;
    items.push(...db.prepare(billQuery).all());
  }

  // 5. Archived Users
  if (!type || type === 'users') {
    const usrQuery = `
      SELECT 'user' as item_type, u.id, u.full_name as title, u.email || ' (' || u.role || ')' as subtitle,
             u.archived_at, u.archived_by, 'Account archived' as archive_reason, archiver.full_name as archived_by_name
      FROM users u
      LEFT JOIN users archiver ON u.archived_by = archiver.id
      WHERE u.archived_at IS NOT NULL
    `;
    items.push(...db.prepare(usrQuery).all());
  }

  // 6. Archived Announcements
  if (!type || type === 'announcements') {
    const annQuery = `
      SELECT 'announcement' as item_type, a.id, a.title as title, a.target_group as subtitle,
             a.archived_at, a.archived_by, a.archive_reason, u.full_name as archived_by_name
      FROM announcements a
      LEFT JOIN users u ON a.archived_by = u.id
      WHERE a.archived_at IS NOT NULL
    `;
    items.push(...db.prepare(annQuery).all());
  }

  // Filter if search
  let filtered = items;
  if (search) {
    const s = (search as string).toLowerCase();
    filtered = items.filter(i => (i.title && i.title.toLowerCase().includes(s)) || (i.subtitle && i.subtitle.toLowerCase().includes(s)) || (i.archive_reason && i.archive_reason.toLowerCase().includes(s)));
  }

  filtered.sort((a, b) => new Date(b.archived_at).getTime() - new Date(a.archived_at).getTime());

  // Also get pending restore requests
  const restoreRequests = db.prepare(`
    SELECT r.*, req.full_name as requester_name
    FROM archive_restore_requests r
    JOIN users req ON r.requested_by = req.id
    ORDER BY r.created_at DESC
  `).all();

  res.json({ items: filtered, restoreRequests });
});

// Restore Archived Item (SUPER ADMIN ONLY, requires password confirmation!)
router.post('/restore', requireAuth, requireRole(['super_admin']), (req: AuthRequest, res: Response) => {
  const { itemType, itemId, superAdminPassword } = req.body;
  const user = req.user!;

  if (!superAdminPassword || !verifySuperAdminPassword(user.id, superAdminPassword)) {
    res.status(401).json({ error: 'Super Admin password re-verification required to restore archived data.', requiresPassword: true });
    return;
  }

  const now = new Date().toISOString();
  let tableName = '';

  switch (itemType) {
    case 'report': tableName = 'reports'; break;
    case 'hearing': tableName = 'hearings'; break;
    case 'subpoena': tableName = 'subpoenas'; break;
    case 'bill': tableName = 'bills'; break;
    case 'announcement': tableName = 'announcements'; break;
    case 'user':
      db.prepare("UPDATE users SET archived_at = NULL, archived_by = NULL, status = 'active', updated_at = ? WHERE id = ?").run(now, itemId);
      tableName = 'users';
      break;
    default:
      res.status(400).json({ error: 'Unsupported item type.' });
      return;
  }

  if (tableName !== 'users') {
    db.prepare(`UPDATE ${tableName} SET archived_at = NULL, archived_by = NULL, archive_reason = NULL, updated_at = ? WHERE id = ?`).run(now, itemId);
  }

  // If there was a pending restore request for this item, mark it Approved
  db.prepare("UPDATE archive_restore_requests SET status = 'Approved', reviewed_by = ? WHERE item_id = ?").run(user.id, itemId);

  logAudit(user.id, user.full_name, user.role, 'RESTORE_ARCHIVED_ITEM', tableName, itemId, `Restored archived ${itemType} item.`, req);

  res.json({ message: `Archived ${itemType} item has been restored to active status.` });
});

// Request Restore (Admin requests Super Admin)
router.post('/request-restore', requireAuth, requireRole(['admin']), (req: AuthRequest, res: Response) => {
  const { itemType, itemId, itemName, reason } = req.body;
  const user = req.user!;

  if (!itemType || !itemId || !reason) {
    res.status(400).json({ error: 'Item type, item ID, and reason are required.' });
    return;
  }

  const id = `arr-${Date.now()}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO archive_restore_requests (id, item_type, item_id, item_name, requested_by, reason, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?)
  `).run(id, itemType, itemId, itemName || itemId, user.id, reason.trim(), now);

  // Notify Super Admin
  const superAdmins = db.prepare("SELECT id FROM users WHERE role = 'super_admin'").all() as { id: string }[];
  const notifStmt = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, link, is_read, created_at)
    VALUES (?, ?, 'Archive Restore Request', ?, '/admin/archive', 0, ?)
  `);
  for (const sa of superAdmins) {
    notifStmt.run(`not-${Date.now()}-${Math.random().toString(36).substring(2, 6)}-${sa.id}`, sa.id, `Admin ${user.full_name} requested restore of ${itemType} "${itemName || itemId}".`, now);
  }

  logAudit(user.id, user.full_name, user.role, 'REQUEST_RESTORE', 'Archive', itemId, `Requested Super Admin restore for ${itemType}. Reason: ${reason}`, req);

  res.status(201).json({ message: 'Restore request sent to Super Admin for approval.' });
});

export default router;

