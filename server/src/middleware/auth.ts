import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'bensican-secret-key-super-secure-2026-prod';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'resident' | 'admin' | 'super_admin';
  status: 'pending_verification' | 'active' | 'rejected' | 'suspended' | 'archived';
  full_name: string;
  position?: string;
  photo_url?: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
  token?: string;
}

export function generateToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: user.role === 'resident' ? '7d' : '12h' } // Staff sessions expire sooner for safety
  );
}

export function generateRefreshToken(user: { id: string; email: string }): string {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.cookies?.token || null);

  if (!token) {
    res.status(401).json({ error: 'You are not signed in. Please sign in to continue.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    
    // Check user in database
    const user = db.prepare(`
      SELECT id, email, role, status, full_name, position, photo_url, archived_at
      FROM users WHERE id = ?
    `).get(decoded.id) as AuthenticatedUser & { archived_at: string | null };

    if (!user) {
      res.status(401).json({ error: 'Account not found or has been deactivated.' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({ error: 'Your account has been temporarily suspended by the Barangay administrator.' });
      return;
    }

    if (user.status === 'archived' || user.archived_at) {
      res.status(403).json({ error: 'This account has been archived.' });
      return;
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Your session has expired. You were signed out for your safety. Please sign in again.' });
  }
}

// RBAC: Roles Allowed
export function requireRole(allowedRoles: ('resident' | 'admin' | 'super_admin')[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Access denied. You do not have permission to perform this action.',
        requiredRoles: allowedRoles,
        currentRole: req.user.role
      });
      return;
    }

    next();
  };
}

// Sensitive Super Admin Actions: Password Re-verification helper
export function verifySuperAdminPassword(userId: string, passwordAttempt: string): boolean {
  const user = db.prepare('SELECT password_hash, role FROM users WHERE id = ?').get(userId) as { password_hash: string; role: string } | undefined;
  if (!user || user.role !== 'super_admin') return false;
  return bcrypt.compareSync(passwordAttempt, user.password_hash);
}

