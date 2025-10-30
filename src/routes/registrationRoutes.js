import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roles.js';
import { registerForEvent, myRegistrations, participantsForEvent, checkInParticipant, exportParticipantsCsv, approveRegistration, denyRegistration, getPendingRegistrations } from '../controllers/registrationController.js';

const router = Router();

router.post('/:id/register', authenticate, authorizeRoles('customer', 'organizer', 'admin'), registerForEvent);
router.get('/me', authenticate, myRegistrations);
router.get('/pending', authenticate, authorizeRoles('admin'), getPendingRegistrations);
router.get('/:id/participants', authenticate, authorizeRoles('organizer', 'admin'), participantsForEvent);
router.post('/:id/checkin', authenticate, authorizeRoles('organizer', 'admin'), checkInParticipant);
router.get('/:id/participants.csv', authenticate, authorizeRoles('organizer', 'admin'), exportParticipantsCsv);

// Admin approval routes
router.post('/:id/approve', authenticate, authorizeRoles('admin'), approveRegistration);
router.post('/:id/deny', authenticate, authorizeRoles('admin'), denyRegistration);

export default router;


