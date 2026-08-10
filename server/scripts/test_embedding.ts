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

async function testEmbedding(modelName: string) {
  try {
    console.log(`Testing ${modelName} with dimensionality 768...`);
    const response = await ai.models.embedContent({
      model: modelName,
      contents: 'Hello, testing embeddings!',
      config: {
        outputDimensionality: 768,
      }
    });
    const values = response.embeddings?.[0]?.values;
    console.log(`Success for ${modelName}: length = ${values?.length}`);
    return values?.length;
  } catch (error: any) {
    console.error(`Error for ${modelName}:`, error.message || error);
    return null;
  }
}

async function run() {
  await testEmbedding('gemini-embedding-001');
  await testEmbedding('gemini-embedding-2');
}

run();
