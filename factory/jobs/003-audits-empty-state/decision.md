ESCALATE

## Why escalate
- **Dependency added.** `frontend/package.json` gets a new devDependency, `"@testing-library/dom": "^9.3.4"`, and `package-lock.json` changes (103 lines). Adding any dependency is an escalation trigger. The risk is low: it is dev-only, it is the version RTL 14 already pulled in as a transitive dependency, and every lockfile URL resolves to registry.npmjs.org. A human still has to sign off.
- **Full frontend `npx jest` still exits 1 (AC1 partial).** With `@testing-library/dom` installed, three older suites (button, progress-bar, question-card) can load for the first time. They have 25 failures, all from class names that changed in the restyle. Before this change those suites could not load at all, so this is not a regression. But merging makes red tests visible on main. A follow-up job is needed to fix them.

## Verification (re-run in C:\Users\staff\anthropicFun\Normetta-wt\003-audits-empty-state\frontend)
- New suites, run by path with the `(dashboard)` parentheses escaped: **2 suites, 7 tests, all pass**. page.test.tsx did run (4 tests listed), so AC5-8 are verified, not only claimed.
  - AssessmentsEmptyState: 3/3 (AC2, AC3, AC4)
  - AssessmentsPage empty state: 4/4 (AC5 empty, AC6 status=DRAFT, AC7 error, AC8 loading)
- `npx tsc --noEmit`: 7 errors, none in `__tests__` files. They match the errors already on main listed in build.md (dashboard/page.tsx, header.tsx, section-detail-panel.tsx). AC9 fails because of existing errors, not because of this job.
- AC10 (build passes, no `/audits` route): taken from build.md. I did not re-run it.
- The setup.tsx criterion does not apply: `src/__tests__/setup.tsx` already exists on the branch (the spec was wrong).

## Scope check
- No production source changed. No migration, no backend, no auth/billing/security code.
- Round 1 reviews (code, security, UI, UX) all PASS.
- No `.skip`/`.only` or stub tests.

## Recommendation
Approve the merge if the human accepts the devDependency. Open a follow-up job for the 25 stale UI test failures and the existing frontend tsc errors.
