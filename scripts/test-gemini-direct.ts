import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

// Load .env.local manually
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [k, ...v] = trimmed.split('=');
        if (k && v.length > 0) {
          process.env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    });
  }
} catch (e) {}

async function testGeminiModels() {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  console.log('Testing key:', key?.substring(0, 10));

  const genAI = new GoogleGenerativeAI(key!);
  const models = [
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro',
    'gemini-pro',
  ];

  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const res = await model.generateContent('Say hello in 5 words');
      console.log(`✅ Model ${m} works:`, res.response.text().trim());
    } catch (err: any) {
      console.log(`❌ Model ${m} failed:`, err.message?.substring(0, 90));
    }
  }
}

testGeminiModels();
