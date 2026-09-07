# Contributing to Normetta

## Branch/push policy

- Default branch: `main`
- **Prefer PRs for new work:** feature branch → PR → 1 approval → merge.
- **Small fixes/docs updates** may land directly if you explicitly document why PR review is skipped.
- **Admin bypass** must stay enabled for emergencies.
- **Block:** force pushes, branch deletions, unapproved merges.
- Helpful GitHub branch-protection preset:
  - Require 1 approval, dismiss stale reviews.
  - Require status checks to pass before merging.
  - Allow force pushes: disabled.
  - Allow deletions: disabled.
  - Restrict pushes to matching branches: enabled.

## Commit style

Use Conventional Commits, scoped to the area changed:

- `feat(assessment): add score label semantics pass`
- `fix(report): update percentage math to 1-5 scale`
- `docs: clarify NCR thresholds in README`

## Reporting issues

- Reproduction steps + logs/screenshots + environment.
- Security issues: do not open a public ticket; email security@normetta.com.
