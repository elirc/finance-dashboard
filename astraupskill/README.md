# Finance Dashboard: validated expense editing

This is a hands-on course for a junior software engineer using the actual project in `finance-dashboard`. The central skill is **form modes, stable identities and derived totals**. The implementation is already present: use it as a worked example, then recreate a small variation independently.

## What you will be able to do

- Explain the purpose of the changed code and the data it owns.
- Trace an action from input through validation, state/persistence and output.
- Predict a success case and a failure case before running either.
- Read the regression tests and explain what each assertion proves.
- Implement a related change without copying the worked answer.
- Explain a limitation and a reasonable next step without overstating readiness.

## Prerequisites

Be comfortable with variables, arrays, objects, functions, conditionals and calling a function. For React projects, review props, state and event handlers. For API projects, review JSON, HTTP methods and promises, then learn the relevant SQL operations as you trace the request. You do not need to memorize the whole repository first.

## Start the project

Serve this folder over HTTP and open the printed URL: `npx serve .` or `python -m http.server 8000`. Do not double-click `index.html`. `app.js` reads `localStorage` at module load, and over a `file://` origin several browsers either block storage outright or share one origin with every other local page, so the dashboard looks empty or shows someone else's records. The delivered browser check used a local HTTP server. For the automated DOM tests, run `npm install`, then `npm test` from this project folder.

The commands are run from this project’s folder, not from the Desktop inventory repository. Existing README/Fable material remains available. This folder teaches the implemented change and points to executable source and tests rather than replacing older guides.

### Toolchain

This course was delivered and verified on **Node 22.16.0**, **npm 10**. Use the same major versions: newer patch releases are fine, older majors are untested here.

`npm test` from the project root runs `node --test test/*.test.cjs`. npm runs scripts through `cmd.exe` on Windows, and `cmd.exe` does not expand the `test/*.test.cjs` glob; neither does PowerShell for a native command. Node's own test runner expands the pattern (Node 21+), so `npm test` works on Node 22 - but on an older Node, or with a different runner, you will see "no test files". The shell-independent equivalent is:

```powershell
node --test test/expense-edit.test.cjs
```

## Reading and practice order

1. [Codebase map and reading order](01-CODEBASE-MAP.md)
2. [Concepts explained from first principles](02-CONCEPTS.md)
3. [Worked implementation and examples](03-WORKED-CHANGE.md)
4. [Tests, failure cases and debugging](04-TESTING-AND-DEBUGGING.md)
5. [Guided and independent exercises](05-PRACTICE.md)
6. [Solutions, tradeoffs and review rubric](06-SOLUTIONS-AND-REVIEW.md)
7. [Actual verification results and limits](VERIFICATION.md)

8. [Step-by-step trace lab and concrete examples](07-TRACE-LAB.md)

## Your first session

1. Open the app or its tests and reproduce one normal workflow.
2. Read chapter 1 while keeping [app.js](../app.js) open.
3. Write a prediction for the worked example in chapter 3 before executing it.
4. Run the focused test suite and explain one assertion aloud.
5. Complete the first practice exercise, then check the solution discussion.

Keep a short learning log with four fields: prediction, observed result, explanation and next question. A mismatch is useful evidence: find the exact layer where your mental model diverged from the program. Use a disposable browser profile or local test database for failure experiments so your own records are not part of the fixture.

## Scope

The existing modal supports an expense-edit mode with prefilled values, positive finite two-decimal amounts, real calendar dates and nonblank descriptions. Failed validation or storage keeps the original expense and the editor open. Totals continue to be derived from state.

**What is editable, and what is not.** Only **expenses** have an edit path. The modal creates incomes, bills, goal contributions and investment contributions, but there is no `editIncome`, no `editBill` and no per-row edit control for them: `data-edit-expense` is rendered on expense rows only (`app.js:570`). So "validated editing with stable record identity" is, today, a single-entity lesson under a dashboard-wide title. Extending it to incomes is exercise 2's natural follow-on, and the interesting part is not the copy-paste - it is that bills are *derived* on creation (a date becomes a `dueDay` at `app.js:241`), so an edit has to decide whether it re-derives or preserves.

**Both write paths now persist before publishing.** The delivered change applied that rule to the edit branch only; the create branch 15 lines below still pushed into `state` and then called the unguarded `saveState()`. As of the 2026-09-17 follow-up both branches build a complete replacement state and write it before assigning to `state` (`app.js:208-212` and `:224-260`). Three `saveState()` call sites remain outside this handler - `app.js:151`, `:585` and `:635`, covering the bill paid/autopay toggles and the settings form - and they are still unguarded. That is an honest remaining gap, not a hidden one; closing it is exercise 3.

This is one bounded improvement, not certification of every feature. Read VERIFICATION.md for checks actually executed. Exercises are intentionally future practice; do not confuse them with completed implementation.
