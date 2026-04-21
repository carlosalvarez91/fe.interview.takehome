# Event Package Builder — Frontend

A multi-step wizard for configuring and finalising a company event package.  
Runs against the local API at `http://localhost:3002`.

---

## Quick Start

```bash
# From repo root — starts both API and web
npm run dev

# Or individually
npm run dev --filter=api   # http://localhost:3002
npm run dev --filter=web   # http://localhost:5173
```

---

## Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styles | Tailwind CSS 3 |
| State | `useState` / `useReducer` (no external library) |
| HTTP | `fetch` with a thin typed wrapper |

---

## Product Reasoning

### 1. Information Hierarchy

The primary hierarchy is: **provider → plan → configure → review**. Each step is gated — you cannot skip ahead because downstream choices depend on upstream ones (you can't configure options without a plan).

Within the **plan selection** step, the most decision-relevant information is surfaced inline:
- **Price** — large, right-aligned, because it's the fastest filter
- **Approval badge** — shown before selection, not after, so users aren't surprised at submit time
- **Constraints** (min participants, lead time, option count) — shown as secondary metadata beneath the name

I de-emphasised description text because the API descriptions tend to be short and secondary to price/constraints. If descriptions were richer, I'd give them more weight.

### 2. Constraint Communication

Constraints are shown **before** the user commits to a plan, not buried in error messages after:

- `approval_type: manager_review` → amber "Requires approval" badge on the plan card
- `min_participants` and `lead_time_days` → visible on the plan card
- Required options (`required: true`) → marked with `*` in the configure step, and a warning appears if the user tries to proceed without filling them

This lets users self-qualify plans before investing time in configuration.

### 3. Error Recovery

| Failure | Recovery path |
|---|---|
| Network error loading providers | Inline error with "Try again" button that re-triggers the fetch |
| Network error loading plans | Same — error shown in-place with retry |
| PUT /estimate fails | Error shown above the "Review & Submit" button; user can adjust selections and retry |
| POST /estimate/finalise fails | Error shown above the "Finalise" button; user can retry without losing selections |
| Validation blockers from API | Shown in red on the review screen; user navigates back to fix them |

State is preserved across retries — going back to a previous step does not clear the user's work. Selections are only cleared when the user explicitly switches to a different plan and confirms.

### 4. One Decision I'd Revisit

**No live pricing on the configure step.**

Currently, pricing is only fetched when the user clicks "Review & Submit" (PUT /estimate). On the configure step, the user sees no running total while they're selecting options and add-ons, which means there's no feedback about the cost impact of each choice.

I'd add a debounced PUT /estimate call on every selection change so the configure step shows a live total (with a subtle loading indicator). The tradeoff I was avoiding is network noise and potential race conditions from rapid checkbox toggling — those are solvable with a proper debounce + cancellation strategy (AbortController), but it adds complexity that felt out of scope for the initial version.

---

## Ambiguous Scenario Decisions

### Stale pricing (user steps away and returns)

When the user returns to the review step after a gap, the price shown is whatever the API returned at the time of the last PUT /estimate call. If prices have changed server-side since then, the user won't know.

**Decision:** When navigating to the review step, I detect a price drift by comparing the new API response total to the previously stored estimate total. If they differ, a dismissible amber banner appears: "Pricing has been updated — the total below reflects current server pricing." The user can acknowledge it and proceed.

I did not add a periodic re-fetch (e.g. every 30s) because the user may be mid-configuration and interrupting with updates would be disruptive. The banner approach is reactive and non-blocking.

### Partial selection preservation on plan switch

When a user switches plans after having made selections, we show a confirmation dialog. On confirm, we preserve any selections where:
- The **same option code** exists in the new plan, AND  
- The **selected value** is in the new plan's allowed values

Incompatible or missing values are cleared (not defaulted to the first available value, to avoid silent wrong choices). Single-value options are always auto-selected regardless.

**Rationale:** Silently clearing everything feels punishing; silently preserving everything can produce invalid state. Confirming + preserving compatible selections gives the user a head-start while being transparent about what changed.

### Single-value options

Options with exactly one allowed value are displayed as **informational chips** ("Open seating"), not as interactive radio buttons. There is nothing to choose, so presenting a radio group would be misleading.

These are auto-selected in state when the plan is first loaded, ensuring the server receives the correct value without requiring user interaction.

### Unknown option codes

The API may return option codes the UI doesn't have a registered label for (e.g., `catering_license_tier`). Rather than crashing or hiding them, the UI:
1. Converts the code to Title Case (`Catering License Tier`) as the group label
2. Converts each value to Title Case as the option label
3. Renders a standard radio group

This makes the intent readable without requiring a hard-coded label registry to be exhaustive.

---

## Accessibility Summary

### Implemented

- **Keyboard navigation:** All interactive elements (cards, radio labels, checkboxes, buttons) are reachable via Tab and activated via Enter/Space.
- **Focus management:** When the wizard step changes, focus is moved to the step's `<h2>` heading (via `tabIndex={-1}` + `focus()` on step change). This ensures screen reader users hear the new page context immediately.
- **ARIA live regions:** The pricing summary on the review step uses `aria-live="polite" aria-atomic="true"` so screen readers announce price changes. The status screen uses `aria-live="assertive"` to announce the final booking status.
- **Form semantics:** Radio groups use `<fieldset>` + `<legend>`. Checkboxes use visible `<label>` wrappers with `htmlFor`. Required fields have `aria-label="required"` on the asterisk.
- **Role annotations:** Loading spinners have `role="status"` with `aria-label`. Error alerts have `role="alert"`. The plan-switch dialog uses `role="dialog" aria-modal="true"` with labelled heading.
- **Screen reader only text:** Radio inputs are visually hidden (`sr-only`) while their parent label remains the interactive target — this keeps the visual card-style UI intact while preserving native radio semantics.
- **Step indicator:** Uses `aria-current="step"` on the current step marker and `<nav aria-label="Progress">`.

### Known Gaps

- **Dialog focus trap:** The plan-switch confirmation dialog moves focus to the confirm button but does not trap focus within the dialog. A full implementation would cycle Tab/Shift+Tab within the dialog's focusable elements and restore focus to the triggering element on close.
- **No automated accessibility testing:** Validation was done by inspecting the rendered markup and running a manual keyboard walkthrough. I did not run axe or Lighthouse in this session. If time permitted, I'd add `@axe-core/react` in development mode for continuous feedback.
- **ARIA live for loading states:** Loading spinners announce via `role="status"` but only the initial announcement is guaranteed; subsequent re-triggers of the same spinner may not be re-announced in all screen readers.

---

## Edge Cases Handled

| Case | Handling |
|---|---|
| Provider with empty location | Shows "Location not specified" in italic |
| Provider with null logo_url | Shows initials avatar fallback |
| Logo URL that fails to load | `onError` hides the broken image |
| Provider with no plans | Empty state with "back to providers" link |
| No providers at all | Illustrated empty state |
| Option group with 1 value | Rendered as read-only info chip, auto-selected |
| Unknown option codes | Title-cased label derived from code, raw values rendered |
| Add-on with price_cents = 0 | Shown as "Free" in green |
| Values that look like numbers (`"1"`, `"2"`) | Treated as strings throughout; no coercion |
| Validation blockers from API | Shown in review step, finalise button disabled |
| PUT /estimate error | Shown inline, user can retry |

---

## Optional Enhancements (Not Implemented)

- Loading skeletons on plan cards
- Autosave / optimistic pricing on the configure step (see "One Decision I'd Revisit")
- Plan comparison view
- "Why is this required?" tooltips using `plan_option_group.description`
