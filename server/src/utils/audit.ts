import { Request } from 'express';
import { db } from '../db/index.js';

export function logAudit(
  userId: string | null,
  userName: string | null,
  userRole: string | null,
  action: string,
  entity: string,
  entityId: string | null,
  details: string,
  req?: Request
) {
  try {
    const ip = req ? (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1') : 'system';
    const id = `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO audit_logs (id, user_id, user_name, user_role, action, entity, entity_id, details, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, userName || 'System', userRole || 'system', action, entity, entityId, details, ip, now);
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

