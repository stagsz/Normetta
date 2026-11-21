VERDICT: PASS

Scope: `git diff ba04c22...factory/002-ncr-severity-filter`. The only non-factory change is the new test file `backend/src/__tests__/nonConformity.test.ts`. No production code, routes, schema or migrations changed.

Findings:
- No new routes, so no new withAuth, Zod or rate-limit surface to review.
- The test adds coverage that helps security. It checks that invalid or lowercase `severity` values are rejected with 400 (lines ~91-96). It also checks that the severity filter never returns another org's NCRs (lines ~123-131).
- No secrets. Test tokens come from `generateTestToken`, and the seeded emails are dummy `@test.com` addresses.
- Minor (not blocking): the cross-org test only covers `/api/non-conformities`. A test that calls `/api/assessments/<otherOrgAssessmentId>/non-conformities` with the first org's token would also cover IDOR on the per-assessment route. To add it, return the other org's `assessment.id` from `seedOrg`, then assert the response is 403/404 or has empty data.
