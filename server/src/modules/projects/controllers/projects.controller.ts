import { Request, Response } from 'express';
import { projectsService } from '../services/projects.service';
import { successResponse } from '@/common/utils/response';

export class ProjectsController {
  getUserProjects = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const projects = await projectsService.getUserProjects(userId);
    res.json(successResponse(projects));
  };

  createProject = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const project = await projectsService.createProject(userId, req.body);
    res.status(201).json(successResponse(project, 'Project created successfully'));
  };

  deleteProject = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const projectId = req.params.id as string;
    const deleted = await projectsService.deleteProject(userId, projectId);
    res.json(successResponse(deleted, 'Project deleted successfully'));
  };
}

export const projectsController = new ProjectsController();
