# Build — 002 NCR severity filter (round 1)

Branch: `factory/002-ncr-severity-filter` (worktree `C:\Users\staff\anthropicFun\Normetta-wt\002-ncr-severity-filter`)
Commit: `3367052 test(ncr): cover severity filter on NCR list endpoints`

## Summary
The spec says the feature already exists, and the tests confirm it. I added one backend Jest integration test file. All 7 tests pass on the first run, so I made no production code changes.

## Files changed
- `backend/src/__tests__/nonConformity.test.ts` (new, 133 lines)

There are no changes to `prisma/schema.prisma`, no migrations and no frontend files.

## Acceptance criterion -> test
| AC | Test |
|---|---|
| 1 | `returns only MAJOR NCRs with a matching pagination total` (2 seeded MAJOR, total === 2) |
| 2 | `returns all severities when no severity filter is given` (set = {MINOR, MAJOR, CRITICAL}, total 6) |
| 3 | `rejects invalid severity "minor" with 400` and `rejects invalid severity "BOGUS" with 400` (it.each) |
| 4 | `combines severity and status filters` (CRITICAL+OPEN -> exactly 1) |
| 5 | `filters by severity on the per-assessment route` (a second assessment in the same org has a MINOR that must be excluded) |
| 6 | `never returns NCRs from another organization` (a second org seeded with all severities, checked for none/MINOR/MAJOR/CRITICAL) |
| 7 | Backend tsc passes. **Frontend tsc fails, but the errors were already there** (see below) |
| 8 | `git diff --stat main..HEAD` shows only the test file |

## Verification
The test DB was a throwaway `postgres:16` container on port 55432, with the schema loaded via `prisma db push`. The container has been stopped and removed. The worktree has no `.env`, and nothing is running on the main repo's localhost:5432.

```
backend: npx tsc --noEmit                         -> OK
backend: npx jest src/__tests__/nonConformity.test.ts -> Tests: 7 passed, 7 total
backend: npx jest (full)                           -> 81 failed, 33 passed, 114 total
backend: npx jest (full, excluding new file)       -> 81 failed, 26 passed, 107 total
```
The new file adds 7 passing tests and no new failures. The 81 failures in assessment/auth/onboarding happen on main too. Most are logins returning no `data` ("Your email domain is not allowed for this organization"). Onboarding cleanup also hits an FK violation on `assessment_templates_organizationId_fkey`. This job does not fix them.

Frontend `npx tsc --noEmit` errors that were already there, in files this branch does not touch:
- `src/app/(dashboard)/dashboard/page.tsx` (35, 41, 152, 173)
- `src/components/layout/header.tsx` (176, `placeholder` on button)
- `src/components/standards/section-detail-panel.tsx` (29, 34)

## Addressed review items
None (round 1).
