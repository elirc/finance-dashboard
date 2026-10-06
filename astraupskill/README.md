# Finance Dashboard: validated expense editing

This course uses the household finance dashboard in this folder. It is a single page with no build step: `index.html` (286 lines), `styles.css`, and one script, `app.js` (815 lines). Charts come from Chart.js, loaded from a CDN (`index.html:8`). All data lives in the browser's `localStorage` under the key `eli-elyn-finance-dashboard-v1` (`app.js:1`).

The skill being taught is **form modes, stable identity and derived totals**. One modal both creates entries and edits expenses. An edit must replace the existing record without changing its id. Every total on screen is recomputed from saved state rather than stored separately. A failed save must leave both the data and the screen unchanged.

## Run it

Serve the folder over HTTP rather than opening the file directly: `npx serve .` or `python -m http.server 8000`. `app.js` reads `localStorage` as soon as it loads (`app.js:88`), and browsers handle storage for `file://` pages inconsistently.

For the automated tests, run `npm install` and then `npm test`. The only dependency is `jsdom` (`package.json`). `npm test` runs `node --test test/*.test.cjs`. On Windows, neither `cmd.exe` nor PowerShell expands that glob; Node 22's test runner expands it itself. On older Node, name the file instead:

```bash
node --test test/expense-edit.test.cjs
```

Expected: `# tests 4`, `# pass 4`, `# fail 0`.

## Reading order

1. [01-CODEBASE-MAP](01-CODEBASE-MAP.md): the state shape, the submit handler, the render pipeline, and every place the app writes to storage.
2. [02-CONCEPTS](02-CONCEPTS.md): form modes, identity, persist-before-publish, shallow versus deep copies, and why browser inputs are not validation.
3. [03-WORKED-CHANGE](03-WORKED-CHANGE.md): the edit branch and the create-branch follow-up, line by line.
4. [04-TESTING-AND-DEBUGGING](04-TESTING-AND-DEBUGGING.md): how `test/browser.cjs` runs the real `app.js` inside jsdom.
5. [05-PRACTICE](05-PRACTICE.md): exercises from easy to stretch, each with a runnable Check.
6. [06-SOLUTIONS-AND-REVIEW](06-SOLUTIONS-AND-REVIEW.md): solutions and review notes.
7. [07-TRACE-LAB](07-TRACE-LAB.md): one submit traced through six boundaries.
8. [VERIFICATION](VERIFICATION.md): what was executed, and the gaps that remain.

## Scope

**Only expenses can be edited.** The modal creates incomes, bills, goal contributions and investment contributions, but the only per-row Edit control is on expense rows (`data-edit-expense`, `app.js:570`). Bills are *derived* on creation: the chosen date becomes a `dueDay` (`app.js:235-241`). So editing a bill would have to decide whether to re-derive that field or preserve it.

**Two of the five write paths are guarded.** Both branches of `handleEntrySubmit` build a complete replacement state, write it, and only then publish it (`app.js:208-212` for edit, `224-260` for create). Three other writers still mutate `state` first and then call the unguarded `saveState()`:

- the Reset button (`app.js:150-151`)
- expense Delete (`app.js:584-585`)
- the bill "paid" checkbox (`app.js:633-635`)

05-PRACTICE Exercise 4 demonstrates what goes wrong, and Exercise 6 fixes it.
