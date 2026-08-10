import { Router } from 'express';
import { communityController } from '../controllers/community.controller';
import { requireAuth } from '@/common/middleware/auth.middleware';
import { validateRequest } from '@/common/middleware/validation.middleware';
import { asyncHandler } from '@/common/utils/asyncHandler';
import * as schemas from '../schemas/community.schema';

const router = Router();

router.use(requireAuth);

// Peer Matchmaking
router.get('/peers/recommended', asyncHandler(communityController.getRecommendedPeers));

// Networking / Connections
router.post('/connections', validateRequest(schemas.sendConnectionSchema), asyncHandler(communityController.sendConnection));
router.put('/connections/:id', validateRequest(schemas.updateConnectionSchema), asyncHandler(communityController.updateConnection));
router.get('/network', asyncHandler(communityController.getNetwork));

// Feed
router.post('/posts', validateRequest(schemas.createPostSchema), asyncHandler(communityController.createPost));
router.get('/feed', asyncHandler(communityController.getFeed));

export const communityRoutes = router;
