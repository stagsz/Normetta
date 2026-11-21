# 003 - Audits empty state: build (round 1)

Branch `factory/003-audits-empty-state`, commit `0be5776`.

## Summary
Added Jest tests for the existing empty state on `/assessments` (component and page level). No production source changed.
`setup.tsx` already existed, so I did not create or touch it (team-lead correction). Tests reuse `src/__tests__/test-utils.tsx`.

One dependency fix was needed: `test-utils.tsx` re-exports `@testing-library/user-event`, which needs `@testing-library/dom` as a peer.
It was only installed nested under `@testing-library/react`, so any suite importing test-utils failed with
"Cannot find module '@testing-library/dom'". I added `@testing-library/dom@^9.3.4` as a frontend devDependency (matches RTL 14).
`jest-environment-jsdom` did not need pinning.

## Files changed
| File | Change |
|---|---|
| `frontend/src/components/assessments/__tests__/AssessmentsEmptyState.test.tsx` | new, 3 tests |
| `frontend/src/app/(dashboard)/assessments/__tests__/page.test.tsx` | new, 4 tests. Mocks `next/navigation`, `useAssessments`, `@/lib/api`, `sonner`, `Pagination`, `AssessmentsListSkeleton` |
| `frontend/package.json`, `package-lock.json` | add `@testing-library/dom` devDependency |

## Acceptance criteria -> tests
| # | Status | Test |
|---|---|---|
| 1 | Partial, see below | new suites pass. Full `npx jest` exits non-zero because of failures in older suites |
| 2 | Pass | EmptyState "shows the first-assessment CTA when no filters are active" |
| 3 | Pass | EmptyState "shows the no-match state and clears filters once when clicked" |
| 4 | Pass | EmptyState "hides the clear button when no onClearFilters is passed" |
| 5 | Pass | page "shows "No assessments yet" without sort bar or pagination..." |
| 6 | Pass | page "shows "No matching assessments" when a status filter is active" (`status=DRAFT`) |
| 7 | Pass | page "shows the error card instead of an empty state on error" |
| 8 | Pass | page "shows the skeleton and no empty state while loading" |
| 9 | Fails, already broken | `tsc --noEmit` errors only in files this job did not touch (see below). No errors in the new test files |
| 10 | Pass | `npm run build` exits 0. Route list has `/assessments` and no `/audits` |
| setup.tsx criterion | Skipped | file already exists (team-lead correction) |

## Problems already in the repo (out of scope, not fixed)
- **Older test suites now fail.** Adding `@testing-library/dom` lets `button.test.tsx`, `progress-bar.test.tsx`, and `question-card.test.tsx`
  load for the first time. Before this change they could not load at all. They have 25 failing tests. Every failure I checked expects old
  color/size class names that the design-token restyle replaced. This needs its own job.
- **`npx tsc --noEmit` already fails** in `app/(dashboard)/dashboard/page.tsx` (TS7006, TS2322), `components/layout/header.tsx:176`
  (`placeholder` on a button), and `components/standards/section-detail-panel.tsx:29,34`.

## Output tails
```
PASS src/components/assessments/__tests__/AssessmentsEmptyState.test.tsx
PASS src/app/(dashboard)/assessments/__tests__/page.test.tsx
FAIL src/components/ui/__tests__/progress-bar.test.tsx   (older suite)
FAIL src/components/ui/__tests__/button.test.tsx         (older suite)
FAIL src/components/assessments/__tests__/question-card.test.tsx (older suite)
Test Suites: 3 failed, 5 passed, 8 total
Tests:       25 failed, 154 passed, 179 total

npm run build: exit 0
├ ○ /assessments    7.36 kB    158 kB
```
