## 2025-05-15 - Pre-indexing Relational Records in Data Aggregation Server Actions

**Learning:** When generating dashboard analytics from database query results, performing nested linear array searches (`responses.find()` or `citations.filter()`) inside processing loops creates an $O(N^2)$ bottleneck as response and citation counts scale.

**Action:** Always pre-index query results into `Map` lookups (e.g., `Map<string, Response>` for $O(1)$ entity retrieval and `Map<string, Citation[]>` for pre-grouped child lists) prior to aggregation loops, reducing processing complexity to $O(N)$.
