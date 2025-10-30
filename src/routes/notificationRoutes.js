import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  getNotifications, 
  markAsRead, 
  markAsUnread,
  markAllAsRead,
  deleteNotification,
  deleteAllRead
} from '../controllers/notificationController.js';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.post('/:id/read', markAsRead);
router.post('/:id/unread', markAsUnread);
router.post('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);
router.delete('/read/all', deleteAllRead);

export default router;