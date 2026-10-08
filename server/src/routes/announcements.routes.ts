import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { requireAuth, AuthRequest, requireRole } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';

const router = Router();

// List Announcements (Public or Resident or Staff)
router.get('/', (req, res: Response) => {
  const { targetGroup, pinnedOnly } = req.query;

  let query = `
    SELECT a.*, u.full_name as author_name, u.position as author_position
    FROM announcements a
    LEFT JOIN users u ON a.created_by = u.id
    WHERE a.archived_at IS NULL
  `;
  const params: any[] = [];

  if (targetGroup) {
    query += ' AND (a.target_group = ? OR a.target_group = "All Residents")';
    params.push(targetGroup);
  }

  if (pinnedOnly === 'true') {
    query += ' AND a.is_pinned = 1';
  }

  query += ' ORDER BY a.is_pinned DESC, a.created_at DESC';

  const announcements = db.prepare(query).all(...params);
  res.json({ announcements });
});

// Create Announcement (Admin and Super Admin)
router.post('/', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthRequest, res: Response) => {
  try {
    const { title, content, targetGroup = 'All Residents', isPinned = false, scheduledAt } = req.body;
    const user = req.user!;

    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required.' });
      return;
    }

    const id = `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO announcements (
        id, title, content, target_group, is_pinned, scheduled_at, created_by, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `).run(
      id,
      title.trim(),
      content.trim(),
      targetGroup,
      isPinned ? 1 : 0,
      scheduledAt || null,
      user.id,
      now,
      now
    );

    // Notify all residents
    const residents = db.prepare("SELECT id FROM users WHERE role = 'resident' AND status = 'active'").all() as { id: string }[];
    const notifStmt = db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, link, is_read, created_at)
      VALUES (?, ?, ?, ?, '/resident/announcements', 0, ?)
    `);
    const shortContent = content.trim().substring(0, 80) + '...';
    for (const res of residents) {
      notifStmt.run(`not-${Date.now()}-${Math.random().toString(36).substring(2, 6)}-${res.id}`, res.id, `Barangay Announcement: ${title.trim()}`, shortContent, now);
    }

    logAudit(user.id, user.full_name, user.role, 'CREATE_ANNOUNCEMENT', 'Announcement', id, `Posted announcement "${title}".`, req);

    res.status(201).json({ message: 'Announcement published successfully.', announcementId: id });
  } catch (err: any) {
    console.error('Create announcement error:', err);
    res.status(500).json({ error: 'Failed to create announcement.' });
  }
});

// Update Announcement (Admin and Super Admin)
router.put('/:id', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, content, targetGroup, isPinned, scheduledAt } = req.body;
  const user = req.user!;

  const existing = db.prepare('SELECT id, title FROM announcements WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Announcement not found.' });
    return;
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE announcements SET
      title = COALESCE(?, title),
      content = COALESCE(?, content),
      target_group = COALESCE(?, target_group),
      is_pinned = COALESCE(?, is_pinned),
      scheduled_at = COALESCE(?, scheduled_at),
      updated_at = ?
    WHERE id = ?
  `).run(
    title ? title.trim() : null,
    content ? content.trim() : null,
    targetGroup || null,
    isPinned !== undefined ? (isPinned ? 1 : 0) : null,
    scheduledAt || null,
    now,
    id
  );

  logAudit(user.id, user.full_name, user.role, 'UPDATE_ANNOUNCEMENT', 'Announcement', id, `Updated announcement "${existing.title}".`, req);

  res.json({ message: 'Announcement updated successfully.' });
});

// Soft-Archive Announcement
router.post('/:id/archive', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const user = req.user!;

  if (!reason) {
    res.status(400).json({ error: 'Archive reason required.' });
    return;
  }

  const ann = db.prepare('SELECT id, title FROM announcements WHERE id = ?').get(id) as any;
  if (!ann) {
    res.status(404).json({ error: 'Announcement not found.' });
    return;
  }

  const now = new Date().toISOString();
  db.prepare('UPDATE announcements SET archived_at = ?, archived_by = ?, archive_reason = ?, updated_at = ? WHERE id = ?')
    .run(now, user.id, reason, now, id);

  logAudit(user.id, user.full_name, user.role, 'ARCHIVE_ANNOUNCEMENT', 'Announcement', id, `Archived announcement "${ann.title}". Reason: ${reason}`, req);

  res.json({ message: 'Announcement safely archived.' });
});

export default router;

