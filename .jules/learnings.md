# Learnings

- When reviewing Next.js/React component import statements, double check both `lucide-react` icon exports and sub-component imports (such as `@/components/ui/card`) for unused symbols.
- Using static code analysis tools like TypeScript (`tsc --noEmit`) and Next build (`next build`) validates import correctness and ensures bundle integrity.
