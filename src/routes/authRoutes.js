import { Router } from 'express';
import { signup, login, me, updateProfile, changePassword, refresh, logout } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticate, me);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);

export default router;