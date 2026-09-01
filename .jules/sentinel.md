## 2026-03-01 - Cron Secret Authentication Bypass in Cron Endpoints
**Vulnerability:** The scheduled audit cron route (`/api/cron/process-scheduled-audits`) checked `process.env.NODE_ENV === 'production' && cronSecret` before validating authorization headers. If `CRON_SECRET` was unconfigured, authorization checks were bypassed completely.
**Learning:** Guarding authorization checks with `if (cronSecret)` causes silent authentication bypasses whenever environment variables are missing or misconfigured.
**Prevention:** Always enforce Bearer token authentication unconditionally on sensitive cron/admin endpoints and return a 500 configuration error if server secrets are missing.
