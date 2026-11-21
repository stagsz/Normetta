# 003 - Audits empty state

## Route mapping (what "/audits" actually is)

There is no `/audits` route in the frontend. No `app/**/audits/` directory exists, and nothing in
`frontend/src` links to `/audits`. The org-wide list of audits is **`/assessments`**, served by
`frontend/src/app/(dashboard)/assessments/page.tsx` (heading "Assessments", subtitle "Manage your ISO 9001
self-assessments and audits"). Each assessment has an `auditType` (INTERNAL | EXTERNAL | SURVEILLANCE |
CERTIFICATION). `/assessments/[id]/audit` and `/assessments/[id]/audit-harmony` show one assessment's audit
workspace, not a list, so an "org has no audits" state does not apply to them.

So this feature means: **the empty state on `/assessments` when the organization has no assessments.**

## Current state: the feature already exists

- `frontend/src/components/assessments/AssessmentsEmptyState.tsx` already renders two variants on top of
  `@/components/ui/empty-state`:
  - `hasFilters=false`: "No assessments yet", a short description, and a "Create your first assessment"
    CTA that links to `/assessments/new`.
  - `hasFilters=true`: "No matching assessments" and a "Clear all filters" button (shown only when
    `onClearFilters` is passed).
- `assessments/page.tsx` line ~354 renders it when `!isError && assessments.length === 0`, with
  `hasFilters = Boolean(q || status)`. The sort bar and pagination are hidden when the list is empty. The
  loading skeleton and the error card take priority over it.

Nothing tests any of this. The frontend has no test files at all, and `jest.config.js` points
`setupFilesAfterEnv` at `src/__tests__/setup.tsx`, **which does not exist**, so `npm test` cannot run
in the frontend today.

## Goal

Lock in the existing empty-state behaviour on `/assessments` with Jest tests, and make the frontend Jest
setup runnable so those tests can run. No visual or behavioural change for users.

## Out of scope

- Adding a `/audits` route, redirect, or rewrite. If a `/audits` -> `/assessments` redirect is wanted,
  it is a separate job and needs product sign-off.
- Renaming "Assessments" to "Audits" anywhere in the UI.
- Backend changes. `GET /assessments` is already scoped to the org via the JWT `organizationId`.
- Empty states on other pages (NCR, actions, dashboard widgets).
- Rewording the copy or redesigning the existing empty state.
- The "More Filters", "Clone", and "More" buttons that currently do nothing.

## Files likely touched

| File | Change |
|---|---|
| `frontend/src/__tests__/setup.tsx` | **Create.** Minimal file: `import '@testing-library/jest-dom';` |
| `frontend/src/components/assessments/__tests__/AssessmentsEmptyState.test.tsx` | **Create.** Unit tests for the component |
| `frontend/src/app/(dashboard)/assessments/__tests__/page.test.tsx` | **Create.** Page-level tests that mock `useAssessments`, `next/navigation`, `@/lib/api`, `sonner` |
| `frontend/package.json` | **Only if needed.** `jest` is ^29.7.0 but `jest-environment-jsdom` is ^30.4.1. If the env fails to load, pin `jest-environment-jsdom` to ^29.7.0 |

No production source files should change. If a test shows a real bug, report it in build.md and do not
widen scope silently.

## Acceptance criteria

1. `cd frontend && npx jest` finds and runs the new test files and exits 0. This needs
   `src/__tests__/setup.tsx` to exist.
2. `AssessmentsEmptyState` with `hasFilters={false}` renders the heading "No assessments yet" and a link
   whose `href` is `/assessments/new` and whose name includes "Create your first assessment".
3. `AssessmentsEmptyState` with `hasFilters={true}` and an `onClearFilters` mock renders
   "No matching assessments" and does **not** render the "Create your first assessment" link. Clicking
   "Clear all filters" calls the mock exactly once.
4. `AssessmentsEmptyState` with `hasFilters={true}` and no `onClearFilters` renders no
   "Clear all filters" button.
5. Page test: when `useAssessments` returns `{ data: { data: [], pagination: { page: 1, totalPages: 0,
   totalItems: 0, pageSize: 10 } }, isLoading: false, isError: false }` and the search params are empty,
   the page renders "No assessments yet". It renders neither the "Sort by:" bar nor the pagination
   control.
6. Page test: with the same empty data but search params `status=DRAFT` (uppercase, per the enum
   convention), the page renders "No matching assessments" and not "No assessments yet".
7. Page test: when `isError: true`, the page renders "Failed to load assessments" and no empty-state
   heading.
8. Page test: when `isLoading: true`, no empty-state heading is rendered (the skeleton shows instead).
9. `cd frontend && npx tsc --noEmit` passes.
10. `cd frontend && npm run build` passes, and the build output still has no `/audits` route (no new
    routes added).

## UX notes

The UI does not change. For reference, the current behaviour is:
- A new org with zero assessments sees the ClipboardList icon, "No assessments yet", and a primary CTA
  "Create your first assessment" that goes to `/assessments/new`. The header's "New Assessment" and
  "Export to CSV" buttons stay visible.
- An org with assessments where the filters match nothing sees the Search icon, "No matching
  assessments", and an outline "Clear all filters" button that resets the URL to `/assessments`.
- The filter card always stays visible. The sort bar and pagination are hidden when the list is empty.
