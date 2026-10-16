# 002 — NCR list: filter by severity

## Goal

Users can filter the NCR list by severity (MINOR | MAJOR | CRITICAL).

**Finding: the feature already exists end to end.** Nothing in production code needs to change:

| Layer | Location | Status |
|---|---|---|
| Zod query schema | `backend/src/controllers/nonConformityController.ts:19-22` (`ncrListQuerySchema`, `severity: z.enum(['MINOR','MAJOR','CRITICAL']).optional()`) | done |
| Controller | same file, `listAll` (l.62-74) and `listByAssessment` (l.96-109) pass `severity` through | done |
| Service | `backend/src/services/nonConformityService.ts:65-66` and `165-166` (`where.severity = filters.severity`) | done |
| API client | `frontend/src/lib/api.ts:251-268` (`nonConformitiesApi.list` / `listByAssessment` accept `severity`) | done |
| Hook | `frontend/src/hooks/useNonConformities.ts:61` | done |
| UI | `frontend/src/app/(dashboard)/non-conformities/page.tsx:47-51, 101, 163-164, 200, 257-261` (severity dropdown, URL param `?severity=`, page reset, clear filters) | done |

What is missing is test coverage. No backend test references `severity`. Smallest useful change: add a backend Jest integration test that locks in the current behavior. Change production code only if that test shows a bug.

## Out of scope

- Selecting more than one severity at once (for example `?severity=MAJOR,CRITICAL`)
- Changes to the severity filter on the assessment-detail NCR tab, beyond what the shared backend test covers
- Prisma schema changes and migrations (none needed)
- Restyling the filter UI, and the "More Filters" button
- Frontend component tests (the frontend has no React Testing Library setup for pages)

## Files likely touched

- `backend/src/__tests__/nonConformity.test.ts` (new). Reuse `backend/src/__tests__/helpers.ts`, which already cleans `nonConformity`, and follow the patterns in `assessment.test.ts`.
- Only if a test fails: `backend/src/controllers/nonConformityController.ts` and/or `backend/src/services/nonConformityService.ts`.

## Acceptance criteria

1. Seed one org with an assessment that has NCRs of each severity (MINOR, MAJOR, CRITICAL). `GET /api/non-conformities?severity=MAJOR` with a valid auth token returns 200, and every item has `severity === 'MAJOR'`. The pagination total equals the number of seeded MAJOR NCRs. (Jest)
2. `GET /api/non-conformities` with no `severity` returns NCRs of all three severities. (Jest)
3. `GET /api/non-conformities?severity=minor` (lowercase) and `?severity=BOGUS` return 400 validation errors, not 500 and not an unfiltered list. (Jest)
4. `GET /api/non-conformities?severity=CRITICAL&status=OPEN` returns only NCRs matching both values. (Jest)
5. `GET /api/assessments/:assessmentId/non-conformities?severity=MINOR` returns only MINOR NCRs for that assessment. (Jest)
6. The severity filter does not leak data across orgs: NCRs from a second organization never appear in results for the first org's user. (Jest)
7. `cd backend && npx tsc --noEmit` and `cd frontend && npx tsc --noEmit` pass.
8. No changes to `backend/prisma/schema.prisma` and no new migration directory.

## UX notes

No UX change. Current behavior, for reference and for the reviewer to check manually:
- The "All Severity" dropdown on `/non-conformities` sets `?severity=<VALUE>` in the URL with an uppercase value, and resets to page 1.
- "Clear filters" in the empty state clears severity together with status and search.
