import { Router, Response } from 'express';
import { db, generateReferenceNumber } from '../db/index.js';
import { requireAuth, AuthRequest, requireRole } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';

const router = Router();

// List Subpoenas
router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { status } = req.query;

  let query = `
    SELECT s.*, r.ref_number as report_ref_number, r.title as report_title, r.resident_id
    FROM subpoenas s
    LEFT JOIN reports r ON s.report_id = r.id
    WHERE s.archived_at IS NULL
  `;
  const params: any[] = [];

  if (user.role === 'resident') {
    query += ' AND r.resident_id = ?';
    params.push(user.id);
  }

  if (status) {
    query += ' AND s.status = ?';
    params.push(status);
  }

  query += ' ORDER BY s.hearing_date DESC, s.created_at DESC';

  const subpoenas = db.prepare(query).all(...params);
  res.json({ subpoenas });
});

// Create Subpoena
router.post('/', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthRequest, res: Response) => {
  try {
    const {
      reportId,
      hearingId,
      caseNumber,
      respondent,
      complainant,
      hearingDate,
      hearingTime,
      venue,
      reason,
      signatory,
      signatoryTitle = 'Punong Barangay',
      status = 'Draft',
      templateId
    } = req.body;
    const user = req.user!;

    if (!reportId || !caseNumber || !respondent || !complainant || !hearingDate || !hearingTime || !venue || !reason || !signatory) {
      res.status(400).json({ error: 'All subpoena fields are required.' });
      return;
    }

    const report = db.prepare('SELECT id, ref_number, resident_id FROM reports WHERE id = ?').get(reportId) as any;
    if (!report) {
      res.status(404).json({ error: 'Report not found.' });
      return;
    }

    const refNumber = generateReferenceNumber('BSN-S', new Date().getFullYear());
    const id = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO subpoenas (
        id, ref_number, report_id, hearing_id, case_number,
        respondent, complainant, hearing_date, hearing_time,
        venue, reason, signatory, signatory_title, status,
        template_id, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?
      )
    `).run(
      id,
      refNumber,
      reportId,
      hearingId || null,
      caseNumber.trim(),
      respondent.trim(),
      complainant.trim(),
      hearingDate,
      hearingTime,
      venue.trim(),
      reason.trim(),
      signatory.trim(),
      signatoryTitle.trim(),
      status,
      templateId || null,
      now,
      now
    );

    // If issued/served, notify resident
    if (status === 'Issued' || status === 'Served') {
      const notifId = `not-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, link, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, 0, ?)
      `).run(
        notifId,
        report.resident_id,
        'Subpoena / Summons Issued',
        `Official subpoena ${refNumber} has been issued for case ${caseNumber} against ${respondent}.`,
        `/track/${report.ref_number}`,
        now
      );
    }

    logAudit(user.id, user.full_name, user.role, 'CREATE_SUBPOENA', 'Subpoena', id, `Created subpoena ${refNumber} for case ${caseNumber}.`, req);

    res.status(201).json({
      message: `Subpoena ${refNumber} created successfully.`,
      subpoenaId: id,
      refNumber
    });
  } catch (err: any) {
    console.error('Create subpoena error:', err);
    res.status(500).json({ error: 'Failed to create subpoena.' });
  }
});

// Update Subpoena Status
router.patch('/:id', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, hearingDate, hearingTime, venue, signatory, reason } = req.body;
  const user = req.user!;

  const subpoena = db.prepare('SELECT * FROM subpoenas WHERE id = ?').get(id) as any;
  if (!subpoena) {
    res.status(404).json({ error: 'Subpoena not found.' });
    return;
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE subpoenas SET
      status = COALESCE(?, status),
      hearing_date = COALESCE(?, hearing_date),
      hearing_time = COALESCE(?, hearing_time),
      venue = COALESCE(?, venue),
      signatory = COALESCE(?, signatory),
      reason = COALESCE(?, reason),
      updated_at = ?
    WHERE id = ?
  `).run(status || null, hearingDate || null, hearingTime || null, venue || null, signatory || null, reason || null, now, id);

  logAudit(user.id, user.full_name, user.role, 'UPDATE_SUBPOENA', 'Subpoena', id, `Updated subpoena ${subpoena.ref_number} status to ${status || subpoena.status}.`, req);

  res.json({ message: 'Subpoena updated successfully.' });
});

// Templates: List Templates
router.get('/templates', requireAuth, (req: AuthRequest, res: Response) => {
  const templates = db.prepare('SELECT * FROM subpoena_templates WHERE is_archived = 0 ORDER BY created_at DESC').all();
  res.json({ templates });
});

// Templates: Create or Update Template (Super Admin only)
router.post('/templates', requireAuth, requireRole(['super_admin']), (req: AuthRequest, res: Response) => {
  const { id, name, bodyTemplate } = req.body;
  const user = req.user!;

  if (!name || !bodyTemplate) {
    res.status(400).json({ error: 'Template name and body are required.' });
    return;
  }

  const now = new Date().toISOString();
  if (id) {
    db.prepare('UPDATE subpoena_templates SET name = ?, body_template = ? WHERE id = ?').run(name, bodyTemplate, id);
    logAudit(user.id, user.full_name, user.role, 'UPDATE_SUBPOENA_TEMPLATE', 'Template', id, `Updated subpoena template ${name}.`, req);
    res.json({ message: 'Template updated.' });
  } else {
    const newId = `tmpl-${Date.now()}`;
    db.prepare('INSERT INTO subpoena_templates (id, name, body_template, created_at, is_archived) VALUES (?, ?, ?, ?, 0)')
      .run(newId, name, bodyTemplate, now);
    logAudit(user.id, user.full_name, user.role, 'CREATE_SUBPOENA_TEMPLATE', 'Template', newId, `Created subpoena template ${name}.`, req);
    res.status(201).json({ message: 'Template created.', templateId: newId });
  }
});

// Soft-Archive Subpoena
router.post('/:id/archive', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const user = req.user!;

  if (!reason) {
    res.status(400).json({ error: 'Archive reason required.' });
    return;
  }

  const now = new Date().toISOString();
  db.prepare('UPDATE subpoenas SET archived_at = ?, archived_by = ?, archive_reason = ?, updated_at = ? WHERE id = ?')
    .run(now, user.id, reason, now, id);

  logAudit(user.id, user.full_name, user.role, 'ARCHIVE_SUBPOENA', 'Subpoena', id, `Archived subpoena. Reason: ${reason}`, req);
  res.json({ message: 'Subpoena record safely archived.' });
});

export default router;

