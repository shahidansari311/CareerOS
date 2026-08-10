import { Request, Response } from 'express';
import { roadmapService } from '../services/roadmap.service';
import { successResponse } from '@/common/utils/response';
import { prisma } from '@/config/database';

export class RoadmapController {
  
  getCareerPaths = async (req: Request, res: Response) => {
    const paths = await prisma.careerPath.findMany({
      orderBy: { title: 'asc' },
    });
    res.json(successResponse(paths));
  };

  generateRoadmap = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const roadmap = await roadmapService.generateRoadmap(userId, req.body.careerPathId);
    res.status(201).json(successResponse(roadmap, 'Roadmap generated successfully'));
  };

  createCustomCareerPath = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { title, description, industry, skills } = req.body;
    const careerPath = await roadmapService.createCustomCareerPath(userId, {
      title,
      description,
      industry,
      skills,
    });
    res.status(201).json(successResponse(careerPath, 'Custom career path created successfully'));
  };


  getUserRoadmaps = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const roadmaps = await roadmapService.getUserRoadmaps(userId);
    res.json(successResponse(roadmaps));
  };

  getRoadmapDetails = async (req: Request, res: Response) => {
    const roadmapId = req.params.id as string;
    const roadmap = await roadmapService.getRoadmapDetails(roadmapId);
    res.json(successResponse(roadmap));
  };

  updateStep = async (req: Request, res: Response) => {
    const roadmapId = req.params.id as string;
    const stepId = req.params.stepId as string;
    const status = req.body.status;
    
    const updatedRoadmap = await roadmapService.updateStep(roadmapId, stepId, status);
    res.json(successResponse(updatedRoadmap, 'Step updated successfully'));
  };

  deleteRoadmap = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const roadmapId = req.params.id as string;
    await roadmapService.deleteRoadmap(userId, roadmapId);
    res.json(successResponse(null, 'Roadmap deleted successfully'));
  };
}

export const roadmapController = new RoadmapController();

