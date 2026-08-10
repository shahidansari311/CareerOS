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
    const response = await ai.models.list();
    // GoogleGenAI list returns an object with a models array
    const modelsList = (response as any).models || [];
    console.log('Total models:', modelsList.length);
    const generateContentModels = modelsList.filter((m: any) => m.supportedActions?.includes('generateContent'));
    for (const m of generateContentModels) {
      console.log(`- ${m.name} (${m.displayName})`);
    }
  } catch (error: any) {
    console.error('Error:', error);
  }
}

run();
