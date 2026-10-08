import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { requireAuth, AuthRequest, requireRole } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';

const router = Router();

// Full Audit Logs (SUPER ADMIN ONLY! Immutable, strictly cannot be deleted)
router.get('/', requireAuth, requireRole(['super_admin']), (req: AuthRequest, res: Response) => {
  const { action, entity, search, limit = 100 } = req.query;

  let query = 'SELECT * FROM audit_logs WHERE 1=1';
  const params: any[] = [];

  if (action) {
    query += ' AND action = ?';
    params.push(action);
  }

  if (entity) {
    query += ' AND entity = ?';
    params.push(entity);
  }

  if (search) {
    query += ' AND (user_name LIKE ? OR details LIKE ? OR entity_id LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY created_at DESC LIMIT ?';
  params.push(Number(limit));

  const logs = db.prepare(query).all(...params);
  res.json({ logs });
});

// Security Dashboard & Active Sessions (SUPER ADMIN ONLY)
router.get('/security-dashboard', requireAuth, requireRole(['super_admin']), (req: AuthRequest, res: Response) => {
  const activeSessions = db.prepare(`
    SELECT s.*, u.full_name, u.email, u.role
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.expires_at > datetime('now')
    ORDER BY s.created_at DESC
  `).all();

  // Suspicious alerts: Multiple failed logins in audit logs
  const suspiciousAttempts = db.prepare(`
    SELECT * FROM audit_logs
    WHERE action IN ('LOGIN_FAILED', 'UNAUTHORIZED_ACCESS_ATTEMPT')
    ORDER BY created_at DESC LIMIT 20
  `).all();

  res.json({
    activeSessions,
    suspiciousAttempts,
    metrics: {
      activeSessionsCount: activeSessions.length,
      suspiciousAttemptsCount: suspiciousAttempts.length
    }
  });
});

// Terminate Session (SUPER ADMIN ONLY)
router.post('/terminate-session', requireAuth, requireRole(['super_admin']), (req: AuthRequest, res: Response) => {
  const { sessionId } = req.body;
  const user = req.user!;

  if (!sessionId) {
    res.status(400).json({ error: 'Session ID required.' });
    return;
  }

  db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
  logAudit(user.id, user.full_name, user.role, 'TERMINATE_SESSION', 'Session', sessionId, `Super Admin terminated remote session ${sessionId}.`, req);

  res.json({ message: 'Session terminated.' });
});

export default router;

