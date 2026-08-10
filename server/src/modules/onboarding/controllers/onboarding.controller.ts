import { Request, Response } from 'express';
import { onboardingService } from '../services/onboarding.service';
import { successResponse } from '@/common/utils/response';

export class OnboardingController {
  
  getStatus = async (req: Request, res: Response) => {
    const status = await onboardingService.getStatus(req.user!.userId);
    res.json(successResponse(status));
  };

  submitStep1 = async (req: Request, res: Response) => {
    await onboardingService.processStep1(req.user!.userId, req.body);
    res.json(successResponse({ nextStep: 2 }, 'Step 1 completed successfully'));
  };

  submitStep2 = async (req: Request, res: Response) => {
    await onboardingService.processStep2(req.user!.userId, req.body);
    res.json(successResponse({ nextStep: 3 }, 'Step 2 completed successfully'));
  };

  submitStep3 = async (req: Request, res: Response) => {
    await onboardingService.processStep3(req.user!.userId, req.body);
    res.json(successResponse({ nextStep: 4 }, 'Step 3 completed successfully'));
  };

  submitStep4 = async (req: Request, res: Response) => {
    await onboardingService.processStep4(req.user!.userId, req.body);
    res.json(successResponse({ nextStep: 5 }, 'Step 4 completed successfully'));
  };

  submitStep5 = async (req: Request, res: Response) => {
    await onboardingService.processStep5(req.user!.userId, req.body);
    res.json(successResponse({ completed: true }, 'Onboarding completed successfully!'));
  };
}

export const onboardingController = new OnboardingController();
