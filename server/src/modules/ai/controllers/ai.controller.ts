import { Request, Response } from 'express';
import { aiService } from '../services/ai.service';
import { documentService } from '../services/document.service';
import { successResponse } from '@/common/utils/response';
import { AppError } from '@/common/errors/AppError';
import { ErrorCodes } from '@/common/errors/ErrorCodes';

export class AiController {
  
  // -- Mentorship --
  chatWithMentor = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { message, sessionId } = req.body;
    
    const response = await aiService.chat(userId, message, sessionId);
    res.json(successResponse(response));
  };

  // -- RAG Documents --
  uploadDocument = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    if (!req.file) {
      throw new AppError(400, ErrorCodes.VALIDATION_ERROR, 'No file uploaded');
    }

    const doc = await documentService.processUploadedDocument(userId, req.file);
    res.status(202).json(successResponse(doc, 'Document uploaded and is processing'));
  };

  getDocuments = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const docs = await documentService.getUserDocuments(userId);
    res.json(successResponse(docs));
  };

  chatWithDocument = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const documentId = req.params.id as string;
    const { message } = req.body;
    
    const response = await aiService.chatWithDocument(userId, documentId, message);
    res.json(successResponse(response));
  };
}

export const aiController = new AiController();
