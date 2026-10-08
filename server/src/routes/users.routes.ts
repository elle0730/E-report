import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { requireAuth, requireRole, AuthRequest, verifySuperAdminPassword } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';

const router = Router();

// List users with filters (Staff only)
router.get('/', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthRequest, res: Response) => {
  const { role, status, search } = req.query;
  const isSuperAdmin = req.user!.role === 'super_admin';

  let query = `
    SELECT id, email, role, status, full_name, birthday, contact_number,
           house_number, street, barangay, residency_length, valid_id_url,
           selfie_url, rejection_reason, helper_name, position, photo_url,
           two_factor_enabled, created_at, updated_at, archived_at, archived_by
    FROM users WHERE 1=1
  `;
  const params: any[] = [];

  // Admins can only see Residents; Super Admin can see Residents and Admins
  if (!isSuperAdmin) {
    query += " AND role = 'resident'";
  } else if (role) {
    query += ' AND role = ?';
    params.push(role);
  }

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  if (search) {
    query += ' AND (full_name LIKE ? OR email LIKE ? OR street LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY created_at DESC';

  const users = db.prepare(query).all(...params);
  res.json({ users });
});

// Resident Verification: Approve or Reject (Admin and Super Admin)
router.post('/verify/:id', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { action, rejectionReason } = req.body; // action: 'approve' | 'reject'

  const user = db.prepare('SELECT id, full_name, email, role, status FROM users WHERE id = ?').get(id) as any;
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (user.role !== 'resident') {
    res.status(400).json({ error: 'Only resident accounts can be processed via resident verification.' });
    return;
  }

  const now = new Date().toISOString();
  if (action === 'approve') {
    db.prepare("UPDATE users SET status = 'active', rejection_reason = NULL, updated_at = ? WHERE id = ?").run(now, id);

    // Create resident notification
    const notifId = `not-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, link, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `).run(
      notifId,
      id,
      'Account Verified & Approved!',
      'Congratulations! Your Barangay Bensican resident account has been verified. You may now submit reports, track concerns, and access all services.',
      '/resident/dashboard',
      now
    );

    logAudit(req.user!.id, req.user!.full_name, req.user!.role, 'APPROVE_RESIDENT', 'User', id, `Approved resident verification for ${user.full_name}.`, req);
    res.json({ message: `Resident account for ${user.full_name} has been approved and activated.` });
  } else if (action === 'reject') {
    if (!rejectionReason) {
      res.status(400).json({ error: 'A clear reason for rejection is required to inform the resident.' });
      return;
    }

    db.prepare("UPDATE users SET status = 'rejected', rejection_reason = ?, updated_at = ? WHERE id = ?").run(rejectionReason, now, id);

    // Create resident notification
    const notifId = `not-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, link, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `).run(
      notifId,
      id,
      'Verification Needs Attention',
      `Your resident verification could not be approved. Reason: ${rejectionReason}. Please contact or visit the Barangay Hall.`,
      '/profile',
      now
    );

    logAudit(req.user!.id, req.user!.full_name, req.user!.role, 'REJECT_RESIDENT', 'User', id, `Rejected resident verification for ${user.full_name}. Reason: ${rejectionReason}`, req);
    res.json({ message: `Resident account for ${user.full_name} was rejected with reason recorded.` });
  } else {
    res.status(400).json({ error: 'Invalid action. Must be approve or reject.' });
  }
});

// Suspend or Soft-Archive User Account
router.post('/status/:id', requireAuth, requireRole(['admin', 'super_admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, reason, superAdminPassword } = req.body; // status: 'active' | 'suspended' | 'archived'

  const targetUser = db.prepare('SELECT id, role, full_name, status FROM users WHERE id = ?').get(id) as any;
  if (!targetUser) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  // Admins cannot change Admin/Super Admin status
  if (targetUser.role !== 'resident' && req.user!.role !== 'super_admin') {
    res.status(403).json({ error: 'Admins cannot change status of staff accounts. Only the Super Admin can do this.' });
    return;
  }

  // Enforce rule: At least one active Super Admin must always exist!
  if (targetUser.role === 'super_admin' && (status === 'suspended' || status === 'archived')) {
    const activeSuperAdmins = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'super_admin' AND status = 'active' AND id != ?").get(id) as { count: number };
    if (activeSuperAdmins.count < 1) {
      res.status(400).json({ error: 'Cannot deactivate this Super Admin. At least one active Super Admin must always exist in the system.' });
      return;
    }
  }

  // Super Admin sensitive actions require password re-verification
  if (req.user!.role === 'super_admin' && (targetUser.role !== 'resident' || status === 'archived')) {
    if (!superAdminPassword || !verifySuperAdminPassword(req.user!.id, superAdminPassword)) {
      res.status(401).json({ error: 'Super Admin password re-verification failed. Please re-enter your password to confirm this action.', requiresPassword: true });
      return;
    }
  }

  const now = new Date().toISOString();
  if (status === 'archived') {
    db.prepare("UPDATE users SET status = 'archived', archived_at = ?, archived_by = ?, updated_at = ? WHERE id = ?")
      .run(now, req.user!.id, now, id);
    // Deactivate all sessions
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
    logAudit(req.user!.id, req.user!.full_name, req.user!.role, 'ARCHIVE_USER', 'User', id, `Archived account of ${targetUser.full_name}. Reason: ${reason || 'N/A'}`, req);
  } else {
    db.prepare('UPDATE users SET status = ?, archived_at = NULL, archived_by = NULL, updated_at = ? WHERE id = ?')
      .run(status, now, id);
    if (status === 'suspended') {
      db.prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
    }
    logAudit(req.user!.id, req.user!.full_name, req.user!.role, 'UPDATE_USER_STATUS', 'User', id, `Updated account status of ${targetUser.full_name} to ${status}.`, req);
  }

  res.json({ message: `Account status updated to ${status}.` });
});

// Create Staff Account (Super Admin Only, requires password re-entry)
router.post('/staff', requireAuth, requireRole(['super_admin']), (req: AuthRequest, res: Response) => {
  const { email, password, fullName, role, position, contactNumber, superAdminPassword } = req.body;

  if (!superAdminPassword || !verifySuperAdminPassword(req.user!.id, superAdminPassword)) {
    res.status(401).json({ error: 'Super Admin password confirmation failed. Please re-enter your password.', requiresPassword: true });
    return;
  }

  if (!email || !password || !fullName || !role) {
    res.status(400).json({ error: 'Email, password, full name, and role are required.' });
    return;
  }

  if (role !== 'admin' && role !== 'super_admin') {
    res.status(400).json({ error: 'Invalid role for staff account.' });
    return;
  }

  const cleanEmail = email.toLowerCase().trim();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
  if (existing) {
    res.status(400).json({ error: 'An account with this email already exists.' });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const id = `user-staff-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (
      id, email, password_hash, role, status, full_name,
      contact_number, position, two_factor_enabled,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, 'active', ?,
      ?, ?, 1,
      ?, ?
    )
  `).run(
    id,
    cleanEmail,
    passwordHash,
    role,
    fullName.trim(),
    contactNumber || null,
    position || (role === 'super_admin' ? 'Barangay Administrator' : 'Barangay Kagawad'),
    now,
    now
  );

  // Initialize presence
  db.prepare(`
    INSERT INTO staff_presence (user_id, is_online, is_available, last_heartbeat)
    VALUES (?, 0, 1, ?)
  `).run(id, now);

  logAudit(req.user!.id, req.user!.full_name, req.user!.role, 'CREATE_STAFF', 'User', id, `Created staff account for ${fullName} (${role}).`, req);

  res.status(201).json({ message: `Staff account for ${fullName} (${role}) created successfully.`, userId: id });
});

// Edit Staff Account / Change Role (Super Admin Only)
router.put('/staff/:id', requireAuth, requireRole(['super_admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { fullName, role, position, contactNumber, newPassword, superAdminPassword } = req.body;

  if (!superAdminPassword || !verifySuperAdminPassword(req.user!.id, superAdminPassword)) {
    res.status(401).json({ error: 'Super Admin password confirmation failed. Please re-enter your password.', requiresPassword: true });
    return;
  }

  const target = db.prepare('SELECT id, role, full_name FROM users WHERE id = ?').get(id) as any;
  if (!target) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  // Enforce rule: At least one active Super Admin must always exist!
  if (target.role === 'super_admin' && role && role !== 'super_admin') {
    const activeSuperAdmins = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'super_admin' AND status = 'active' AND id != ?").get(id) as { count: number };
    if (activeSuperAdmins.count < 1) {
      res.status(400).json({ error: 'Cannot demote this Super Admin. At least one active Super Admin must always exist.' });
      return;
    }
  }

  const now = new Date().toISOString();
  if (newPassword) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(passwordHash, now, id);
    logAudit(req.user!.id, req.user!.full_name, req.user!.role, 'RESET_PASSWORD', 'User', id, `Reset password for ${target.full_name}.`, req);
  }

  if (fullName || role || position || contactNumber) {
    db.prepare(`
      UPDATE users SET
        full_name = COALESCE(?, full_name),
        role = COALESCE(?, role),
        position = COALESCE(?, position),
        contact_number = COALESCE(?, contact_number),
        updated_at = ?
      WHERE id = ?
    `).run(fullName || null, role || null, position || null, contactNumber || null, now, id);

    logAudit(req.user!.id, req.user!.full_name, req.user!.role, 'UPDATE_STAFF', 'User', id, `Updated staff profile for ${target.full_name}.`, req);
  }

  res.json({ message: `Staff profile for ${target.full_name} updated successfully.` });
});

// Update own profile & preferences
router.put('/profile', requireAuth, (req: AuthRequest, res: Response) => {
  const { fullName, contactNumber, houseNumber, street, helperName, photoUrl } = req.body;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE users SET
      full_name = COALESCE(?, full_name),
      contact_number = COALESCE(?, contact_number),
      house_number = COALESCE(?, house_number),
      street = COALESCE(?, street),
      helper_name = COALESCE(?, helper_name),
      photo_url = COALESCE(?, photo_url),
      updated_at = ?
    WHERE id = ?
  `).run(
    fullName !== undefined ? fullName : null,
    contactNumber !== undefined ? contactNumber : null,
    houseNumber !== undefined ? houseNumber : null,
    street !== undefined ? street : null,
    helperName !== undefined ? helperName : null,
    photoUrl !== undefined ? photoUrl : null,
    now,
    req.user!.id
  );

  const updatedUser = db.prepare('SELECT id, email, role, status, full_name, position, photo_url, contact_number, house_number, street, barangay, helper_name FROM users WHERE id = ?').get(req.user!.id);

  logAudit(req.user!.id, req.user!.full_name, req.user!.role, 'UPDATE_PROFILE', 'User', req.user!.id, 'Updated personal profile.', req);

  res.json({ message: 'Profile updated successfully.', user: updatedUser });
});

export default router;

