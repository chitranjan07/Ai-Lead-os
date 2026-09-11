import { Router } from 'express';
import { analyzeLead, listFollowUps, approveFollowUp, rejectFollowUp } from '../controllers/followUpController.js';

const router = Router();
router.get('/', listFollowUps);
router.post('/analyze/:leadId', analyzeLead);
router.post('/:id/approve', approveFollowUp);
router.post('/:id/reject', rejectFollowUp);
export default router;
