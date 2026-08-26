import { Router } from 'express';
import { saveWorkerProfile, getMyProfile, getWorkersOnMap } from '../controllers/workers.controller';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateBody, workerProfileSchema } from '../middleware/validate';

const router = Router();

router.get('/me', authenticateToken, requireRole(['WORKER']), getMyProfile);
router.post(
  '/profile',
  authenticateToken,
  requireRole(['WORKER']),
  validateBody(workerProfileSchema),
  saveWorkerProfile
);
router.get('/map', authenticateToken, requireRole(['EMPLOYER', 'ADMIN']), getWorkersOnMap);

export default router;
