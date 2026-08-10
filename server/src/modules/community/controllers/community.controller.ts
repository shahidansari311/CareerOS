import { Request, Response } from 'express';
import { communityService } from '../services/community.service';
import { successResponse } from '@/common/utils/response';

export class CommunityController {
  
  getRecommendedPeers = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const peers = await communityService.getPeerRecommendations(userId);
    res.json(successResponse(peers));
  };

  sendConnection = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { recipientId } = req.body;
    
    const connection = await communityService.sendConnectionRequest(userId, recipientId);
    res.status(201).json(successResponse(connection, 'Connection request sent'));
  };

  updateConnection = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const connectionId = req.params.id as string;
    const { status } = req.body;
    
    const connection = await communityService.updateConnectionStatus(userId, connectionId, status);
    res.json(successResponse(connection, `Connection ${status.toLowerCase()}`));
  };

  getNetwork = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const network = await communityService.getMyNetwork(userId);
    res.json(successResponse(network));
  };

  createPost = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { content } = req.body;
    
    const post = await communityService.createPost(userId, content);
    res.status(201).json(successResponse(post, 'Post published successfully'));
  };

  getFeed = async (req: Request, res: Response) => {
    const feed = await communityService.getFeed();
    res.json(successResponse(feed));
  };
}

export const communityController = new CommunityController();
