import { Request, Response } from 'express';
import { codingService } from '../services/coding.service';
import { successResponse } from '@/common/utils/response';

export class CodingController {
  getCodingProfiles = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const profiles = await codingService.getCodingProfiles(userId);
    res.json(successResponse(profiles));
  };

  connectCodingProfile = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { platform, username } = req.body;
    const profile = await codingService.connectCodingProfile(userId, { platform, username });
    res.status(201).json(successResponse(profile, 'Coding profile connected successfully'));
  };

  disconnectCodingProfile = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const id = req.params.id as string;
    await codingService.disconnectCodingProfile(userId, id);
    res.json(successResponse(null, 'Coding profile disconnected successfully'));
  };
}

export const codingController = new CodingController();
