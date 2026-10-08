import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { requireAuth, AuthRequest, requireRole, verifySuperAdminPassword } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';

const router = Router();

// Public: Get published landing page content
router.get('/published', (req, res: Response) => {
  const cms = db.prepare(`
    SELECT * FROM landing_page_cms
    WHERE is_published = 1
    ORDER BY version DESC LIMIT 1
  `).get() as any;

  if (!cms) {
    res.status(404).json({ error: 'No published landing page version found.' });
    return;
  }

  res.json({
    version: cms.version,
    content: JSON.parse(cms.content_json),
    publishedAt: cms.updated_at
  });
});

// Staff: Get current draft or latest published version
router.get('/current', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthRequest, res: Response) => {
  const latestDraft = db.prepare(`
    SELECT c.*, u.full_name as draft_saved_by_name
    FROM landing_page_cms c
    LEFT JOIN users u ON c.draft_saved_by = u.id
    WHERE c.is_published = 0
    ORDER BY c.created_at DESC LIMIT 1
  `).get() as any;

  const latestPublished = db.prepare(`
    SELECT c.*, u.full_name as published_by_name
    FROM landing_page_cms c
    LEFT JOIN users u ON c.approved_by = u.id
    WHERE c.is_published = 1
    ORDER BY c.version DESC LIMIT 1
  `).get() as any;

  const versions = db.prepare(`
    SELECT c.id, c.version, c.is_published, c.created_at, c.updated_at,
           sav.full_name as saved_by_name,
           app.full_name as approved_by_name
    FROM landing_page_cms c
    LEFT JOIN users sav ON c.draft_saved_by = sav.id
    LEFT JOIN users app ON c.approved_by = app.id
    ORDER BY c.created_at DESC
  `).all();

  res.json({
    draft: latestDraft ? { ...latestDraft, content: JSON.parse(latestDraft.content_json) } : null,
    published: latestPublished ? { ...latestPublished, content: JSON.parse(latestPublished.content_json) } : null,
    versions
  });
});

// Save Draft (Admin & Super Admin can save drafts)
router.post('/draft', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthRequest, res: Response) => {
  const { content } = req.body;
  const user = req.user!;

  if (!content) {
    res.status(400).json({ error: 'Content is required.' });
    return;
  }

  // Get current max version
  const maxVer = db.prepare('SELECT MAX(version) as max_v FROM landing_page_cms').get() as { max_v: number | null };
  const nextVer = (maxVer?.max_v || 1) + 1;

  const id = `cms-draft-${Date.now()}`;
  const now = new Date().toISOString();

  // If there is an existing unpublished draft, update it, or insert new
  const existingDraft = db.prepare('SELECT id FROM landing_page_cms WHERE is_published = 0').get() as { id: string } | undefined;

  if (existingDraft) {
    db.prepare(`
      UPDATE landing_page_cms SET
        content_json = ?,
        draft_saved_by = ?,
        updated_at = ?
      WHERE id = ?
    `).run(JSON.stringify(content), user.id, now, existingDraft.id);

    logAudit(user.id, user.full_name, user.role, 'UPDATE_CMS_DRAFT', 'CMS', existingDraft.id, 'Updated existing landing page draft.', req);
    res.json({ message: 'Landing page draft updated successfully.', draftId: existingDraft.id });
  } else {
    db.prepare(`
      INSERT INTO landing_page_cms (
        id, version, is_published, content_json, draft_saved_by, created_at, updated_at
      ) VALUES (
        ?, ?, 0, ?, ?, ?, ?
      )
    `).run(id, nextVer, JSON.stringify(content), user.id, now, now);

    logAudit(user.id, user.full_name, user.role, 'CREATE_CMS_DRAFT', 'CMS', id, 'Created new landing page draft awaiting Super Admin approval.', req);
    res.status(201).json({ message: 'Landing page draft saved. Awaiting Super Admin approval to publish.', draftId: id });
  }
});

// Approve & Publish Draft (SUPER ADMIN ONLY, requires password confirmation!)
router.post('/publish', requireAuth, requireRole(['super_admin']), (req: AuthRequest, res: Response) => {
  const { draftId, superAdminPassword } = req.body;
  const user = req.user!;

  if (!superAdminPassword || !verifySuperAdminPassword(user.id, superAdminPassword)) {
    res.status(401).json({ error: 'Super Admin password re-verification required to publish changes to the public website.', requiresPassword: true });
    return;
  }

  const draft = db.prepare('SELECT * FROM landing_page_cms WHERE id = ?').get(draftId) as any;
  if (!draft) {
    res.status(404).json({ error: 'Draft not found.' });
    return;
  }

  const now = new Date().toISOString();

  // Mark all previous versions as unpublished
  db.prepare('UPDATE landing_page_cms SET is_published = 0 WHERE is_published = 1').run();

  // Publish this draft
  db.prepare(`
    UPDATE landing_page_cms SET
      is_published = 1,
      approved_by = ?,
      updated_at = ?
    WHERE id = ?
  `).run(user.id, now, draftId);

  logAudit(user.id, user.full_name, user.role, 'PUBLISH_CMS', 'CMS', draftId, `Approved and published Landing Page version ${draft.version}.`, req);

  res.json({ message: `Landing page version ${draft.version} is now live and published!` });
});

// Rollback to Previous Version (SUPER ADMIN ONLY)
router.post('/rollback/:version', requireAuth, requireRole(['super_admin']), (req: AuthRequest, res: Response) => {
  const { version } = req.params;
  const { superAdminPassword } = req.body;
  const user = req.user!;

  if (!superAdminPassword || !verifySuperAdminPassword(user.id, superAdminPassword)) {
    res.status(401).json({ error: 'Super Admin password re-verification required to rollback landing page.', requiresPassword: true });
    return;
  }

  const targetVer = db.prepare('SELECT * FROM landing_page_cms WHERE version = ?').get(version) as any;
  if (!targetVer) {
    res.status(404).json({ error: 'Specified version not found in history.' });
    return;
  }

  const now = new Date().toISOString();
  db.prepare('UPDATE landing_page_cms SET is_published = 0 WHERE is_published = 1').run();
  db.prepare('UPDATE landing_page_cms SET is_published = 1, approved_by = ?, updated_at = ? WHERE id = ?').run(user.id, now, targetVer.id);

  logAudit(user.id, user.full_name, user.role, 'ROLLBACK_CMS', 'CMS', targetVer.id, `Rolled back Landing Page to version ${version}.`, req);

  res.json({ message: `Successfully rolled back to version ${version}.` });
});

export default router;

