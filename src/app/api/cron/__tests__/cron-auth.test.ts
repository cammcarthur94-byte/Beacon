import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { GET as processScheduledAuditsGET } from '../process-scheduled-audits/route';
import { GET as runAuditsGET } from '../run-audits/route';

describe('Cron Endpoints Authorization', () => {
  const originalCronSecret = process.env.CRON_SECRET;

  afterEach(() => {
    if (originalCronSecret !== undefined) {
      process.env.CRON_SECRET = originalCronSecret;
    } else {
      delete process.env.CRON_SECRET;
    }
  });

  describe('/api/cron/process-scheduled-audits GET', () => {
    test('returns 500 when CRON_SECRET is not configured', async () => {
      delete process.env.CRON_SECRET;

      const request = new Request('http://localhost/api/cron/process-scheduled-audits');
      const response = await processScheduledAuditsGET(request as any);
      const data = await response.json();

      assert.equal(response.status, 500);
      assert.equal(data.error, 'Server misconfiguration: CRON_SECRET is missing.');
    });

    test('returns 401 when authorization header is missing or invalid', async () => {
      process.env.CRON_SECRET = 'super-secret-key-123';

      const request = new Request('http://localhost/api/cron/process-scheduled-audits');
      const response = await processScheduledAuditsGET(request as any);
      const data = await response.json();

      assert.equal(response.status, 401);
      assert.equal(data.error, 'Unauthorized');
    });

    test('returns 401 when authorization header has wrong bearer token', async () => {
      process.env.CRON_SECRET = 'super-secret-key-123';

      const request = new Request('http://localhost/api/cron/process-scheduled-audits', {
        headers: {
          authorization: 'Bearer wrong-secret',
        },
      });
      const response = await processScheduledAuditsGET(request as any);
      const data = await response.json();

      assert.equal(response.status, 401);
      assert.equal(data.error, 'Unauthorized');
    });
  });

  describe('/api/cron/run-audits GET', () => {
    test('returns 500 when CRON_SECRET is not configured', async () => {
      delete process.env.CRON_SECRET;

      const request = new Request('http://localhost/api/cron/run-audits');
      const response = await runAuditsGET(request as any);
      const data = await response.json();

      assert.equal(response.status, 500);
      assert.equal(data.error, 'Server misconfiguration: CRON_SECRET is missing.');
    });

    test('returns 401 when authorization header is invalid', async () => {
      process.env.CRON_SECRET = 'super-secret-key-123';

      const request = new Request('http://localhost/api/cron/run-audits', {
        headers: {
          authorization: 'Bearer wrong-secret',
        },
      });
      const response = await runAuditsGET(request as any);
      const data = await response.json();

      assert.equal(response.status, 401);
      assert.equal(data.error, 'Unauthorized');
    });
  });
});
