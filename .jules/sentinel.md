## 2025-05-18 - Unauthenticated Vercel Cron Endpoints
**Vulnerability:** Publicly accessible `/api/cron/generate-reports` route allowed unauthenticated execution of expensive LLM API calls and write operations to the `audit_reports` database table.
**Learning:** Next.js API routes configured under `/api/cron/` are publicly accessible endpoints unless protected explicitly by Bearer token verification against `CRON_SECRET`.
**Prevention:** All cron API routes must inspect `request.headers.get('authorization')` against `process.env.CRON_SECRET` and return 401 Unauthorized or 500 Misconfigured before performing database queries or AI API dispatch.
