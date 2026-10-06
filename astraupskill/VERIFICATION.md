# Verification

[Course index](README.md)

## Original delivery (frozen record)

**Implementation date:** 2026-09-08.

| Check | Result |
|---|---|
| `test/expense-edit.test.cjs` | Passed (exit code 0) |
| Real Chromium browser interaction | Passed |

Two tests were delivered with the original change. Tests 3 and 4 were added in the 2026-09-17 follow-up that moved the create branch to persist-then-publish. That follow-up run reported `# tests 4 / # pass 4 / # fail 0` on Node 22.16.0 with jsdom 25. It also noted that the directory form `node --test test/` failed with `MODULE_NOT_FOUND`; name the file or use `npm test`.

## Re-check, 2026-10-06

- **Suite:** `node --test test/expense-edit.test.cjs` on Node 22.16.0 with jsdom 25.0.1 (the version pinned in `package-lock.json`) gave `# tests 4`, `# pass 4`, `# fail 0`.
- **Practice exercises:** every Check in [05-PRACTICE](05-PRACTICE.md) was run as a scratch test against the current `app.js`:
  - Exercises 3, 4 and 5 against the unmodified file.
  - Exercises 2 and 6 against scratch copies (the identity sabotage fails test 1 only; the `commitState` refactor passes 7 of 7).
  - The shallow-copy sabotage described in 02 and 03 fails test 3.
- **Line references:** all `app.js:N` citations in this course were re-checked against the 815-line file.

## Corrections made in this pass

- **Unguarded writers misnamed.** The earlier text described `app.js:151`, `:585` and `:635` as "bill paid/autopay toggles and the settings form". They are Reset, expense Delete and the bill paid checkbox. There is no autopay toggle or settings form in this app.
- **Exercise 2 solution would have failed.** It used category `"Travel"`, which is not an option (the select reads back `""`), and asserted a KPI of `15.00`, which `money()` renders as `$15`. It also claimed that dropping `id: existing.id` duplicates the row. It re-keys the row instead; see 06.
- **Variation 3 assumed `Infinity` reaches `Number.isFinite`.** `type="number"` sanitizes it to `""` first.
- **Machine-specific paths removed:** references to backup files and reports outside this repository.

## What is not verified

- **Real-browser constraint validation.** `required`, `min` and `step` block some submits before `handleEntrySubmit` runs. The tests bypass this.
- **Charts.** Chart.js does not load under jsdom.
- **Multi-tab behaviour, and browsers other than the one used in the original check.**
- **The three unguarded writers.** They are characterized by 05 Exercise 4 but not fixed in the repo.
