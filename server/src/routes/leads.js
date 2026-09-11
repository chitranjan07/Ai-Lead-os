import { Router } from 'express';
import { listLeads, getLead, importLeads, deleteLead, deleteAllLeads } from '../controllers/leadController.js';

const router = Router();
router.get('/', listLeads);
router.post('/import', importLeads);
router.delete('/all', deleteAllLeads);
router.get('/:leadId', getLead);
router.delete('/:leadId', deleteLead);
export default router;
