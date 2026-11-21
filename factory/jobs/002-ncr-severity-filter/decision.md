APPROVE

## Reasons
- Diff (`git diff ba04c22...factory/002-ncr-severity-filter`) is one new file: `backend/src/__tests__/nonConformity.test.ts` (+133). No production code, no schema, no migration, no deps, nothing in auth, billing or security code.
- All 4 round-1 reviews (code, security, UI, UX) PASS.
- AC1-6: each has its own Jest test (mapping in build.md). I checked the assertions against the spec.
- AC7: I re-ran `backend npx tsc --noEmit` and it passes. The diff touches no frontend files, so the frontend tsc errors cannot come from this branch. They are in `dashboard/page.tsx`, `header.tsx` and `section-detail-panel.tsx`. I did not re-run frontend tsc myself; that these errors also exist on main comes from build.md and the launcher.
- AC8: no changes to schema.prisma and no new migration directory.
- I re-ran the tests myself on a throwaway `postgres:16` container (port 55433, schema loaded with `prisma db push`, container stopped afterwards): `nonConformity.test.ts` -> 7 passed, 7 total.

## Non-blocking follow-ups
- Line 112: `expect(res.body.data[0].assessmentId ?? assessmentId).toBe(assessmentId)` can never fail. Assert the field directly or delete the line.
- Add an IDOR test: call the other org's `/api/assessments/:id/non-conformities` with the first org's token.
- 81 tests fail in other suites, on main too. That needs its own job.
