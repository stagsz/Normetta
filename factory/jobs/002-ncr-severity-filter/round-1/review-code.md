VERDICT: PASS

Scope: one new file, backend/src/__tests__/nonConformity.test.ts. No production, schema or migration changes (AC8 met).

AC coverage:
- AC1: MAJOR test checks status 200, length 2, every item MAJOR, and pagination.total 2.
- AC2: the unfiltered test checks that all three severities appear and that the total is 6.
- AC3: it.each over 'minor' and 'BOGUS' asserts 400 and no `data`.
- AC4: CRITICAL+OPEN returns exactly 1 item, which matches the seed.
- AC5: the per-assessment route returns 1 MINOR, and the second assessment's MINOR is excluded by the length check.
- AC6: a second org is seeded with all severities, and the test checks none/MINOR/MAJOR/CRITICAL for leaks.
- AC7: backend tsc passes. The frontend tsc errors are in files this branch doesn't touch and already exist on main.

Non-blocking notes:
- nonConformity.test.ts:112 `expect(res.body.data[0].assessmentId ?? assessmentId).toBe(assessmentId)` can never fail, because the fallback is the expected value. Either assert `res.body.data[0].assessmentId` directly (if the service returns it) or delete the line. The length-1 check already covers the exclusion.
- nonConformity.test.ts:128 The AC6 leak check relies on the title prefix 'NCR Other Org'. This works because the titles are seeded, so it is fine.
- 81 pre-existing failures in other suites are not caused by this branch, and the new file adds only passing tests.
