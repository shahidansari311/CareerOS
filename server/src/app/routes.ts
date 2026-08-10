import { Router } from 'express';
import { successResponse } from '@/common/utils/response';
import { authRoutes } from '@/modules/auth';
import { profileRoutes } from '@/modules/profiles';
import { onboardingRoutes } from '@/modules/onboarding';
import { skillsRoutes } from '@/modules/skills';
import { roadmapRoutes } from '@/modules/roadmap';
import { intelligenceRoutes } from '@/modules/intelligence';
import { githubRoutes } from '@/modules/github';
import { aiRoutes } from '@/modules/ai';
import { opportunitiesRoutes } from '@/modules/opportunities';
import { communityRoutes } from '@/modules/community';
import { projectsRoutes } from '@/modules/projects';
import { codingRoutes } from '@/modules/coding';

const router = Router();

// Health Check Endpoints
router.get('/health', (req, res) => {
  res.json(successResponse({ status: 'ok', timestamp: new Date().toISOString() }, 'Server is healthy'));
});

router.get('/health/live', (req, res) => {
  res.json(successResponse({ status: 'alive' }));
});

router.get('/health/ready', (req, res) => {
  // TODO: Add actual database/redis readiness checks here later
  res.json(successResponse({ status: 'ready' }));
});

// Mount modular routes
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/skills', skillsRoutes);
router.use('/roadmap', roadmapRoutes);
router.use('/intelligence', intelligenceRoutes);
router.use('/github', githubRoutes);
router.use('/ai', aiRoutes);
router.use('/opportunities', opportunitiesRoutes);
router.use('/community', communityRoutes);
router.use('/projects', projectsRoutes);
router.use('/coding-profiles', codingRoutes);

export const v1Router = router;


