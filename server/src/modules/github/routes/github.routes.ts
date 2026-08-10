import { Router } from 'express';
import { githubController } from '../controllers/github.controller';
import { requireAuth } from '@/common/middleware/auth.middleware';
import { validateRequest } from '@/common/middleware/validation.middleware';
import { asyncHandler } from '@/common/utils/asyncHandler';
import * as schemas from '../schemas/github.schema';

const router = Router();

router.use(requireAuth);

router.post('/sync', validateRequest(schemas.syncGithubSchema), asyncHandler(githubController.sync));
router.get('/dashboard', asyncHandler(githubController.getDashboard));

export const githubRoutes = router;
