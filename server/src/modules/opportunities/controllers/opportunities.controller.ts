import { Request, Response } from 'express';
import { opportunitiesService } from '../services/opportunities.service';
import { successResponse } from '@/common/utils/response';

export class OpportunitiesController {
  
  getRecommended = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const opportunities = await opportunitiesService.getRecommendedOpportunities(userId);
    res.json(successResponse(opportunities));
  };

  apply = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const opportunityId = req.params.id as string;
    const { resumeUrl } = req.body;
    
    const application = await opportunitiesService.applyToOpportunity(userId, opportunityId, resumeUrl);
    res.status(201).json(successResponse(application, 'Application submitted successfully'));
  };

  getUserApplications = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const applications = await opportunitiesService.getUserApplications(userId);
    res.json(successResponse(applications));
  };

  updateApplication = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const applicationId = req.params.applicationId as string;
    const { status, note } = req.body;
    
    const application = await opportunitiesService.updateApplicationStatus(userId, applicationId, status, note);
    res.json(successResponse(application, 'Application status updated'));
  };
}

export const opportunitiesController = new OpportunitiesController();
