import { Router, Response } from 'express';
import { Notification } from '../models/index.js';
import { authenticateJWT, AuthRequest } from '../middleware/auth.js';

export const notificationRouter = Router();

// GET /api/notifications
notificationRouter.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(notifications.map(n => ({ ...n, id: (n._id as any).toString() })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read
notificationRouter.patch('/:id/read', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findByIdAndUpdate(id, { readStatus: true }, { new: true }).lean();
    res.json({ ...notif, id: (notif!._id as any).toString() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// POST /api/notifications/read-all
notificationRouter.post('/read-all', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany({ userId: req.user!.id, readStatus: false }, { readStatus: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});
