import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

describe('CRON generate-reports route authentication', () => {
  const originalCronSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    process.env.CRON_SECRET = 'test-secret-123';
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalCronSecret;
  });

  test('returns 401 when Authorization header is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/cron/generate-reports');
    const res = await GET(req);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.error, 'Unauthorized');
  });

  test('returns 401 when Authorization header token is invalid', async () => {
    const req = new NextRequest('http://localhost:3000/api/cron/generate-reports', {
      headers: {
        authorization: 'Bearer wrong-secret',
      },
    });
    const res = await POST(req);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.error, 'Unauthorized');
  });

  test('returns 500 when CRON_SECRET is not configured', async () => {
    delete process.env.CRON_SECRET;
    const req = new NextRequest('http://localhost:3000/api/cron/generate-reports', {
      headers: {
        authorization: 'Bearer test-secret-123',
      },
    });
    const res = await GET(req);
    assert.equal(res.status, 500);
    const body = await res.json();
    assert.match(body.error, /CRON_SECRET is missing/);
  });
});
