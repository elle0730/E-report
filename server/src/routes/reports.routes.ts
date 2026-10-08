import { Router, Response } from 'express';
import { db, generateReferenceNumber } from '../db/index.js';
import { requireAuth, AuthRequest, requireRole } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';

const router = Router();

// Create / Submit a report
router.post('/', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const {
      categoryId,
      title,
      description,
      locationDetails,
      incidentDate,
      attachments = [],
      helperName,
      isWalkInAssist,
      targetResidentId
    } = req.body;

    const user = req.user!;
    let residentId = user.id;
    let filedWithAssistance = 0;
    let effectiveHelper = helperName || null;

    // Walk-in assist mode: Admin filing on behalf of a resident
    if (isWalkInAssist && (user.role === 'admin' || user.role === 'super_admin')) {
      if (!targetResidentId) {
        res.status(400).json({ error: 'For walk-in assist mode, a resident account must be selected.' });
        return;
      }
      residentId = targetResidentId;
      filedWithAssistance = 1;
      effectiveHelper = `Filed with assistance by Barangay Staff: ${user.full_name} (${user.position || user.role})`;
    } else if (helperName) {
      filedWithAssistance = 1;
    }

    if (!categoryId || !title || !locationDetails) {
      res.status(400).json({ error: 'Category, title, and location details are required.' });
      return;
    }

    // Photo/Video only mode: Description is optional IF attachments exist
    if (!description && (!attachments || attachments.length === 0)) {
      res.status(400).json({ error: 'Please provide either a written description or attach photos/videos.' });
      return;
    }

    // Look up category default handler
    const category = db.prepare('SELECT id, name, default_handler_id FROM categories WHERE id = ?').get(categoryId) as any;
    if (!category) {
      res.status(400).json({ error: 'Selected category does not exist.' });
      return;
    }

    const assignedAdminId = category.default_handler_id || null;
    const refNumber = generateReferenceNumber('BSN', new Date().getFullYear());
    const id = `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO reports (
        id, ref_number, resident_id, category_id, title, description,
        location_details, incident_date, status, priority, filed_with_assistance,
        helper_name, assigned_admin_id, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, 'Pending', 'Normal', ?,
        ?, ?, ?, ?
      )
    `).run(
      id,
      refNumber,
      residentId,
      categoryId,
      title.trim(),
      description ? description.trim() : '(Report submitted via photo/video attachments)',
      locationDetails.trim(),
      incidentDate || now.split('T')[0],
      filedWithAssistance,
      effectiveHelper,
      assignedAdminId,
      now,
      now
    );

    // Save attachments
    if (attachments && Array.isArray(attachments)) {
      const insertAtt = db.prepare(`
        INSERT INTO report_attachments (id, report_id, file_path, file_name, file_size, mime_type, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const att of attachments) {
        const attId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        insertAtt.run(attId, id, att.filePath, att.fileName || 'attachment', att.fileSize || 0, att.mimeType || 'image/jpeg', now);
      }
    }

    // Auto-create file tree record for Google Drive style records if folder exists
    try {
      const fileTreeId = `file-rep-${id}`;
      db.prepare(`
        INSERT INTO file_tree (
          id, parent_id, owner_id, type, name, path, file_url, size, mime_type,
          metadata_json, permissions, version, created_at, updated_at
        ) VALUES (
          ?, 'folder-rep-2026', ?, 'file', ?, ?, ?, 1024, 'application/pdf',
          ?, 'admin_super_admin', 1, ?, ?
        )
      `).run(
        fileTreeId,
        user.id,
        `${refNumber} - ${title.trim()}.pdf`,
        `/Reports & Concerns/2026 Concerns/${refNumber} - ${title.trim()}.pdf`,
        `/reports/${refNumber}`,
        JSON.stringify({ refNumber, title, residentId, location: locationDetails }),
        now,
        now
      );
    } catch (ftErr) {
      console.warn('File tree auto-record notice:', ftErr);
    }

    // Notify staff
    const staffMembers = db.prepare("SELECT id FROM users WHERE role IN ('admin', 'super_admin')").all() as { id: string }[];
    const notifStmt = db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, link, is_read, created_at)
      VALUES (?, ?, 'New Community Concern Filed', ?, '/admin/reports', 0, ?)
    `);
    for (const staff of staffMembers) {
      notifStmt.run(`not-${Date.now()}-${Math.random().toString(36).substring(2, 6)}-${staff.id}`, staff.id, `New report ${refNumber} received: "${title.trim()}".`, now);
    }

    logAudit(user.id, user.full_name, user.role, 'CREATE_REPORT', 'Report', id, `Submitted report ${refNumber} (${title}).`, req);

    res.status(201).json({
      message: 'Your report has been successfully submitted to Barangay Bensican.',
      reportId: id,
      refNumber,
      status: 'Pending'
    });
  } catch (err: any) {
    console.error('Submit report error:', err);
    res.status(500).json({ error: 'Failed to submit report. Please try again or call the Barangay hall.' });
  }
});

// List reports
router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { status, categoryId, search, priority } = req.query;

  let query = `
    SELECT r.id, r.ref_number, r.resident_id, r.category_id, r.title, r.description,
           r.location_details, r.incident_date, r.status, r.priority, r.filed_with_assistance,
           r.helper_name, r.assigned_admin_id, r.outcome, r.resolution_date, r.created_at, r.updated_at,
           r.archived_at, r.archived_by,
           c.name as category_name, c.icon as category_icon,
           res.full_name as resident_name, res.contact_number as resident_contact,
           adm.full_name as assigned_admin_name, adm.position as assigned_admin_position, adm.photo_url as assigned_admin_photo
    FROM reports r
    LEFT JOIN categories c ON r.category_id = c.id
    LEFT JOIN users res ON r.resident_id = res.id
    LEFT JOIN users adm ON r.assigned_admin_id = adm.id
    WHERE r.archived_at IS NULL
  `;
  const params: any[] = [];

  // RBAC Access Rules:
  // Resident sees only their own reports
  if (user.role === 'resident') {
    query += ' AND r.resident_id = ?';
    params.push(user.id);
  } else if (user.role === 'admin') {
    // Admin sees reports assigned to them OR unassigned queue
    query += ' AND (r.assigned_admin_id = ? OR r.assigned_admin_id IS NULL)';
    params.push(user.id);
  } // Super admin sees all

  if (status) {
    query += ' AND r.status = ?';
    params.push(status);
  }

  if (categoryId) {
    query += ' AND r.category_id = ?';
    params.push(categoryId);
  }

  if (priority) {
    query += ' AND r.priority = ?';
    params.push(priority);
  }

  if (search) {
    // Flexible search: handles dashes, no dashes, lowercase
    const cleanSearch = (search as string).trim();
    const strippedSearch = cleanSearch.replace(/-/g, '').toLowerCase();
    query += ` AND (
      r.title LIKE ?
      OR r.description LIKE ?
      OR r.location_details LIKE ?
      OR r.ref_number LIKE ?
      OR LOWER(REPLACE(r.ref_number, '-', '')) LIKE ?
      OR res.full_name LIKE ?
    )`;
    const likeTerm = `%${cleanSearch}%`;
    const likeStripped = `%${strippedSearch}%`;
    params.push(likeTerm, likeTerm, likeTerm, likeTerm, likeStripped, likeTerm);
  }

  query += ' ORDER BY r.created_at DESC';

  const reports = db.prepare(query).all(...params);
  res.json({ reports });
});

// Get single report by reference number or ID (IDOR protected!)
router.get('/:refOrId', requireAuth, (req: AuthRequest, res: Response) => {
  const { refOrId } = req.params;
  const user = req.user!;

  // Strip dashes for flexible lookup
  const cleanTerm = refOrId.trim();
  const stripped = cleanTerm.replace(/-/g, '').toLowerCase();

  const report = db.prepare(`
    SELECT r.*,
           c.name as category_name, c.icon as category_icon,
           res.full_name as resident_name, res.contact_number as resident_contact, res.street as resident_street,
           adm.full_name as assigned_admin_name, adm.position as assigned_admin_position, adm.photo_url as assigned_admin_photo
    FROM reports r
    LEFT JOIN categories c ON r.category_id = c.id
    LEFT JOIN users res ON r.resident_id = res.id
    LEFT JOIN users adm ON r.assigned_admin_id = adm.id
    WHERE r.id = ? OR r.ref_number = ? OR LOWER(REPLACE(r.ref_number, '-', '')) = ?
  `).get(cleanTerm, cleanTerm, stripped) as any;

  if (!report) {
    res.status(404).json({ error: 'Report not found. Please double-check your reference number.' });
    return;
  }

  // IDOR Protection: Resident can only view their own report!
  if (user.role === 'resident' && report.resident_id !== user.id) {
    logAudit(user.id, user.full_name, user.role, 'UNAUTHORIZED_ACCESS_ATTEMPT', 'Report', report.id, 'Resident attempted to access unauthorized report (IDOR blocked).', req);
    res.status(403).json({ error: 'Access denied. You do not have permission to view this report.' });
    return;
  }

  // Load attachments
  const attachments = db.prepare('SELECT * FROM report_attachments WHERE report_id = ? ORDER BY created_at ASC').all(report.id);

  // Load follow-ups thread
  const followups = db.prepare(`
    SELECT f.*, u.full_name as sender_name, u.role as sender_role, u.photo_url as sender_photo
    FROM report_followups f
    JOIN users u ON f.sender_id = u.id
    WHERE f.report_id = ?
    ORDER BY f.created_at ASC
  `).all(report.id);

  // Load hearings associated with this report
  const hearings = db.prepare('SELECT * FROM hearings WHERE report_id = ? AND archived_at IS NULL ORDER BY hearing_date ASC').all(report.id);

  // Load subpoenas associated with this report
  const subpoenas = db.prepare('SELECT * FROM subpoenas WHERE report_id = ? AND archived_at IS NULL ORDER BY created_at DESC').all(report.id);

  res.json({
    report: {
      ...report,
      attachments,
      followups,
      hearings,
      subpoenas
    }
  });
});

// Update Report Status, Handler, Priority, or Resolution
router.patch('/:id', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, assignedAdminId, priority, outcome } = req.body;
  const user = req.user!;

  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(id) as any;
  if (!report) {
    res.status(404).json({ error: 'Report not found.' });
    return;
  }

  // Admin cannot reassign report from another admin unless they are Super Admin
  if (assignedAdminId && assignedAdminId !== report.assigned_admin_id && user.role !== 'super_admin') {
    if (report.assigned_admin_id && report.assigned_admin_id !== user.id) {
      res.status(403).json({ error: 'Only the Super Admin can reassign reports between different Admins.' });
      return;
    }
  }

  const now = new Date().toISOString();
  let resolutionDate = report.resolution_date;
  if (status === 'Resolved' && report.status !== 'Resolved') {
    resolutionDate = now;
  }

  db.prepare(`
    UPDATE reports SET
      status = COALESCE(?, status),
      assigned_admin_id = COALESCE(?, assigned_admin_id),
      priority = COALESCE(?, priority),
      outcome = COALESCE(?, outcome),
      resolution_date = ?,
      updated_at = ?
    WHERE id = ?
  `).run(status || null, assignedAdminId || null, priority || null, outcome || null, resolutionDate, now, id);

  // Notify resident of status update
  if (status && status !== report.status) {
    const notifId = `not-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, link, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `).run(
      notifId,
      report.resident_id,
      `Report Status: ${status}`,
      `Your report ${report.ref_number} is now marked as "${status}".`,
      `/track/${report.ref_number}`,
      now
    );
  }

  logAudit(user.id, user.full_name, user.role, 'UPDATE_REPORT', 'Report', id, `Updated report ${report.ref_number} (Status: ${status || report.status}, Priority: ${priority || report.priority}).`, req);

  res.json({ message: 'Report updated successfully.' });
});

// Add Follow-up Note or Admin Information Request
router.post('/:id/followups', requireAuth, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { message, isAdminRequest, attachments = [] } = req.body;
  const user = req.user!;

  if (!message || !message.trim()) {
    res.status(400).json({ error: 'Message content is required.' });
    return;
  }

  const report = db.prepare('SELECT id, ref_number, resident_id, assigned_admin_id FROM reports WHERE id = ?').get(id) as any;
  if (!report) {
    res.status(404).json({ error: 'Report not found.' });
    return;
  }

  // IDOR check
  if (user.role === 'resident' && report.resident_id !== user.id) {
    res.status(403).json({ error: 'Access denied.' });
    return;
  }

  const followupId = `fol-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO report_followups (id, report_id, sender_id, message, is_admin_request, attachments_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(followupId, id, user.id, message.trim(), isAdminRequest ? 1 : 0, JSON.stringify(attachments), now);

  // Notify the other party
  const notifId = `not-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
  if (user.role === 'resident') {
    // Notify staff
    const targetStaff = db.prepare("SELECT id FROM users WHERE id = ? OR role = 'super_admin'").all(report.assigned_admin_id || 'user-admin-01') as { id: string }[];
    const notifStmt = db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, link, is_read, created_at)
      VALUES (?, ?, 'New Resident Follow-up', ?, ?, 0, ?)
    `);
    for (const s of targetStaff) {
      notifStmt.run(`not-${Date.now()}-${Math.random().toString(36).substring(2, 6)}-${s.id}`, s.id, `Resident added a follow-up to report ${report.ref_number}.`, `/admin/reports/${report.id}`, now);
    }
  } else {
    // Staff notifying resident
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, link, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `).run(
      notifId,
      report.resident_id,
      isAdminRequest ? 'Barangay Staff Requested Additional Details' : 'Barangay Staff Reply',
      `Message regarding your report ${report.ref_number}: "${message.trim().substring(0, 80)}..."`,
      `/track/${report.ref_number}`,
      now
    );
  }

  logAudit(user.id, user.full_name, user.role, 'ADD_FOLLOWUP', 'Report', id, `Added follow-up to ${report.ref_number}.`, req);

  res.status(201).json({ message: 'Follow-up posted successfully.', followupId });
});

// Soft-Archive Report (Archive only, no hard deletes!)
router.post('/:id/archive', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const user = req.user!;

  if (!reason) {
    res.status(400).json({ error: 'Reason for archiving is required.' });
    return;
  }

  const report = db.prepare('SELECT id, ref_number FROM reports WHERE id = ?').get(id) as any;
  if (!report) {
    res.status(404).json({ error: 'Report not found.' });
    return;
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE reports SET
      archived_at = ?,
      archived_by = ?,
      archive_reason = ?,
      updated_at = ?
    WHERE id = ?
  `).run(now, user.id, reason, now, id);

  logAudit(user.id, user.full_name, user.role, 'ARCHIVE_REPORT', 'Report', id, `Archived report ${report.ref_number}. Reason: ${reason}`, req);

  res.json({ message: `Report ${report.ref_number} has been safely archived.` });
});

export default router;

