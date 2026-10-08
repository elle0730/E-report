import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { requireAuth, AuthRequest, requireRole } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';

const router = Router();

// Get File Tree Items (List contents of a folder or root, with breadcrumbs)
router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { parentId, filter, search } = req.query; // filter: 'all' | 'starred' | 'recent'

  let query = 'SELECT * FROM file_tree WHERE archived_at IS NULL';
  const params: any[] = [];

  // Permissions check
  if (user.role === 'resident') {
    // Residents only see items with permissions 'resident_view' or owned by them
    query += " AND (permissions = 'resident_view' OR owner_id = ?)";
    params.push(user.id);
  } else if (user.role === 'admin') {
    // Admins see anything not marked 'super_admin_only'
    query += " AND permissions != 'super_admin_only'";
  }

  if (filter === 'starred') {
    query += ' AND is_starred = 1';
  } else if (filter === 'recent') {
    query += ' ORDER BY updated_at DESC LIMIT 20';
  } else if (search) {
    query += ' AND (name LIKE ? OR path LIKE ? OR metadata_json LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  } else {
    if (parentId) {
      query += ' AND parent_id = ?';
      params.push(parentId);
    } else {
      query += ' AND parent_id IS NULL';
    }
  }

  if (filter !== 'recent') {
    query += ' ORDER BY type ASC, name ASC'; // folders first, then files
  }

  const items = db.prepare(query).all(...params) as any[];

  // Get current folder info and breadcrumbs
  let currentFolder = null;
  const breadcrumbs: { id: string; name: string }[] = [];

  if (parentId) {
    currentFolder = db.prepare('SELECT * FROM file_tree WHERE id = ?').get(parentId) as any;
    let curr = currentFolder;
    while (curr) {
      breadcrumbs.unshift({ id: curr.id, name: curr.name });
      if (curr.parent_id) {
        curr = db.prepare('SELECT * FROM file_tree WHERE id = ?').get(curr.parent_id) as any;
      } else {
        break;
      }
    }
  }

  res.json({ items, currentFolder, breadcrumbs });
});

// Create Folder
router.post('/folder', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthRequest, res: Response) => {
  const { name, parentId, permissions = 'admin_super_admin' } = req.body;
  const user = req.user!;

  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Folder name is required.' });
    return;
  }

  let folderPath = `/${name.trim()}`;
  if (parentId) {
    const parent = db.prepare('SELECT path FROM file_tree WHERE id = ?').get(parentId) as any;
    if (parent) {
      folderPath = `${parent.path}/${name.trim()}`;
    }
  }

  const id = `fld-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO file_tree (
      id, parent_id, owner_id, type, name, path, permissions, version, is_starred, created_at, updated_at
    ) VALUES (
      ?, ?, ?, 'folder', ?, ?, ?, 1, 0, ?, ?
    )
  `).run(id, parentId || null, user.id, name.trim(), folderPath, permissions, now, now);

  logAudit(user.id, user.full_name, user.role, 'CREATE_FOLDER', 'FileTree', id, `Created folder "${name}".`, req);

  res.status(201).json({ message: 'Folder created successfully.', folderId: id });
});

// Create / Upload File Entry
router.post('/file', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthRequest, res: Response) => {
  const { name, parentId, fileUrl, size = 1024, mimeType = 'application/pdf', permissions = 'admin_super_admin', metadata = {} } = req.body;
  const user = req.user!;

  if (!name || !fileUrl) {
    res.status(400).json({ error: 'File name and file URL are required.' });
    return;
  }

  let filePath = `/${name.trim()}`;
  if (parentId) {
    const parent = db.prepare('SELECT path FROM file_tree WHERE id = ?').get(parentId) as any;
    if (parent) {
      filePath = `${parent.path}/${name.trim()}`;
    }
  }

  const id = `fil-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO file_tree (
      id, parent_id, owner_id, type, name, path, file_url, size, mime_type,
      metadata_json, permissions, version, is_starred, created_at, updated_at
    ) VALUES (
      ?, ?, ?, 'file', ?, ?, ?, ?, ?,
      ?, ?, 1, 0, ?, ?
    )
  `).run(
    id,
    parentId || null,
    user.id,
    name.trim(),
    filePath,
    fileUrl,
    size,
    mimeType,
    JSON.stringify(metadata),
    permissions,
    now,
    now
  );

  logAudit(user.id, user.full_name, user.role, 'UPLOAD_FILE', 'FileTree', id, `Uploaded file "${name}".`, req);

  res.status(201).json({ message: 'File created successfully.', fileId: id });
});

// Toggle Starred
router.post('/:id/star', requireAuth, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const item = db.prepare('SELECT id, is_starred FROM file_tree WHERE id = ?').get(id) as any;
  if (!item) {
    res.status(404).json({ error: 'Item not found.' });
    return;
  }

  const newStarred = item.is_starred === 1 ? 0 : 1;
  db.prepare('UPDATE file_tree SET is_starred = ? WHERE id = ?').run(newStarred, id);

  res.json({ message: newStarred ? 'Starred' : 'Unstarred', isStarred: newStarred });
});

// Soft-Archive File or Folder
router.post('/:id/archive', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const user = req.user!;

  if (!reason) {
    res.status(400).json({ error: 'Archive reason required.' });
    return;
  }

  const now = new Date().toISOString();
  db.prepare('UPDATE file_tree SET archived_at = ?, archived_by = ?, archive_reason = ?, updated_at = ? WHERE id = ?')
    .run(now, user.id, reason, now, id);

  logAudit(user.id, user.full_name, user.role, 'ARCHIVE_FILE_ITEM', 'FileTree', id, `Archived item. Reason: ${reason}`, req);

  res.json({ message: 'Item safely archived.' });
});

export default router;

