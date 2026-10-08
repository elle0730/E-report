import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { requireAuth, AuthRequest, requireRole, verifySuperAdminPassword } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';

const router = Router();

// Public: Get all active categories & barangay info
router.get('/public', (req, res: Response) => {
  const categories = db.prepare('SELECT id, name, icon, description, sort_order FROM categories WHERE is_archived = 0 ORDER BY sort_order ASC').all();
  const infoRow = db.prepare("SELECT value_json FROM system_settings WHERE key = 'barangay_info'").get() as { value_json: string } | undefined;
  const venuesRow = db.prepare("SELECT value_json FROM system_settings WHERE key = 'venues'").get() as { value_json: string } | undefined;

  res.json({
    categories,
    barangayInfo: infoRow ? JSON.parse(infoRow.value_json) : null,
    venues: venuesRow ? JSON.parse(venuesRow.value_json) : []
  });
});

// Super Admin: Get all settings
router.get('/all', requireAuth, requireRole(['super_admin']), (req: AuthRequest, res: Response) => {
  const settingsRows = db.prepare('SELECT key, value_json, updated_at FROM system_settings').all() as any[];
  const categories = db.prepare(`
    SELECT c.*, u.full_name as default_handler_name
    FROM categories c
    LEFT JOIN users u ON c.default_handler_id = u.id
    ORDER BY c.sort_order ASC
  `).all();

  const settings: Record<string, any> = {};
  for (const s of settingsRows) {
    settings[s.key] = JSON.parse(s.value_json);
  }

  res.json({ settings, categories });
});

// Super Admin: Update a setting key (requires password confirmation for sensitive updates)
router.put('/:key', requireAuth, requireRole(['super_admin']), (req: AuthRequest, res: Response) => {
  const { key } = req.params;
  const { value, superAdminPassword } = req.body;
  const user = req.user!;

  if (key === 'barangay_info' || key === 'bensi_config') {
    if (!superAdminPassword || !verifySuperAdminPassword(user.id, superAdminPassword)) {
      res.status(401).json({ error: 'Super Admin password re-verification required to update core system configuration.', requiresPassword: true });
      return;
    }
  }

  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO system_settings (key, value_json, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at
  `).run(key, JSON.stringify(value), now);

  logAudit(user.id, user.full_name, user.role, 'UPDATE_SETTING', 'SystemSettings', key, `Updated system setting "${key}".`, req);

  res.json({ message: `Setting "${key}" updated successfully.` });
});

// Super Admin: Manage Categories (Create, Update, Archive)
router.post('/categories', requireAuth, requireRole(['super_admin']), (req: AuthRequest, res: Response) => {
  const { id, name, icon, description, defaultHandlerId, sortOrder, isArchived } = req.body;
  const user = req.user!;

  if (!name) {
    res.status(400).json({ error: 'Category name is required.' });
    return;
  }

  const now = new Date().toISOString();
  if (id) {
    db.prepare(`
      UPDATE categories SET
        name = ?,
        icon = COALESCE(?, icon),
        description = ?,
        default_handler_id = ?,
        sort_order = COALESCE(?, sort_order),
        is_archived = COALESCE(?, is_archived)
      WHERE id = ?
    `).run(name.trim(), icon || null, description || null, defaultHandlerId || null, sortOrder !== undefined ? sortOrder : null, isArchived !== undefined ? (isArchived ? 1 : 0) : null, id);

    logAudit(user.id, user.full_name, user.role, 'UPDATE_CATEGORY', 'Category', id, `Updated category "${name}".`, req);
    res.json({ message: 'Category updated.' });
  } else {
    const newId = `cat-${Date.now()}`;
    db.prepare(`
      INSERT INTO categories (id, name, icon, description, default_handler_id, sort_order, is_archived, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?)
    `).run(newId, name.trim(), icon || 'HelpCircle', description || null, defaultHandlerId || null, sortOrder || 99, now);

    logAudit(user.id, user.full_name, user.role, 'CREATE_CATEGORY', 'Category', newId, `Created category "${name}".`, req);
    res.status(201).json({ message: 'Category created.', categoryId: newId });
  }
});

export default router;

