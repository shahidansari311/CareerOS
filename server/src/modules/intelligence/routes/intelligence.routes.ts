import { Router } from 'express';
import { intelligenceController } from '../controllers/intelligence.controller';
import { requireAuth } from '@/common/middleware/auth.middleware';
import { asyncHandler } from '@/common/utils/asyncHandler';

const router = Router();

router.use(requireAuth);

router.get('/daily-plan', asyncHandler(intelligenceController.getDailyPlan));
router.get('/next-best-action', asyncHandler(intelligenceController.getNextBestAction));
router.get('/next-action', asyncHandler(intelligenceController.getNextBestAction));
router.get('/readiness', asyncHandler(intelligenceController.getCareerReadinessScore));

export const intelligenceRoutes = router;
