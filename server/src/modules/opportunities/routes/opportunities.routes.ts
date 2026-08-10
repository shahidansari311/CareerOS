import { Router } from 'express';
import { opportunitiesController } from '../controllers/opportunities.controller';
import { requireAuth } from '@/common/middleware/auth.middleware';
import { validateRequest } from '@/common/middleware/validation.middleware';
import { asyncHandler } from '@/common/utils/asyncHandler';
import * as schemas from '../schemas/opportunities.schema';

const router = Router();

router.use(requireAuth);

router.get('/recommended', asyncHandler(opportunitiesController.getRecommended));
router.post('/:id/apply', validateRequest(schemas.applySchema), asyncHandler(opportunitiesController.apply));

// Application Tracking routes
router.get('/applications', asyncHandler(opportunitiesController.getUserApplications));
router.put('/applications/:applicationId', validateRequest(schemas.updateApplicationStatusSchema), asyncHandler(opportunitiesController.updateApplication));

export const opportunitiesRoutes = router;
