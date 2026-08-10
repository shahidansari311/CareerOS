import { Router } from 'express';
import { skillsController } from '../controllers/skills.controller';
import { requireAuth } from '@/common/middleware/auth.middleware';
import { validateRequest } from '@/common/middleware/validation.middleware';
import { asyncHandler } from '@/common/utils/asyncHandler';
import * as schemas from '../schemas/skills.schema';

const router = Router();

router.use(requireAuth);

router.get('/list', asyncHandler(skillsController.listAllSkills));
router.post('/evaluate', validateRequest(schemas.evaluateSkillSchema), asyncHandler(skillsController.evaluateSkill));
router.get('/', asyncHandler(skillsController.getUserSkills));
router.get('/my-skills', asyncHandler(skillsController.getUserSkills));
router.get('/gaps', validateRequest(schemas.getSkillGapsSchema), asyncHandler(skillsController.getSkillGaps));

export const skillsRoutes = router;

