import { NextRequest } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

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

async function testGenerateRoute() {
  console.log('Testing POST handler from app/api/reports/generate/route.ts...');
  const { POST } = await import('../src/app/api/reports/generate/route');

  const mockReq = new NextRequest('http://localhost:3000/api/reports/generate', {
    method: 'POST',
    body: JSON.stringify({ targetId: 'default' }),
    headers: { 'Content-Type': 'application/json' },
  });

  const res = await POST(mockReq);
  const data = await res.json();

  console.log('Response status:', res.status);
  console.log('Response success:', data.success);
  if (data.report) {
    console.log('✅ Generated Report ID:', data.report.id);
    console.log('✅ Target Brand:', data.report.brandName, `(${data.report.domain})`);
    console.log('✅ Visibility Score:', `${data.report.metrics.visibilityScore.current}% (${data.report.metrics.visibilityScore.delta >= 0 ? '+' : ''}${data.report.metrics.visibilityScore.delta}%)`);
    console.log('✅ Total Citations:', `${data.report.metrics.citations.current} (${data.report.metrics.citations.delta >= 0 ? '+' : ''}${data.report.metrics.citations.delta})`);
    console.log('✅ Engines Evaluated:', data.report.engines.map((e: any) => `${e.engine}: ${e.current}% (${e.delta >= 0 ? '+' : ''}${e.delta}%)`).join(', '));
    console.log('✅ Competitors SoV:', data.report.competitors.map((c: any) => `${c.name}: ${c.share}%`).join(', '));
    console.log('✅ Key Findings:', data.report.narrative.key_findings.substring(0, 120) + '...');
    console.log('✅ Struggle Areas Count:', data.report.narrative.struggle_areas.length);
    console.log('✅ Action Recommendations Count:', data.report.narrative.recommendations.length);
  } else {
    console.error('❌ Error response:', data);
  }
}

testGenerateRoute();
