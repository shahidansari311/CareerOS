import { Request, Response } from 'express';
import { skillsService } from '../services/skills.service';
import { successResponse } from '@/common/utils/response';
import { prisma } from '@/config/database';

export class SkillsController {
  listAllSkills = async (req: Request, res: Response) => {
    const skills = await prisma.skill.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(successResponse(skills));
  };

  
  evaluateSkill = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const userSkill = await skillsService.evaluateSkill(userId, req.body);
    res.json(successResponse(userSkill, 'Skill evaluation saved'));
  };

  getUserSkills = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const skills = await skillsService.getUserSkills(userId);
    res.json(successResponse(skills));
  };

  getSkillGaps = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const careerPathId = req.query.careerPathId as string;
    const gaps = await skillsService.calculateSkillGaps(userId, careerPathId);
    res.json(successResponse(gaps));
  };
}

export const skillsController = new SkillsController();
