import { Request, Response } from 'express';
import { intelligenceService } from '../services/intelligence.service';
import { successResponse } from '@/common/utils/response';

export class IntelligenceController {
  
  getDailyPlan = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const roadmapId = req.query.roadmapId as string;
    const plan = await intelligenceService.getDailyPlan(userId, roadmapId);
    res.json(successResponse(plan));
  };

  getNextBestAction = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const careerPathId = req.query.careerPathId as string;
    const action = await intelligenceService.getNextBestAction(userId, careerPathId);
    res.json(successResponse(action));
  };

  getCareerReadinessScore = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const careerPathId = req.query.careerPathId as string;
    const readiness = await intelligenceService.getCareerReadinessScore(userId, careerPathId);
    res.json(successResponse(readiness));
  };
}

export const intelligenceController = new IntelligenceController();
