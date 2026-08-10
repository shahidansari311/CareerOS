import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('No API key');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function run() {
  try {
    let pageToken: string | undefined = undefined;
    console.log('Fetching all available models...');
    do {
      const response: any = await ai.models.list({ pageToken });
      const models = response.models || [];
      for (const m of models) {
        console.log(`- ${m.name} | ${m.displayName} | actions: ${m.supportedActions?.join(',')}`);
      }
      pageToken = response.nextPageToken;
    } while (pageToken);
  } catch (error: any) {
    console.error('Error listing models:', error);
  }
}

run();
