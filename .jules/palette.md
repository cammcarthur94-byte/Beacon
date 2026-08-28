## 2026-03-09 - Radio Group Accessibility in Modal Custom Options
**Learning:** Custom selection cards rendered using non-semantic `<div>` tags lack keyboard focusability, screen reader role context (`radiogroup`/`radio`), and `aria-checked` attributes.
**Action:** Replace unclickable/div selection options with `<button type="button" role="radio" aria-checked={...}>` within a `role="radiogroup"` wrapper and ensure `focus-visible:ring-2` styles are applied.
