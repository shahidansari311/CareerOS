import { Router } from 'express';
import multer from 'multer';
import { aiController } from '../controllers/ai.controller';
import { requireAuth } from '@/common/middleware/auth.middleware';
import { validateRequest } from '@/common/middleware/validation.middleware';
import { asyncHandler } from '@/common/utils/asyncHandler';
import * as schemas from '../schemas/ai.schema';

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = Router();

router.use(requireAuth);

// Mentor
router.post('/chat', validateRequest(schemas.chatSchema), asyncHandler(aiController.chatWithMentor));

// RAG Documents
router.post('/documents/upload', upload.single('document'), asyncHandler(aiController.uploadDocument));
router.get('/documents', asyncHandler(aiController.getDocuments));
router.post('/documents/:id/chat', validateRequest(schemas.documentChatSchema), asyncHandler(aiController.chatWithDocument));

export const aiRoutes = router;
