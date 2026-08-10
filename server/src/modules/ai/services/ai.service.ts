import { GoogleGenAI } from '@google/genai';
import { env } from '@/config/env';
import { prisma } from '@/config/database';
import { AppError } from '@/common/errors/AppError';
import { ErrorCodes } from '@/common/errors/ErrorCodes';
import { profileService } from '@/modules/profiles/services/profile.service';

export class AiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }

  /**
   * Generates a 768-dimensional vector embedding for the given text using Gemini.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: text,
      config: {
        outputDimensionality: 768,
      }
    });
    
    if (!response.embeddings || response.embeddings.length === 0) {
      throw new Error('Failed to generate embedding');
    }

    return response.embeddings[0].values!;
  }

  /**
   * AI Career Mentor chat logic.
   * Feeds the user's CareerOS profile as system instructions.
   */
  async chat(userId: string, message: string, sessionId?: string) {
    const profile = await profileService.getProfile(userId).catch(() => null);

    let session;
    if (sessionId) {
      session = await prisma.mentorSession.findUnique({
        where: { id: sessionId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
      if (!session || session.userId !== userId) {
        throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Session not found');
      }
    } else {
      session = await prisma.mentorSession.create({
        data: { userId, title: 'Career Mentorship' },
        include: { messages: true },
      });
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        mentorSessionId: session.id,
        role: 'USER',
        content: message,
      },
    });

    // Build conversation history for Gemini
    const contents = session.messages.map((m) => ({
      role: m.role === 'USER' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));
    // Append new user message
    contents.push({ role: 'user', parts: [{ text: message }] });

    // Build System Instructions
    const systemInstruction = profile 
      ? `You are an expert AI Career Mentor for a college student named ${profile.firstName} ${profile.lastName}. 
         They are studying at ${profile.college} in ${profile.branch}. 
         Their career goals: ${profile.careerGoals.map(g => g.title).join(', ')}. 
         Be encouraging, highly technical, and strictly focus on helping them achieve their career goals. Keep responses concise.`
      : 'You are an expert AI Career Mentor for college students. Be encouraging and concise.';

    const response = await this.ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    const aiMessageText = response.text || 'I am sorry, I could not process that request.';

    // Save AI message
    await prisma.chatMessage.create({
      data: {
        mentorSessionId: session.id,
        role: 'AI',
        content: aiMessageText,
      },
    });

    return {
      sessionId: session.id,
      reply: aiMessageText,
    };
  }

  /**
   * RAG Chat logic: Finds relevant document chunks using vector similarity,
   * then asks Gemini to answer based on the context.
   */
  async chatWithDocument(userId: string, documentId: string, message: string) {
    const doc = await prisma.studyDocument.findUnique({ where: { id: documentId } });
    if (!doc || doc.userId !== userId) {
      throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Document not found');
    }
    if (doc.status !== 'READY') {
      throw new AppError(400, ErrorCodes.BAD_REQUEST, 'Document is still processing');
    }

    // 1. Embed the user's query
    const queryEmbedding = await this.generateEmbedding(message);
    const vectorLiteral = `[${queryEmbedding.join(',')}]`;

    // 2. Perform Cosine Similarity Search using pgvector
    // We get the top 5 most similar chunks
    const relevantChunks = await prisma.$queryRaw<Array<{ content: string; distance: number }>>`
      SELECT content, embedding <=> ${vectorLiteral}::vector AS distance
      FROM "DocumentChunk"
      WHERE "studyDocumentId" = ${documentId}
      ORDER BY distance ASC
      LIMIT 5;
    `;

    if (!relevantChunks || relevantChunks.length === 0) {
      return { reply: "I couldn't find relevant information in the document." };
    }

    // 3. Construct the prompt with retrieved context
    const contextText = relevantChunks.map(c => c.content).join('\n\n---\n\n');
    
    const prompt = `
You are a highly intelligent study assistant. Answer the user's question based strictly on the provided document context.
If the answer is not contained within the context, say "I cannot find the answer in the provided document."

Context from Document:
${contextText}

User Question: ${message}
`;

    // 4. Generate answer
    const response = await this.ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    return {
      reply: response.text,
      // For transparency, we can return the exact context chunks used
      // contextUsed: relevantChunks
    };
  }
}

export const aiService = new AiService();
