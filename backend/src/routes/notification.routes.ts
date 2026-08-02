import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { ok } from '../utils/response.js';
import { NotificationModel } from '../models/notification.model.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  const notifications = await NotificationModel.find({ recipient: req.user!.id }).sort({ createdAt: -1 }).lean();
  res.json(
    ok(
      notifications.map((notification) => ({
        id: notification._id.toString(),
        type: notification.type,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt,
      })),
      'Notifications fetched',
    ),
  );
});

router.patch('/:id/read', async (req, res) => {
  await NotificationModel.updateOne({ _id: req.params.id, recipient: req.user!.id }, { $set: { read: true } });
  res.json(ok(null, 'Notification marked as read'));
});

export { router as notificationRoutes };
