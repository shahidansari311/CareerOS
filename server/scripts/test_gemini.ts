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

async function testModel(modelName: string) {
  try {
    console.log(`Testing model: ${modelName}...`);
    const response = await ai.models.generateContent({
      model: modelName,
      contents: 'Hello, are you working?',
    });
    console.log(`Success for ${modelName}:`, response.text);
    return true;
  } catch (error: any) {
    console.error(`Error for ${modelName}:`, error.message || error);
    return false;
  }
}

async function run() {
  const models = [
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash-lite',
    'gemini-flash-latest',
    'gemini-flash-lite-latest'
  ];
  for (const m of models) {
    const ok = await testModel(m);
    if (ok) {
      console.log(`>>> Working model identified: ${m}`);
      break;
    }
  }
}

run();
