import { Router } from 'express';
import { roadmapController } from '../controllers/roadmap.controller';
import { requireAuth } from '@/common/middleware/auth.middleware';
import { validateRequest } from '@/common/middleware/validation.middleware';
import { asyncHandler } from '@/common/utils/asyncHandler';
import * as schemas from '../schemas/roadmap.schema';

const router = Router();

router.use(requireAuth);

router.get('/career-paths', asyncHandler(roadmapController.getCareerPaths));
router.post('/career-paths', validateRequest(schemas.createCustomCareerPathSchema), asyncHandler(roadmapController.createCustomCareerPath));
router.post('/generate', validateRequest(schemas.generateRoadmapSchema), asyncHandler(roadmapController.generateRoadmap));
router.get('/', asyncHandler(roadmapController.getUserRoadmaps));
router.get('/:id', asyncHandler(roadmapController.getRoadmapDetails));
router.delete('/:id', asyncHandler(roadmapController.deleteRoadmap));
router.put('/:id/steps/:stepId', validateRequest(schemas.updateRoadmapStepSchema), asyncHandler(roadmapController.updateStep));

export const roadmapRoutes = router;
