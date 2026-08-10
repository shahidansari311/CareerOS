import { Router } from 'express';
import { profileController } from '../controllers/profile.controller';
import { requireAuth } from '@/common/middleware/auth.middleware';
import { validateRequest } from '@/common/middleware/validation.middleware';
import { asyncHandler } from '@/common/utils/asyncHandler';
import { upload, resumeUpload } from '@/common/middleware/upload.middleware';
import * as schemas from '../schemas/profile.schema';

const router = Router();

// All profile routes require authentication
router.use(requireAuth);

router.get('/', asyncHandler(profileController.getProfile));
router.put('/', validateRequest(schemas.updateProfileSchema), asyncHandler(profileController.updateProfile));
router.post('/upload-avatar', upload.single('avatar'), asyncHandler(profileController.uploadAvatar));
router.post('/upload-resume', resumeUpload.single('resume'), asyncHandler(profileController.uploadResume));

router.post('/education', validateRequest(schemas.addEducationSchema), asyncHandler(profileController.addEducation));
router.put('/career-goals', validateRequest(schemas.updateCareerGoalsSchema), asyncHandler(profileController.updateCareerGoals));
router.put('/career-interests', validateRequest(schemas.updateCareerInterestsSchema), asyncHandler(profileController.updateCareerInterests));

export const profileRoutes = router;
