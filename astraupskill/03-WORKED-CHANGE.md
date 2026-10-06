# Worked change

[Course index](README.md)

## Before and after

**Before:** expenses could be added and deleted but not edited. The shared submit handler accepted some malformed amounts without useful feedback.

**After (2026-09-08):**
- `editExpense` (`app.js:799-815`) opens the existing modal in edit mode.
- `validateEntry` (`app.js:786-797`) enforces positive finite two-decimal amounts, real calendar dates and non-blank descriptions.
- The edit branch of `handleEntrySubmit` writes before it publishes.

**Follow-up (2026-09-17):** the create branch was changed to the same persist-then-publish order, and tests 3 and 4 were added.

## Opening the editor

```javascript
function editExpense(id) {
  const expense = state.expenses.find((item) => item.id === id);
  if (!expense) return;
  editingExpenseId = id;
  els.entryType.value = "expense";
  els.entryType.disabled = true;
  updateCategoryOptions();
  els.entryOwner.value = expense.owner;
  els.entryDate.value = expense.date;
  els.entryAmount.value = expense.amount;
  els.entryCategory.value = expense.category;
  /* ...description, heading, clear #entryError, showModal, focus... */
}
```

`updateCategoryOptions()` runs *before* `entryCategory.value` is set. It rebuilds the `<select>` with `innerHTML` (`app.js:283`), which resets the selection to the first option, `Housing` (measured in jsdom). Swap the two lines and every edited expense would silently be re-categorised as Housing. A related trap: assigning a value with no matching `<option>` leaves the select at `""` (05 Exercise 3).

## The edit branch (`app.js:205-219`)

```javascript
if (editingExpenseId) {
  const existing = state.expenses.find((item) => item.id === editingExpenseId);
  if (!existing) { errorNode.textContent = "This expense no longer exists."; return; }
  const updated = { ...existing, ...entry, id: existing.id, category: els.entryCategory.value };
  const next = { ...state, expenses: state.expenses.map((item) => item.id === existing.id ? updated : item) };
  try { localStorage.setItem(storageKey, JSON.stringify(next)); }
  catch { errorNode.textContent = "Could not save. The original expense is unchanged."; return; }
  state = next;
  editingExpenseId = null;
  /* ...re-enable type select, reset form, close modal, render... */
}
```

Three details carry the lesson:

1. **The record is re-read at submit time** (line 206), not trusted from when the editor opened. If it has gone, the user gets a specific message (test 4).
2. **`id: existing.id` comes after `...entry`**, so the id minted at line 194 cannot win.
3. **`next` is a complete replacement.** A failed `setItem` returns before `state = next`, so there is nothing to roll back, and the dialog stays open for a retry (test 2).

## The create branch, before and after the follow-up

Before, each type branch mutated the published `state` in place and then called `saveState()`:

```javascript
if (type === "expense") {
  state.expenses.push({ ...entry, category: els.entryCategory.value });  // mutates published state
}
/* ...income, bill, goal, investment, all against `state`... */
saveState();   // a throw here leaves the row on screen but not in storage
```

After (`app.js:224-260`):

```javascript
const next = structuredClone(state);
if (type === "expense") {
  next.expenses.push({ ...entry, category: els.entryCategory.value });
}
/* ...the same five branches, all against `next`... */
try { localStorage.setItem(storageKey, JSON.stringify(next)); }
catch { errorNode.textContent = "Could not save. Nothing was added."; return; }
state = next;
```

`structuredClone` is required here, not a stylistic choice. The goal and investment branches increment fields on nested objects (`app.js:248-255`). The expense branch pushes onto an array. Both would leak into `state` through a shallow copy. Swapping in `{ ...state }` makes test 3 fail (verified 2026-10-06).

## Three variations to predict, then check

All three concern the amount, read as `Number(els.entryAmount.value)` at `app.js:197` and gated by `validateEntry`.

**Variation 1: `0.1 + 0.2`.** Edit the $10 fixture expense to `0.1` and create a second July expense of `0.2`.
- Both are accepted, because each has at most two decimals.
- `#expenseKpi` shows `$0.30`, because `money()` rounds for display.
- `state.expenses[0].amount + state.expenses[1].amount` is `0.30000000000000004`.

The display hides the drift; integer cents (05 Exercise 7) remove it.

**Variation 2: `1.001` and `8.2`.** `1.001` is rejected with "Use no more than two decimal places." `8.2` is accepted and stored as `8.2`. Read the check at `app.js:789`:

```javascript
Math.abs(entry.amount * 100 - Math.round(entry.amount * 100)) > 0.00001
```

A strict `entry.amount * 100 !== Math.round(entry.amount * 100)` would reject `8.2`, because `8.2 * 100` is `819.9999999999999`.

**Variation 3: text that is not a plain number.** Set `#entryAmount` to `Infinity`, `abc` and `1e3`:
- `type="number"` sanitizes the first two to `""`, so `Number("")` is `0`, rejected as "greater than zero".
- `1e3` is a valid number string, so it is accepted as `1000`.
- An empty field gives the same "Enter an amount greater than zero ..." message.

The `!Number.isFinite` guard at line 787 never sees `Infinity` through this input. It protects callers that bypass the input element.

## Explain it back

In five minutes, cover:
- the original problem
- the identity invariant and the line that enforces it
- why the create branch needs `structuredClone`
- which test fails for each sabotage in 05 Exercise 2
- one remaining gap, such as the three unguarded writers
