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
    console.log('Searching for embedding models...');
    for await (const model of response) {
      if (model.supportedActions?.includes('embedContent')) {
        console.log(`- Name: ${model.name} | Display: ${model.displayName} | limits: input=${model.inputTokenLimit}`);
      }
    }
  } catch (error: any) {
    console.error('Error:', error);
  }
}

run();
