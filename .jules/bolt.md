## 2025-02-26 - Telemetry Data Pre-Indexing in Server Actions

**Learning:** Server actions fetching telemetry data (like `getDashboardMetrics`) retrieve relational rows (`responses`, `citations`, `prompts`) and aggregate them in JS. Performing nested array operations like `responses.find()` per citation ($O(C \times N)$) or `citations.filter()` per engine ($O(E \times C)$) scales poorly with database growth.
**Action:** Always pre-index fetched relational collections into `Map` lookups (`responseMap`, `citationCountByResponseId`) before performing aggregation loops in server actions to guarantee $O(1)$ lookups and $O(N + C)$ overall processing time.
