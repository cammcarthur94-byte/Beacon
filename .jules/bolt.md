## 2025-03-03 - Memoized RegEx & Set Lookups in Highlighting Components
**Learning:** Re-compiling regular expressions via `new RegExp(...)` and running nested `.some()` array iterations during text highlighting inside list items/drawers creates unnecessary allocations and CPU overhead on re-renders. Sorting terms by length descending also prevents greedy prefix matches in regular expression alternations.
**Action:** Wrap text highlighting components with `React.memo`, memoize term/RegEx parsing and node splitting with `useMemo`, and use `Set.has()` for O(1) term matching.
