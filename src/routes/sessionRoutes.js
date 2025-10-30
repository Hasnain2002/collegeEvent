import express from 'express';
import { 
  getSessions, 
  createSession, 
  updateSession, 
  deleteSession, 
  bookmarkSession, 
  removeBookmark, 
  getBookmarkedSessions 
} from '../controllers/sessionController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getSessions);

// Protected routes (user must be logged in)
router.use(protect);

// Bookmark routes
router.post('/:id/bookmark', bookmarkSession);
router.delete('/:id/bookmark', removeBookmark);
router.get('/bookmarks', getBookmarkedSessions);

// Organizer only routes
router.use(restrictTo('organizer'));

router.post('/', createSession);
router.put('/:id', updateSession);
router.delete('/:id', deleteSession);

export default router;