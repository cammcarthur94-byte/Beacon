## 2025-05-18 - Authorization Bypass in Cron Route via Conditional NODE_ENV Check
**Vulnerability:** The `/api/cron/process-scheduled-audits` endpoint guarded authorization behind `if (process.env.NODE_ENV === 'production' && cronSecret)`. If `NODE_ENV` was not `'production'` or `CRON_SECRET` was unconfigured, authorization was skipped entirely (failing open).
**Learning:** Checking `NODE_ENV` around authentication checks allows requests to bypass authorization whenever environment variables are missing or during non-production runs.
**Prevention:** Always enforce authentication unconditionally in API routes and fail secure (HTTP 500 when server secrets are missing, HTTP 401 when tokens do not match).
