# Codebase map

[Course index](README.md)

## Files

| File | What it holds |
|---|---|
| `index.html` | Page layout, the `<dialog id="entryModal">` add/edit form (fields from line 241), `<p id="entryError" role="alert">` (line 275), canvases for four charts, and the Chart.js CDN script (line 8). |
| `app.js` | Everything else: seed data, state, event wiring, validation, rendering and storage. |
| `styles.css` | Presentation only. |
| `test/browser.cjs` | Opens `index.html` in jsdom and evaluates the real `app.js` inside it (see 04). |
| `test/expense-edit.test.cjs` | Four regression tests for the edit and create paths. |

## `app.js` in reading order

| Lines | What |
|---|---|
| 1 | `storageKey` |
| 41-86 | `defaultState`: `budgets`, `incomes`, `expenses`, `bills`, `goals`, `investments` (seeded July 2026 data) |
| 88-90 | Module-level mutable state: `state`, `charts`, `editingExpenseId` |
| 94-99 | `DOMContentLoaded`: cache elements, wire controls, first render |
| 141-174 | `initializeControls`: month picker set to today, Reset, Add, Close/Cancel, submit |
| 176-184 | `loadState`: parse storage and **shallow-merge** it over a clone of `defaultState`. Any missing top-level collection falls back to the seed data. |
| 186-188 | `saveState`: an unguarded `localStorage.setItem` |
| 190-267 | `handleEntrySubmit`: build entry, validate, then the edit branch (205-219) or the create branch (224-266) |
| 269-284 | `updateCategoryOptions`: rebuilds the category `<select>` for the chosen type |
| 286-298 | `render`: recompute the view and redraw everything |
| 300-342 | `getViewData`: filter by owner and month, compute every total |
| 558-589 | `renderExpenses`: rows with Edit (570) and Delete (571) buttons, and their listeners |
| 591-639 | `renderBills`: bill cards and the paid checkbox listener (631-638) |
| 786-797 | `validateEntry` |
| 799-815 | `editExpense`: switch the modal into edit mode |

## The data an expense carries

`{ id, owner, date, category, description, amount }`, for example `exp-1` at `app.js:57`. New ids are minted at `app.js:194` as `` `${type}-${crypto.randomUUID()}` ``. Dates are `YYYY-MM-DD` strings, and month filtering is a string prefix test (`item.date.startsWith(month)`, line 304). Amounts are JavaScript numbers.

## Every place the app writes to storage

| Where | Trigger | Order | Guarded? |
|---|---|---|---|
| `app.js:210-212` | edit submit | build `next` -> `setItem` in `try` -> `state = next` | yes |
| `app.js:258-260` | create submit | `structuredClone(state)` -> mutate copy -> `setItem` in `try` -> `state = next` | yes |
| `app.js:150-152` | Reset button | `state = clone(defaultState)` -> `saveState()` -> `render()` | no |
| `app.js:584-586` | Delete expense | `state.expenses = filter(...)` -> `saveState()` -> `render()` | no |
| `app.js:633-636` | bill paid checkbox | `bill.paid = checked` (in place) -> `saveState()` -> `render()` | no |

In the unguarded rows, a throwing `setItem` leaves `state` already changed, and `render()` is never reached. Memory, storage and screen then disagree; 05-PRACTICE Exercise 4 measures this.

## The edit-mode flag

`editingExpenseId` (line 90) is the whole mode switch.

- **Set:** in `editExpense` (line 802).
- **Cleared:** when Add is clicked (line 157) and after a successful edit (line 213).
- **Not cleared:** Close and Cancel (lines 164-165) only close the dialog.

The flag stays stale until the next Add click. That is harmless today, because Add is the only other way to open the dialog. But any new opener must remember to reset it, or a "create" would overwrite an expense.

## Totals are derived

`getViewData` (lines 300-342) recomputes every number on each `render()`. Nothing is cached. One detail surprises people: monthly spending is `sum(expenses) + sum(paidBills)` (line 315). Bills have no date, only a `dueDay`, so `getViewData` filters them by owner only, never by month (line 308). Marking a bill paid therefore raises "spent" in *every* month you view.
