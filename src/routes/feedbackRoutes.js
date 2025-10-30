import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { submitFeedback, listFeedback } from '../controllers/feedbackController.js';

const router = Router();

// All feedback routes require authentication
router.use(authenticate);

// Submit feedback (customer, organizer, admin)
router.post('/', submitFeedback);

// List all feedback (admin only)
router.get('/', listFeedback);

export default router;