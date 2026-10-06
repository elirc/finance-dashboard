# Testing and debugging

[Course index](README.md)

## Run the checks

```bash
npm install                                 # installs jsdom (the only dependency)
npm test                                    # node --test test/*.test.cjs
node --test test/expense-edit.test.cjs      # same thing, shell-independent
```

Expected: `# tests 4`, `# pass 4`, `# fail 0`.

## How `test/browser.cjs` runs the real app

`openApp(saved)` (63 lines) builds a fake browser around the unmodified `index.html` and `app.js`:

1. **Create the page** (lines 8-11): a `JSDOM` from `index.html` at `http://localhost/` with `runScripts: "outside-only"`. The page's own `<script>` tags, including the Chart.js CDN tag, do not run. So `window.Chart` is undefined, and `upsertChart` returns early (`app.js:469`). Charts are never tested.
2. **Fill gaps jsdom lacks** (lines 14-23): `crypto.randomUUID`, `structuredClone`, and `showModal()`/`close()` stubs that just set `dialog.open`. Tests assert on that flag.
3. **Seed storage** (lines 33-34) with whatever document the test passes in, before the app loads.
4. **Load the app** (lines 35-37): evaluate `app.js` in the window's VM context, then dispatch `DOMContentLoaded`.

Because `app.js` declares `let state` at the top level of that context, `app.evaluate("state.expenses[0].amount")` can read live app state. `app.evaluate("editExpense('e1')")` can call app functions directly.

The helper also fakes `Date.now` and captures `setInterval` (lines 24-32). `app.js` uses neither for scheduling; `Date.now` appears only as a fallback id at line 194. Those lines are shared scaffolding, not something these tests depend on.

## The four tests

| # | Line | Arrange / act | Proves |
|---|---|---|---|
| 1 | 21 | One $10 July expense; set month to `2026-07`; click its Edit button; amount `12.50`; submit | Stored array still has one expense, id `e1`, amount 12.5; `#expenseKpi` shows 12.50; a fresh `openApp` from the saved snapshot still has 12.5 |
| 2 | 39 | `editExpense('e1')`; submit `-1`, `0`, `1.001`; then make `setItem` throw and submit `20` | Stored amount stays 10 through all three rejections; after the failed write, `state` is still 10, the dialog is open, `#entryError` says "Could not save" |
| 3 | 61 | Open the modal as an expense, fill fields, make `setItem` throw, submit | `state.expenses.length` and the stored length both stay 1; dialog open; "Could not save" |
| 4 | 88 | `editExpense('e1')`, then empty `state.expenses` before submitting | `#entryError` is exactly "This expense no longer exists."; storage untouched; dialog open |

Two things to notice:

- **Month picker.** Tests 1 and 3 set the month picker to `2026-07`. `initializeControls` sets it to *today's* month (`app.js:143`), and the fixture expense is dated July 2026. Without that line the expense is filtered out, there is no Edit button, and `app.event('[data-edit-expense="e1"]', ...)` throws on `null`.
- **Missing collections.** The fixture omits `budgets`. `loadState`'s shallow merge (`app.js:180`) fills in the seven default budgets, so category options still exist.

## Debugging a failure

- **`Cannot read properties of null (reading 'dispatchEvent')`.** Your selector matched nothing. Usually the month filter hid the row, or you clicked before `render()`.
- **Stored value changed after a rejected input.** Validation ran *after* a write. Check that `validateEntry` is still called at line 201, before either branch.
- **`state` changed after a failed write.** Something mutated published state before `setItem`: a shallow copy in the create branch, or a new branch that edits `state` directly.
- **A row is visible that storage does not have, or the reverse.** You are probably in one of the three unguarded writers (01, "Every place the app writes to storage"). The listener threw before `render()`.
- **jsdom prints `Error: Uncaught [Error: quota]`.** This happens when an unguarded writer throws inside an event listener. jsdom reports it to the console, but it does *not* fail the test. Assert on state, storage and DOM explicitly.

## What the tests do not prove

- Layout, focus handling, or real browser constraint validation. Tests dispatch `submit` directly, bypassing `required`, `min` and `step` checks.
- Chart rendering.
- Multi-tab behaviour: two tabs each hold their own `state` and overwrite each other's saves.
- The Reset, Delete and bill-toggle paths.
