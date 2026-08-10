import { Router } from 'express';
import { codingController } from '../controllers/coding.controller';
import { requireAuth } from '@/common/middleware/auth.middleware';
import { validateRequest } from '@/common/middleware/validation.middleware';
import { asyncHandler } from '@/common/utils/asyncHandler';
import { connectCodingProfileSchema } from '../schemas/coding.schema';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(codingController.getCodingProfiles));
router.post('/', validateRequest(connectCodingProfileSchema), asyncHandler(codingController.connectCodingProfile));
router.delete('/:id', asyncHandler(codingController.disconnectCodingProfile));

export const codingRoutes = router;
