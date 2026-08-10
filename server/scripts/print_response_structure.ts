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
    const response: any = await ai.models.list();
    console.log('Is Array?', Array.isArray(response));
    console.log('Keys:', Object.keys(response));
    // Let's print the first 5 elements
    const arr = Array.from(response);
    console.log('Array.from length:', arr.length);
    for (let i = 0; i < Math.min(5, arr.length); i++) {
      console.log(`[${i}]:`, (arr[i] as any)?.name);
    }
    // Also check if there's any property like models, or if we can loop using normal for...in or for...of
    console.log('Try classic for loop over keys:');
    const keys = Object.keys(response).filter(k => !isNaN(Number(k)));
    for (const key of keys) {
      console.log(`Key ${key}:`, response[key].name);
    }
  } catch (error: any) {
    console.error('Error:', error);
  }
}

run();
