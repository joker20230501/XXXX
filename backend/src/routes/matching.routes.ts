import { Router } from 'express';
import {
  getSmartMatchesForWorker,
  applyJob,
  unlockCandidateContact,
} from '../controllers/matching.controller';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/recommendations', authenticateToken, requireRole(['WORKER']), getSmartMatchesForWorker);
router.post('/apply', authenticateToken, requireRole(['WORKER']), applyJob);
router.post('/unlock-contact', authenticateToken, requireRole(['EMPLOYER', 'ADMIN']), unlockCandidateContact);

export default router;
