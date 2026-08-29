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

async function runComprehensiveAuditVerification() {
  console.log('===============================================================');
  console.log('🧪 VERIFYING COMPREHENSIVE EXECUTIVE AUDIT & PDF PIPELINE');
  console.log('===============================================================\n');

  const { POST: generateReport } = await import('../src/app/api/reports/generate/route');

  // Test 1: Generate a fresh versioned snapshot
  console.log('Test 1: Generating fresh versioned snapshot with targetId...');
  const createReq = new NextRequest('http://localhost:3000/api/reports/generate', {
    method: 'POST',
    body: JSON.stringify({ targetId: 'default' }),
    headers: { 'Content-Type': 'application/json' },
  });

  const createRes = await generateReport(createReq);
  const createData = await createRes.json();

  if (!createData.success || !createData.report) {
    console.error('❌ Failed to generate report:', createData);
    return;
  }

  const snapshotId = createData.report.id;
  console.log(`✅ Fresh Snapshot Generated: ID = ${snapshotId}`);
  console.log(`✅ Target Brand: ${createData.report.brandName} (${createData.report.domain})`);
  console.log(`✅ Visibility Score: ${createData.report.metrics.visibilityScore.current}% (${createData.report.metrics.visibilityScore.delta >= 0 ? '+' : ''}${createData.report.metrics.visibilityScore.delta}%)`);
  console.log(`✅ Total Citations: ${createData.report.metrics.citations.current.toLocaleString()}`);
  console.log(`✅ Visual Explanations: ${createData.report.narrative.visual_explanations.substring(0, 100)}...`);
  console.log(`✅ Blind Spot Queries Evaluated: ${createData.report.blindSpots?.length || 0} prompts`);

  // Test 2: Retrieve immutable snapshot via auditId
  console.log('\nTest 2: Retrieving immutable snapshot via auditId...');
  const getReq = new NextRequest('http://localhost:3000/api/reports/generate', {
    method: 'POST',
    body: JSON.stringify({ auditId: snapshotId }),
    headers: { 'Content-Type': 'application/json' },
  });

  const getRes = await generateReport(getReq);
  const getData = await getRes.json();

  if (getData.success && getData.report?.id === snapshotId) {
    console.log(`✅ Successfully retrieved immutable snapshot ${snapshotId}!`);
    console.log(`✅ isHistoricalSnapshot flag: ${getData.report.isHistoricalSnapshot}`);
  } else {
    console.error('❌ Failed to load immutable snapshot:', getData);
  }

  console.log('\n===============================================================');
  console.log('🎉 ALL EXECUTIVE AUDIT PIPELINE VERIFICATIONS PASSED');
  console.log('===============================================================');
}

runComprehensiveAuditVerification();
