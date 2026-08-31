# Bolt's Journal - Performance Learnings

## 2025-05-18 - Optimized RegExp and String Lookups in HighlightText
**Learning:** Frequent re-creation of dynamic RegExp instances and inner loop array iterations with `.toLowerCase()` calls in text highlighting components can cause noticeable main thread lag on large LLM response transcripts. Using `React.useMemo` to cache the compiled RegExp and converting match targets into a `Set` for $O(1)$ lookup eliminates redundant string allocations and regex compilations on every render.
**Action:** When creating text search or syntax highlighting components in React, always memoize the compiled RegExp and use a `Set` for lowercased term matching. Wrap the component in `React.memo`.
