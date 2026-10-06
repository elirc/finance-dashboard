# Concepts

[Course index](README.md)

## 1. A shared form needs an explicit mode

Create and edit use the same `<dialog>`, but they mean different things:

- **Create** mints a new id and adds a record.
- **Edit** keeps an existing id and replaces one record.

The app makes the mode explicit with one variable, `editingExpenseId`, which `handleEntrySubmit` checks at `app.js:205`. `editExpense` also disables the type select (`app.js:804`), so an expense cannot be "edited" into an income. Wherever a form serves two modes, find the single place the mode is decided and every place it is reset. Here that is lines 157, 213 and 802 (see 01, "The edit-mode flag").

## 2. Identity survives an edit

`handleEntrySubmit` builds the entry, including a brand-new id, *before* it knows the mode (`app.js:193-199`). The edit branch then fixes the id back:

```javascript
const updated = { ...existing, ...entry, id: existing.id, category: els.entryCategory.value };
```

Spread order is the whole mechanism: later keys win, so `id: existing.id` must come after `...entry`. Removing it does not create a duplicate row. `map` still replaces the record at the old position (`app.js:209`). What it does is silently re-key the record to `expense-<uuid>`. Test 1 catches that (`assert.equal(stored.expenses[0].id, "e1")`); 05 Exercise 2 has you prove it.

## 3. Derived values cannot go stale

No total is stored. `getViewData` (`app.js:300-342`) recomputes income, spending, open bills, net worth and the savings rate from `state` on every `render()`. So an edit only has to change one record, and every KPI, chart and budget bar follows. This is also why moving an expense's date to another month makes it vanish from the current view without being deleted. The month filter is a string prefix test (`app.js:304`).

## 4. Persist, then publish

"Publish" means assigning to `state`, because that is what `render()` reads. Both submit branches follow the same order:

1. Build a complete replacement (`next`).
2. `localStorage.setItem(storageKey, JSON.stringify(next))` inside `try`.
3. On failure, show a message and `return` while the dialog is still open.
4. On success, `state = next`, then close the dialog and render.

If the write throws, nothing visible has changed and the user can retry. The three unguarded writers (`app.js:150-151`, `584-585`, `633-635`) do it the other way round: mutate, then save. When their save throws, the in-memory state has changed but storage has not. `render()` is skipped because the exception escapes the listener, so the screen shows a third version.

## 5. A copy must be deep enough for what you mutate

The edit branch can use a shallow spread, `{ ...state, expenses: state.expenses.map(...) }`. `map` returns a new array and `updated` is a new object, so nothing shared is mutated.

The create branch cannot. It pushes onto arrays (`next.expenses.push`) and increments nested fields (`goal.current += entry.amount`, `app.js:250`; `account.balance += ...`, line 255). With `const next = { ...state }`, both of those would mutate the published `state` before the write. That is why line 224 uses `structuredClone(state)`. The existing test 3 already fails if you swap in a shallow spread, because the pushed expense lands in `state.expenses` too. 06 shows the goal-contribution version of the same failure.

## 6. The browser converts before you validate

`<input id="entryAmount" type="number" min="0" step="0.01">` (`index.html:263`) sanitizes its value before `app.js` sees it. Measured in jsdom (05 Exercise 5):

| Typed or set value | `input.value` | `Number(input.value)` |
|---|---|---|
| `Infinity` | `""` | `0` |
| `abc` | `""` | `0` |
| ` 5` (leading space) | `""` | `0` |
| `1e3` | `"1e3"` | `1000` |
| `-1` | `"-1"` | `-1` |

In a real browser, `required`, `min="0"` and `step="0.01"` usually stop the form from firing `submit` at all for a blank, negative or three-decimal amount. The tests dispatch `submit` directly, which skips that interactive validation. So does any script that calls the handler. In that path, unparseable input reaches `validateEntry` as `0` and gets the "greater than zero" message (`app.js:787-788`), even though nobody typed zero. `validateEntry` is the gate the code can rely on:

- finite, and between 0 and 999,999,999.99 (line 787)
- at most two decimals, checked with a tolerance (line 789)
- non-blank description (line 791)
- a date-shaped string (line 792) that also survives a round trip through `toISOString()` (lines 793-795), which rejects `2026-02-30`

## 7. Binary floats and money

`0.1 + 0.2 !== 0.3` in JavaScript. This app stores amounts as numbers and relies on `money()` (`app.js:733-739`) to round on display. The two-decimal check uses a tolerance because `8.2 * 100` is `819.9999999999999`; a strict `!==` comparison would reject an ordinary price. Integer cents remove that whole class of problem; 05 Exercise 7 is the migration.
