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
    console.log('Async iterator check:', typeof (response as any)[Symbol.asyncIterator]);
    
    // If it's an async iterator, let's consume it
    if (typeof (response as any)[Symbol.asyncIterator] === 'function') {
      console.log('Iterating using for-await-of:');
      let count = 0;
      for await (const model of response) {
        console.log(`- Name: ${model.name} | Display: ${model.displayName}`);
        count++;
        if (count >= 50) break; // Limit output
      }
    } else {
      // Let's print the keys and structure of pageInternal
      console.log('pageInternal keys:', Object.keys((response as any).pageInternal || {}));
      console.log('pageInternal content type:', typeof (response as any).pageInternal);
      console.log('pageInternal:', JSON.stringify((response as any).pageInternal, null, 2));
    }
  } catch (error: any) {
    console.error('Error:', error);
  }
}

run();
