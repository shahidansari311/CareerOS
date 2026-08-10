const { PDFParse } = require('pdf-parse');
import { prisma } from '@/config/database';
import { AppError } from '@/common/errors/AppError';
import { ErrorCodes } from '@/common/errors/ErrorCodes';
import { aiService } from './ai.service';
import { logger } from '@/config/logger';

export class DocumentService {
  
  async processUploadedDocument(userId: string, file: Express.Multer.File) {
    if (file.mimetype !== 'application/pdf') {
      throw new AppError(400, ErrorCodes.VALIDATION_ERROR, 'Only PDF files are supported');
    }

    // 1. Create StudyDocument record
    const doc = await prisma.studyDocument.create({
      data: {
        userId,
        filename: file.originalname,
        fileSize: file.size,
        mimetype: file.mimetype,
        status: 'PROCESSING',
      },
    });

    // 2. Parse PDF and extract text
    // (Running asynchronously so we don't block the HTTP response)
    this.extractAndIndex(doc.id, file.buffer).catch(err => {
      logger.error({ err }, `Failed to process document ${doc.id}`);
      prisma.studyDocument.update({ where: { id: doc.id }, data: { status: 'ERROR' } }).catch(console.error);
    });

    return doc;
  }

  private async extractAndIndex(documentId: string, pdfBuffer: Buffer) {
    const parser = new PDFParse({ data: new Uint8Array(pdfBuffer) });
    const parsed = await parser.getText();
    const rawText = parsed.text;

    // Very simple semantic chunking (split by paragraphs or fixed length)
    // For production, use Langchain's RecursiveCharacterTextSplitter
    const chunks = this.chunkText(rawText, 1000, 200);

    // Process chunks sequentially to avoid hitting Gemini rate limits
    for (const chunk of chunks) {
      if (!chunk.trim()) continue;

      const embedding = await aiService.generateEmbedding(chunk);
      const vectorLiteral = `[${embedding.join(',')}]`;

      // Insert chunk with vector using raw SQL because Prisma doesn't natively map Unsupported("vector") in `create`
      await prisma.$executeRaw`
        INSERT INTO "DocumentChunk" ("id", "studyDocumentId", "content", "embedding")
        VALUES (gen_random_uuid(), ${documentId}, ${chunk}, ${vectorLiteral}::vector)
      `;
    }

    // Mark as ready
    await prisma.studyDocument.update({
      where: { id: documentId },
      data: { status: 'READY' },
    });
  }

  private chunkText(text: string, chunkSize: number, overlap: number): string[] {
    const chunks: string[] = [];
    let index = 0;
    while (index < text.length) {
      chunks.push(text.slice(index, index + chunkSize));
      index += chunkSize - overlap;
    }
    return chunks;
  }

  async getUserDocuments(userId: string) {
    return prisma.studyDocument.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        filename: true,
        fileSize: true,
        status: true,
        createdAt: true,
      }
    });
  }
}

export const documentService = new DocumentService();
