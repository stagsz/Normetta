---
name: factory
description: Run the Normetta software factory. /factory "<feature>" | /factory next | /factory approve <id> | /factory rework <id> "<feedback>"
---

# /factory — orchestrator

You (the session running this skill) are the **orchestrator**. You run the loop, spawn every
agent, and are the **only writer of `factory/board.json`**. Agents never see this conversation;
they get context from files only and each writes only its own file.

## The loop (edit this to change the factory)

```
feature → spec-writer(opus) → builder(opus) ─┬─ security(opus) ─┐
              ▲                               ├─ ux(sonnet)      │
              │                               ├─ ui(sonnet)      ├─ WAIT FOR ALL 4
              │   any CHANGES (max 2 rounds)  └─ code(sonnet) ───┘
              └──────── resume builder ◄───────────────┤
                                                       ▼ all PASS
                                              approver(opus)
                                     APPROVE → merge to main
                                     ESCALATE → needs-human  ◄── /factory approve
```

Stages in board.json: `spec` → `build` → `review` → `approve` → `merged` | `needs-human`.

## Commands

| Command | Action |
|---|---|
| `/factory "<feature>"` | New job: next id `NNN-slug`, run the loop |
| `/factory next` | Take the first `- [ ]` line in `factory/backlog.md`, tick it `- [x]`, run it |
| `/factory approve <id>` | Merge a `needs-human` job's branch into main, stage → `merged` |
| `/factory rework <id> "<feedback>"` | Write feedback to `jobs/<id>/rework-<n>.md`, start a new round at step 3 |

## Steps for a job

1. **Create job.** `factory/jobs/<id>/`. Append to board.json:
   `{ "id", "title", "branch": "factory/<id>", "stage": "spec", "round": 0, "reviews": {} }`.
2. **Spec.** Spawn `spec-writer` with: job dir + feature text. Wait for `spec.md`.
3. **Build.** Stage `build`. Round 1: create the worktree
   `git worktree add ../Normetta-wt/<id> -b factory/<id> main` (add `"worktree"` to the job in
   board.json), then spawn `builder` with `name: "builder-<id>"`, prompt = job dir + worktree path.
   Each job has its own worktree, so builders for different jobs can run in parallel.
   Later rounds: **SendMessage to `builder-<id>`** (never a new builder) pointing at
   `jobs/<id>/round-<n-1>/` (or the rework file). Wait for `build.md` to be updated.
4. **Review.** `round += 1`, create `jobs/<id>/round-<n>/`, stage `review`, set all four reviews
   `"pending"`. Spawn the 4 reviewers **in parallel in one message**: `reviewer-security`,
   `reviewer-ux`, `reviewer-ui`, `reviewer-code`, each with job dir + round dir + worktree path.
   As each finishes, read the first line of its file and update its chip in board.json.
5. **WAIT FOR ALL.** The round is done only when all four `review-*.md` files exist in the
   round folder. Never resume the builder mid-round.
   - Any `VERDICT: CHANGES` and round < 3 (i.e. max 2 rework rounds) → back to step 3.
   - Any CHANGES after round 3 → stage `needs-human`, stop.
   - All PASS → step 6.
6. **Approve.** Stage `approve`. Spawn `approver`. Read first line of `decision.md`:
   - `APPROVE` → in the main checkout (which stays on `main`): `git merge --no-ff factory/<id>`,
     then `git worktree remove ../Normetta-wt/<id>`, stage `merged`.
   - `ESCALATE` → stage `needs-human`. Tell the human to run `/factory approve <id>` or `rework`.

## Rules

- Write board.json after every state change (the dashboard polls it). Keep each job's
  `files` array (paths relative to the job folder) current so the dashboard can open them.
- The main checkout stays on `main`; builders never switch its branch.
- Never push. Merging is local; the human pushes.
- Never run DB migrations. Builder may write migration SQL; it's run by hand in Supabase.
- If the main working tree is dirty before merging, stop and ask the human.

Dashboard: `cd factory && python3 -m http.server 8000` → http://localhost:8000/dashboard.html
