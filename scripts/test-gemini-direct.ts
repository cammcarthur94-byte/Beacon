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
  const key = process.env.GEMINI_API_KEY;
  console.log('Testing key:', key?.substring(0, 10));

  try {
    const genAI = new GoogleGenerativeAI(key!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const res = await model.generateContent('Say hello in 5 words');
    console.log('GoogleGenerativeAI direct response:', res.response.text());
  } catch (err: any) {
    console.error('Direct GoogleGenerativeAI error:', err.message);
  }
}

testGeminiModels();
