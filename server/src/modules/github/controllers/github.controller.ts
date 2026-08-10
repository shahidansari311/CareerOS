import { Request, Response } from 'express';
import { githubService } from '../services/github.service';
import { successResponse } from '@/common/utils/response';

export class GithubController {
  
  sync = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { username } = req.body;
    
    const githubProfile = await githubService.syncAccount(userId, username);
    res.json(successResponse(githubProfile, 'GitHub account successfully synced and skills analyzed'));
  };

  getDashboard = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const data = await githubService.getDashboard(userId);
    res.json(successResponse(data));
  };
}

export const githubController = new GithubController();
