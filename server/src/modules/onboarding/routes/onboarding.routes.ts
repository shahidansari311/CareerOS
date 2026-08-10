import { Router } from 'express';
import { onboardingController } from '../controllers/onboarding.controller';
import { requireAuth } from '@/common/middleware/auth.middleware';
import { validateRequest } from '@/common/middleware/validation.middleware';
import { asyncHandler } from '@/common/utils/asyncHandler';
import * as schemas from '../schemas/onboarding.schema';

const router = Router();

router.use(requireAuth);

router.get('/status', asyncHandler(onboardingController.getStatus));

router.post('/step/1', validateRequest(schemas.personalInfoSchema), asyncHandler(onboardingController.submitStep1));
router.post('/step/2', validateRequest(schemas.educationSchema), asyncHandler(onboardingController.submitStep2));
router.post('/step/3', validateRequest(schemas.careerSchema), asyncHandler(onboardingController.submitStep3));
router.post('/step/4', validateRequest(schemas.skillsSchema), asyncHandler(onboardingController.submitStep4));
router.post('/step/5', validateRequest(schemas.codingSchema), asyncHandler(onboardingController.submitStep5));

export const onboardingRoutes = router;
