import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roles.js';
import { addReview, listReviews, updateReview, deleteReview, getUserReviews } from '../controllers/reviewController.js';

const router = Router();

router.get('/:id', listReviews);
router.post('/:id', authenticate, authorizeRoles('customer', 'organizer', 'admin'), addReview);
router.put('/:id', authenticate, authorizeRoles('customer', 'organizer', 'admin'), updateReview);
router.delete('/:id', authenticate, authorizeRoles('customer', 'organizer', 'admin'), deleteReview);
router.get('/user/me', authenticate, getUserReviews);

export default router;