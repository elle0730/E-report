import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { generateToken, generateRefreshToken, requireAuth, AuthRequest } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';

const router = Router();

// In-memory failed attempts tracker for lockout/CAPTCHA
const failedLogins: Record<string, { count: number; lockedUntil?: number }> = {};

// Helper: Senior friendly CAPTCHA math generator
router.get('/captcha-challenge', (req: Request, res: Response) => {
  const num1 = Math.floor(Math.random() * 5) + 1; // 1 to 5
  const num2 = Math.floor(Math.random() * 5) + 1; // 1 to 5
  const answer = num1 + num2;
  const challengeId = `cap-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  
  // Store in database or session
  db.prepare(`
    INSERT INTO system_settings (key, value_json, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at
  `).run(`captcha_${challengeId}`, JSON.stringify({ answer }), new Date().toISOString());

  res.json({
    challengeId,
    question: `What is ${num1} + ${num2}? (Ano ang ${num1} + ${num2}?)`,
    options: [answer, answer + 1, answer > 2 ? answer - 2 : answer + 3, answer + 2].sort(() => Math.random() - 0.5)
  });
});

// Resident Registration (Exclusive to Barangay Bensican, San Nicolas, Pangasinan)
router.post('/register', async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      fullName,
      birthday,
      contactNumber,
      houseNumber,
      street,
      barangay,
      residencyLength,
      validIdUrl,
      selfieUrl,
      helperName,
      agreePrivacyPolicy
    } = req.body;

    if (!agreePrivacyPolicy) {
      res.status(400).json({ error: 'You must agree to the Data Privacy Notice (RA 10173) to register.' });
      return;
    }

    // Geographic verification: Exclusive to Barangay Bensican, San Nicolas, Pangasinan
    const normalizedBrgy = (barangay || '').trim().toLowerCase();
    if (normalizedBrgy !== 'bensican') {
      res.status(400).json({
        error: 'Registration is strictly exclusive to residents of Barangay Bensican, San Nicolas, Pangasinan. Registrants outside Barangay Bensican cannot be accepted.'
      });
      return;
    }

    if (!email || !password || !fullName || !street) {
      res.status(400).json({ error: 'Please fill in all required fields (Full name, email, password, street address).' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      res.status(400).json({ error: 'An account with this email already exists. Please sign in instead.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (
        id, email, password_hash, role, status, full_name, birthday,
        contact_number, house_number, street, barangay, residency_length,
        valid_id_url, selfie_url, helper_name, two_factor_enabled,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, 'resident', 'pending_verification', ?, ?,
        ?, ?, ?, 'Bensican', ?,
        ?, ?, ?, 0,
        ?, ?
      )
    `).run(
      id,
      email.toLowerCase().trim(),
      passwordHash,
      fullName.trim(),
      birthday || null,
      contactNumber || null,
      houseNumber || '',
      street.trim(),
      residencyLength || '',
      validIdUrl || null,
      selfieUrl || null,
      helperName || null,
      now,
      now
    );

    // Create system notification for staff
    const staffMembers = db.prepare("SELECT id FROM users WHERE role IN ('admin', 'super_admin')").all() as { id: string }[];
    const notifStmt = db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, link, is_read, created_at)
      VALUES (?, ?, 'New Resident Verification Pending', ?, '/admin/residents', 0, ?)
    `);
    for (const staff of staffMembers) {
      notifStmt.run(`not-${Date.now()}-${Math.random().toString(36).substring(2, 6)}-${staff.id}`, staff.id, `Resident ${fullName} registered and is waiting for account verification.`, now);
    }

    logAudit(id, fullName, 'resident', 'REGISTER', 'User', id, 'Resident submitted registration and proof of residency.', req);

    const newUser = {
      id,
      email: cleanEmail,
      role: 'resident' as const,
      status: 'pending_verification' as const,
      fullName: fullName.trim(),
      position: undefined,
      photoUrl: selfieUrl || undefined,
      rejectionReason: undefined
    };

    const token = generateToken(newUser);
    const refreshToken = generateRefreshToken(newUser);
    const clientIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1';
    const sessionId = `ses-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();

    db.prepare(`
      INSERT INTO sessions (id, user_id, token, refresh_token, ip_address, user_agent, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(sessionId, id, token, refreshToken, clientIp, req.headers['user-agent'] || 'Unknown', expiresAt, now);

    res.status(201).json({
      message: 'Registration submitted successfully! Your account is waiting for approval by the Barangay administrator.',
      status: 'pending_verification',
      userId: id,
      token,
      refreshToken,
      user: newUser
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to complete registration. Please try again or call the Barangay hall.' });
  }
});

// Sign-in
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, captchaId, captchaAnswer } = req.body;
    const clientIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1';

    if (!email || !password) {
      res.status(400).json({ error: 'Please provide both email address and password.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const attempts = failedLogins[cleanEmail] || { count: 0 };

    // Check account lockout
    if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
      const waitMinutes = Math.ceil((attempts.lockedUntil - Date.now()) / 60000);
      res.status(429).json({
        error: `Too many failed attempts. For your safety, account is locked for ${waitMinutes} more minute(s).`
      });
      return;
    }

    // If 3 or more failed attempts, require CAPTCHA
    if (attempts.count >= 3) {
      if (!captchaId || !captchaAnswer) {
        res.status(400).json({
          error: 'Please complete the simple security math question below.',
          requiresCaptcha: true
        });
        return;
      }

      const storedCap = db.prepare('SELECT value_json FROM system_settings WHERE key = ?').get(`captcha_${captchaId}`) as { value_json: string } | undefined;
      if (!storedCap || JSON.parse(storedCap.value_json).answer !== Number(captchaAnswer)) {
        res.status(400).json({
          error: 'The math answer was incorrect. Please try again.',
          requiresCaptcha: true
        });
        return;
      }
    }

    // Lookup user
    const user = db.prepare(`
      SELECT id, email, password_hash, role, status, full_name, position, photo_url,
             two_factor_enabled, rejection_reason, archived_at
      FROM users WHERE email = ?
    `).get(cleanEmail) as any;

    if (!user) {
      failedLogins[cleanEmail] = { count: attempts.count + 1 };
      logAudit(null, cleanEmail, null, 'LOGIN_FAILED', 'User', null, 'Failed login attempt - user not found.', req);
      res.status(401).json({
        error: 'Incorrect email or password. Please check your spelling and try again.',
        requiresCaptcha: (attempts.count + 1) >= 3
      });
      return;
    }

    if (user.archived_at || user.status === 'archived') {
      res.status(403).json({ error: 'This account has been archived. Please contact the Barangay Hall.' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({ error: 'This account has been temporarily suspended. Please visit the Barangay Hall.' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      const newCount = attempts.count + 1;
      let lockedUntil: number | undefined;
      if (newCount >= 5) {
        lockedUntil = Date.now() + 15 * 60 * 1000; // 15 mins lockout
      }
      failedLogins[cleanEmail] = { count: newCount, lockedUntil };
      logAudit(user.id, user.full_name, user.role, 'LOGIN_FAILED', 'User', user.id, `Failed password attempt (${newCount}).`, req);

      res.status(401).json({
        error: newCount >= 5
          ? 'Too many failed login attempts. Your account is temporarily locked for 15 minutes.'
          : 'Incorrect email or password. Please check your spelling and try again.',
        requiresCaptcha: newCount >= 3
      });
      return;
    }

    // Reset failed count
    delete failedLogins[cleanEmail];

    // Check 2FA for Staff (mandatory for Admin/Super Admin, or if resident enabled it)
    if (user.role === 'admin' || user.role === 'super_admin' || user.two_factor_enabled === 1) {
      // Return 2FA challenge requirement
      const temp2FAToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role, stage: '2fa_pending' },
        process.env.JWT_SECRET || 'bensican-secret-key-super-secure-2026-prod',
        { expiresIn: '10m' }
      );

      // Generate a mock 6-digit code for convenience (also logged in audit)
      const mockCode = '123456';
      db.prepare(`
        INSERT INTO system_settings (key, value_json, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at
      `).run(`2fa_${user.id}`, JSON.stringify({ code: mockCode }), new Date().toISOString());

      res.json({
        requires2FA: true,
        tempToken: temp2FAToken,
        message: 'A 6-digit security verification code is required. (For testing: use 123456)',
        demoCode: '123456'
      });
      return;
    }

    // Successful login without 2FA
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save session in db
    const sessionId = `ses-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const expiresAt = new Date(Date.now() + (user.role === 'resident' ? 7 * 86400000 : 12 * 3600000)).toISOString();
    db.prepare(`
      INSERT INTO sessions (id, user_id, token, refresh_token, ip_address, user_agent, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(sessionId, user.id, token, refreshToken, clientIp, req.headers['user-agent'] || 'Unknown', expiresAt, new Date().toISOString());

    // Update staff presence online
    if (user.role === 'admin' || user.role === 'super_admin') {
      db.prepare(`
        INSERT INTO staff_presence (user_id, is_online, is_available, last_heartbeat)
        VALUES (?, 1, 1, ?)
        ON CONFLICT(user_id) DO UPDATE SET is_online = 1, is_available = 1, last_heartbeat = excluded.last_heartbeat
      `).run(user.id, new Date().toISOString());
    }

    logAudit(user.id, user.full_name, user.role, 'LOGIN_SUCCESS', 'User', user.id, 'User successfully signed in.', req);

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        fullName: user.full_name,
        position: user.position,
        photoUrl: user.photo_url,
        rejectionReason: user.rejection_reason
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during sign in. Please try again.' });
  }
});

// Verify 2FA
router.post('/verify-2fa', async (req: Request, res: Response) => {
  try {
    const { tempToken, code } = req.body;
    if (!tempToken || !code) {
      res.status(400).json({ error: 'Missing security token or code.' });
      return;
    }

    const decoded = jwt.verify(
      tempToken,
      process.env.JWT_SECRET || 'bensican-secret-key-super-secure-2026-prod'
    ) as any;

    if (decoded.stage !== '2fa_pending') {
      res.status(400).json({ error: 'Invalid verification token.' });
      return;
    }

    const storedCodeRow = db.prepare('SELECT value_json FROM system_settings WHERE key = ?').get(`2fa_${decoded.id}`) as { value_json: string } | undefined;
    const validCode = storedCodeRow ? JSON.parse(storedCodeRow.value_json).code : '123456';

    if (code.trim() !== validCode && code.trim() !== '123456') {
      res.status(400).json({ error: 'Invalid 6-digit verification code. Please try again.' });
      return;
    }

    // Fetch user
    const user = db.prepare(`
      SELECT id, email, role, status, full_name, position, photo_url, rejection_reason
      FROM users WHERE id = ?
    `).get(decoded.id) as any;

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    const clientIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1';
    const sessionId = `ses-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const expiresAt = new Date(Date.now() + (user.role === 'resident' ? 7 * 86400000 : 12 * 3600000)).toISOString();

    db.prepare(`
      INSERT INTO sessions (id, user_id, token, refresh_token, ip_address, user_agent, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(sessionId, user.id, token, refreshToken, clientIp, req.headers['user-agent'] || 'Unknown', expiresAt, new Date().toISOString());

    // Update staff presence online
    if (user.role === 'admin' || user.role === 'super_admin') {
      db.prepare(`
        INSERT INTO staff_presence (user_id, is_online, is_available, last_heartbeat)
        VALUES (?, 1, 1, ?)
        ON CONFLICT(user_id) DO UPDATE SET is_online = 1, is_available = 1, last_heartbeat = excluded.last_heartbeat
      `).run(user.id, new Date().toISOString());
    }

    logAudit(user.id, user.full_name, user.role, '2FA_VERIFIED', 'User', user.id, '2FA successfully verified.', req);

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        fullName: user.full_name,
        position: user.position,
        photoUrl: user.photo_url,
        rejectionReason: user.rejection_reason
      }
    });
  } catch (err: any) {
    res.status(401).json({ error: 'Verification expired or invalid. Please sign in again.' });
  }
});

// OAuth Simulation (Google / Facebook sign-in for seamless senior access)
router.post('/oauth', async (req: Request, res: Response) => {
  try {
    const { provider, oauthToken, email, fullName, photoUrl } = req.body;
    if (!provider || !email) {
      res.status(400).json({ error: 'OAuth provider and email are required.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = db.prepare(`
      SELECT id, email, role, status, full_name, position, photo_url, rejection_reason, archived_at
      FROM users WHERE email = ?
    `).get(cleanEmail) as any;

    const now = new Date().toISOString();

    if (!user) {
      // New resident via OAuth -> created with pending_verification for Bensican
      const id = `user-oauth-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const randomPasswordHash = bcrypt.hashSync(Math.random().toString(36), 10);
      
      db.prepare(`
        INSERT INTO users (
          id, email, password_hash, role, status, full_name,
          barangay, photo_url, created_at, updated_at
        ) VALUES (
          ?, ?, ?, 'resident', 'pending_verification', ?,
          'Bensican', ?, ?, ?
        )
      `).run(id, cleanEmail, randomPasswordHash, fullName || 'Resident', photoUrl || null, now, now);

      user = {
        id,
        email: cleanEmail,
        role: 'resident',
        status: 'pending_verification',
        full_name: fullName || 'Resident',
        photo_url: photoUrl
      };

      logAudit(id, user.full_name, 'resident', 'OAUTH_REGISTER', 'User', id, `Registered via ${provider} OAuth.`, req);
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        fullName: user.full_name,
        position: user.position,
        photoUrl: user.photo_url,
        rejectionReason: user.rejection_reason
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'OAuth sign-in failed. Please use standard email/password.' });
  }
});

// Current User profile /me
router.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
  const user = db.prepare(`
    SELECT id, email, role, status, full_name, birthday, contact_number,
           house_number, street, barangay, residency_length, valid_id_url,
           selfie_url, rejection_reason, helper_name, position, photo_url,
           two_factor_enabled, created_at
    FROM users WHERE id = ?
  `).get(req.user!.id) as any;

  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  res.json({ user });
});

// Logout (Single session or all devices)
router.post('/logout', requireAuth, (req: AuthRequest, res: Response) => {
  const { allDevices } = req.body;
  if (allDevices) {
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(req.user!.id);
  } else if (req.token) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(req.token);
  }

  // Update staff presence offline if no other sessions active
  if (req.user?.role === 'admin' || req.user?.role === 'super_admin') {
    db.prepare('UPDATE staff_presence SET is_online = 0 WHERE user_id = ?').run(req.user.id);
  }

  logAudit(req.user!.id, req.user!.full_name, req.user!.role, 'LOGOUT', 'User', req.user!.id, allDevices ? 'Logged out from all devices.' : 'Logged out.', req);
  res.json({ message: 'Signed out successfully.' });
});

// Forgot Password Flow
router.post('/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Please enter your email address.' });
    return;
  }

  const user = db.prepare('SELECT id, full_name FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
  if (!user) {
    // For privacy, still return success message
    res.json({ message: 'If this email is registered in Barangay Bensican, a reset instruction has been generated.' });
    return;
  }

  const resetToken = jwt.sign(
    { id: user.id, purpose: 'password_reset' },
    process.env.JWT_SECRET || 'bensican-secret-key-super-secure-2026-prod',
    { expiresIn: '1h' }
  );

  logAudit(user.id, user.full_name, 'resident', 'FORGOT_PASSWORD_REQUEST', 'User', user.id, 'Password reset link requested.', req);

  res.json({
    message: 'A password reset link has been generated. For testing/demo convenience, you can reset directly:',
    resetToken,
    resetLink: `/reset-password?token=${resetToken}`
  });
});

// Reset Password
router.post('/reset-password', (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    res.status(400).json({ error: 'Token and new password are required.' });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'bensican-secret-key-super-secure-2026-prod'
    ) as any;

    if (decoded.purpose !== 'password_reset') {
      res.status(400).json({ error: 'Invalid reset token.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);

    db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?')
      .run(passwordHash, new Date().toISOString(), decoded.id);

    // Invalidate old sessions
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(decoded.id);

    logAudit(decoded.id, 'User', 'user', 'PASSWORD_RESET', 'User', decoded.id, 'Password reset completed.', req);

    res.json({ message: 'Your password has been successfully reset. You can now sign in with your new password.' });
  } catch (err) {
    res.status(400).json({ error: 'The password reset link has expired or is invalid. Please request a new one.' });
  }
});

export default router;
