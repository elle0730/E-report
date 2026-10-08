import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get current user's notifications
router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const notifs = db.prepare(`
    SELECT * FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC LIMIT 50
  `).all(user.id);

  const unreadCount = db.prepare(`
    SELECT COUNT(*) as count FROM notifications
    WHERE user_id = ? AND is_read = 0
  `).get(user.id) as { count: number };

  res.json({ notifications: notifs, unreadCount: unreadCount.count });
});

// Mark single notification as read
router.patch('/:id/read', requireAuth, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, user.id);
  res.json({ message: 'Marked as read.' });
});

// Mark all as read
router.post('/read-all', requireAuth, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(user.id);
  res.json({ message: 'All notifications marked as read.' });
});

export default router;

