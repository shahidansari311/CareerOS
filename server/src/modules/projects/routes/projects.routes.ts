import { Router } from 'express';
import { projectsController } from '../controllers/projects.controller';
import { requireAuth } from '@/common/middleware/auth.middleware';
import { validateRequest } from '@/common/middleware/validation.middleware';
import { asyncHandler } from '@/common/utils/asyncHandler';
import * as schemas from '../schemas/projects.schema';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(projectsController.getUserProjects));
router.post('/', validateRequest(schemas.createProjectSchema), asyncHandler(projectsController.createProject));
router.delete('/:id', asyncHandler(projectsController.deleteProject));

export const projectsRoutes = router;
