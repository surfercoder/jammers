---
description: Run npm run checks, fix everything to 100% (using parallel agents), then commit and push
argument-hint: "[optional PR title or notes]"
allowed-tools: Bash, Read, Edit, Write, Grep, Glob, Agent, TodoWrite
---

# /create-pr

Goal: get `npm run checks` to pass **completely clean** (react-doctor, ESLint with `--max-warnings 0`, and Jest with full coverage), then commit and push the branch and open a PR.

Optional user notes for this run: $ARGUMENTS

## What "100%" means here

`npm run checks` runs three gates in order — **all three must be green**:

1. `react-doctor -y` — zero issues reported.
2. `eslint . --max-warnings 0` — zero errors **and** zero warnings.
3. `jest --coverage` — all tests pass **and** coverage thresholds are met (treat 100% statements / branches / functions / lines as the target unless `jest.config.ts` defines explicit lower thresholds — in that case meet the configured thresholds and report the actual numbers).

## Procedure

1. **Baseline.** Run `npm run checks` and capture the full output. If it is already fully clean, skip to step 5.

2. **Triage.** Group the failures into independent buckets, e.g.:
   - react-doctor findings
   - ESLint errors/warnings (group by file or rule)
   - Failing tests
   - Coverage gaps (files/lines not covered → need new or expanded tests)

   List the buckets with TodoWrite so progress is visible.

3. **Fix — parallelize with subagents.** For independent buckets, dispatch multiple `Agent` (general-purpose) subagents **in a single message** so they run concurrently. Give each agent:
   - a precise, self-contained scope (specific files/rules/tests — no overlap with sibling agents to avoid edit conflicts),
   - the relevant slice of the `npm run checks` output,
   - the project conventions from `AGENTS.md`/`CLAUDE.md` (Next.js 16, React 19 with React Compiler ON — **no manual `useMemo`/`useCallback`/`memo`**, Tailwind v4 semantic tokens, shadcn via CLI, Supabase helpers in `src/utils/supabase/`, middleware is `src/proxy.ts`),
   - an instruction to **fix the root cause, not suppress it** — do not add blanket `eslint-disable`, do not weaken coverage thresholds, do not delete/skip tests to make them pass. Write real tests for uncovered code.

   Run buckets that touch the same files sequentially, not in parallel.

4. **Re-run and iterate.** After agents report back, run `npm run checks` again. Repeat triage → fix → re-run until **all three gates are fully green**. Do not stop early or declare success on a partial pass — show the final clean output.

5. **Commit & push.**
   - Review `git status` and `git diff` so you know exactly what changed.
   - If on the default branch (`main`), create a feature branch first (e.g. `fix/checks-green` or a name derived from $ARGUMENTS).
   - Stage and commit with a clear message describing the work. End the commit message with:
     ```
     Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
     ```
   - Push with `-u` to set upstream.

6. **Open the PR.** Use `gh pr create` with a concise title (use $ARGUMENTS if provided) and a body summarizing the changes and confirming all checks pass. End the PR body with:
   ```
   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   ```
   Print the PR URL when done.

## Guardrails

- Never make checks pass by cheating: no disabling rules wholesale, no lowering coverage thresholds, no `.skip`/`xfail`/deleting assertions.
- Only commit and push once `npm run checks` is genuinely clean. If it cannot be made clean, stop and report what's blocking instead of pushing.
- Match existing code style and test patterns in the repo.
