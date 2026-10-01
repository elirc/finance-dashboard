# Trace lab: expense editing is replacement, not insertion

[Course index](README.md)

## Calculate the expected total

Start with expense e7 for 20 and expense e8 for 30. Edit e7 to 12.50. The ids must remain e7 and e8; the total changes from 50 to 42.50.

Trace the real `editingExpenseId`, modal fields and stored object in [app.js](../app.js).

## The six boundaries of one submitted entry

The dashboard is a single page, but the submit handler crosses the same boundaries an API request does. Walk them with [app.js](../app.js) open; the interesting part of this project is that *two different operations* share every one of them.

**1. The input surface - the `<dialog>` and its openers, `app.js:799-815` (`editExpense`) and the per-row control at `app.js:570`.** One modal, two modes. `editExpense` prefills six fields, sets `editingExpenseId`, **disables** the type select (`app.js:804`) so an expense cannot be edited into an income, and retitles the heading. Creating simply opens the same dialog with the type select live. The mode is carried entirely by one module-level variable, `editingExpenseId` - find every place it is set and cleared before reading further, because a stale value here would turn the next create into an overwrite.

**2. Normalization - `handleEntrySubmit`, `app.js:192-199`.** Six form strings become an entry object. `Number(els.entryAmount.value)` is the only type conversion and the one that matters; `els.entryDescription.value.trim()` is the only normalization that changes a value it will accept; and the id is minted here (`app.js:194`) for *both* modes - which is why the edit branch has to overwrite it later. Note what is **not** normalized: `els.entryDate.value` is passed through as a string and validated by pattern, never by `new Date()` alone.

**3. Validation - `validateEntry`, `app.js:786-797`, called at `app.js:201`.** Context-free rejection, in a fixed order: finite and in range, at most two decimal places, non-blank description, date-shaped, real calendar date. The last check is the one juniors omit - `/^\d{4}-\d{2}-\d{2}$/` accepts `2026-02-30`, so the function round-trips through `toISOString().slice(0,10)` and compares (`app.js:794`). Nothing has been written at this point, and the message is written to `#entryError` inside the still-open modal so the user can correct it in place.

**4. Existence and identity - `app.js:205-209`.** This boundary exists only in edit mode and has no analogue in create. `state.expenses.find(...)` re-reads the record *at submit time* rather than trusting what `editExpense` put in the form, and bails out with "This expense no longer exists." if it has gone (case 4 of the test suite forces exactly that by emptying `state.expenses` between opening and submitting). Then `{ ...existing, ...entry, id: existing.id, category: ... }` merges the form over the stored record with the original id forced last. In an API this is the "load the row you are about to update, inside the same request" step - and `newcodexJS/05-recipe-manager` shows what it takes to make that read trustworthy under concurrency (`SELECT ... FOR UPDATE` inside the write transaction).

```javascript
const after = before.map(expense => expense.id === 'e7'
  ? { ...expense, amount: 12.50 }
  : expense);
```

This is a reduced replacement pattern. Adding a new record would double-count the unchanged original.

**5. The persistence boundary - `app.js:210-212` (edit) and `app.js:258-260` (create).** Both branches now do the same three things in the same order: build a complete replacement (`next`), `localStorage.setItem` inside a `try`, then `state = next`. The failure text differs because the recovery differs - "The original expense is unchanged." versus "Nothing was added." - and in both cases the `return` happens *before* `els.entryModal.close()`, which is why the editor stays open and the user can retry. Compare with the three `saveState()` calls still outside this handler (`app.js:151`, `:585`, `:635`): same app, weaker guarantee, and now you can say exactly what is weaker about it.

**6. Publication and render - `app.js:262-266` and `render`, `app.js:286`.** `state = next` was the publication; everything after it is display. `render` recomputes the view through `getViewData`, and every total - the expense KPI the tests assert on, the month filter, the budget bars - is derived from `state` per render. There is no stored total to update, which is why an edit that changes an expense's *date* to another month makes it vanish from the current view without anything being deleted. Ask the last question of this layer: what does a repeated submit do? In create mode it adds a second row with a new id; in edit mode `editingExpenseId` was cleared at `app.js:213`, so the second submit is a *create*. That is a real trap and worth a prediction before you run it.

Now trace a failure backwards. Patch `Storage.prototype.setItem` to throw and submit a valid new expense (case 3). Which layer observed the failure? Five. Which layers had already finished? One through four - including the minted id at `app.js:194`, which is discarded, so a retry produces a *different* id than the failed attempt. Whether that matters is a design question: for a local dashboard it does not; for a POST to a server it is exactly why idempotency keys exist.

## Conversion is not validation

HTML inputs provide text. `Number('')` is zero, `Number('abc')` is NaN, and `Number('Infinity')` is infinite. Check positive finite amounts and the supported two-decimal precision. Predict rejection for 0, -3, 1.234 and Infinity. A blank description is invalid, and 2026-02-30 is not a real date even though its characters match a date-shaped pattern.

## Locate the commit point

Follow candidate expense, candidate complete state, storage write, publication and render. If storage fails, the old amount remains authoritative and the editor stays available with feedback. A success message alone would not prove that reload will retain the edit.

The expense array is authoritative; displayed totals are derived. Change the expense date to another month in a disposable fixture and predict which month's total changes. Use the month picker before interpreting an absent filtered row as deletion.

JavaScript floating-point arithmetic is not a general-purpose financial ledger. A later exact-currency exercise should deliberately use a representation such as integer minor units throughout calculation, conversion and display.
