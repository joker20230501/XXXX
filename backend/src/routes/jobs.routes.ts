import { Router } from 'express';
import { createJob, getJobsOnMap, getJobDetail } from '../controllers/jobs.controller';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateBody, createJobSchema } from '../middleware/validate';

const router = Router();

router.get('/map', getJobsOnMap);
router.get('/:id', getJobDetail);
router.post(
  '/',
  authenticateToken,
  requireRole(['EMPLOYER', 'ADMIN']),
  validateBody(createJobSchema),
  createJob
);

export default router;
