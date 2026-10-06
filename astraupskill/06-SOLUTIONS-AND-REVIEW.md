# Solutions and review

[Course index](README.md) · [Practice](05-PRACTICE.md)

Every Check below was run on 2026-10-06 against the current `app.js`, with jsdom 25.0.1 on Node 22.16.0. Sabotage and refactor exercises were run on scratch copies outside the repo.

## Exercise answers

**1. Predict, then run.** 4 pass. A single check at the end of test 2's loop would also catch a bad write, because nothing ever writes 10 back. Checking inside the loop *localizes* it instead: the failure names the exact value (`-1`, `0` or `1.001`) that slipped through.

**2. Identity sabotage.** Only test 1 fails: `expected: 'e1'`, `actual: 'expense-…'`. Test 2 never reaches a successful write, test 3 is create mode, and test 4 exits at the existence check. The length assertion in test 1 still passes. Removing the line does not duplicate the row; `map` keyed on `existing.id` replaces it in place. It *re-keys* the record. Anything else that referred to `e1` (a future receipt attachment, an undo stack, a URL) would now point at nothing. Identity bugs are often quiet like this.

**3. Category move.** The provided test passes: stored categories are `Transportation` and `Transportation`, the KPI reads `$15`, and the budget list contains `Transportation $15 of $640`. A version that used `"Travel"` would silently set the select to `""`. `validateEntry` (`app.js:786-797`) does not check category, so the expense would be saved with an empty category, and its spending would disappear from every budget bar. If you want to close that, validate `els.entryCategory.value` against the options that `updateCategoryOptions` produced. Do not just check that it is non-empty.

**4. Unguarded writers.** Both characterizations pass against the current code:
- Delete: `state` has 1 expense, storage has 2, and the row is still on screen.
- Bill toggle: `state.bills[0].paid === true` while storage has `false`. The checkbox shows checked, so the screen agrees with memory but not with storage. A reload "unpays" the bill.

In both handlers the exception escapes the listener before `render()` (`app.js:586`, `636`), which is why the screen is not refreshed.

**5. Input sanitization.** The table in the exercise is the measured result. A blank amount gets the generic range message. A dedicated "Enter an amount" message belongs in `validateEntry`, keyed on the raw string being empty before `Number()` converts it. That means passing the raw value in, or checking `els.entryAmount.value === ""` in `handleEntrySubmit` before building `entry`.

**6. One commit helper.** This version passed the four original tests plus inverted versions of the Exercise 4 tests (7 of 7) on a scratch copy, and left no `saveState()` callers:

```javascript
function commitState(next) {
  try { localStorage.setItem(storageKey, JSON.stringify(next)); }
  catch { return false; }
  state = next;
  return true;
}

// edit branch (replaces the try/catch and `state = next`)
if (!commitState(next)) { errorNode.textContent = "Could not save. The original expense is unchanged."; return; }

// create branch
if (!commitState(next)) { errorNode.textContent = "Could not save. Nothing was added."; return; }

// delete (app.js:583-587)
const next = { ...state, expenses: state.expenses.filter((e) => e.id !== button.dataset.deleteExpense) };
if (!commitState(next)) { window.alert("Could not delete. Nothing was changed."); return; }
render();

// bill toggle (app.js:632-637)
const next = structuredClone(state);
const bill = next.bills.find((item) => item.id === input.dataset.billPaid);
if (bill) bill.paid = input.checked;
if (!commitState(next)) { input.checked = !input.checked; window.alert("Could not save. The bill is unchanged."); return; }
render();

// reset (app.js:150-152)
if (!commitState(structuredClone(defaultState))) { window.alert("Could not reset. Your data is unchanged."); return; }
render();
```

Review points:

- **The bill toggle must undo the checkbox itself** (`input.checked = !input.checked`). `render()` does not run on failure, so nothing else would correct the DOM.
- **Delete can use a shallow spread** because `filter` returns a new array. The bill toggle cannot, because it mutates a nested object. That is the same rule as the create branch.
- **`window.alert` is a placeholder.** jsdom does not implement it, so stub `app.w.alert = () => {}` in tests. A page-level `role="status"` element outside the `<dialog>` is the better product choice.
- **Messages stay at the call site.** `commitState` returns a boolean rather than owning the text, because "unchanged" and "nothing was added" tell the user different things.

**7. Integer cents.** `Math.round(v * 100)` gives 115, 820, 435 for 1.15, 8.2, 4.35. `Math.floor` would give 114 and 434 for the first and last. Watch `loadState`: `{ ...structuredClone(defaultState), ...JSON.parse(stored) }` (`app.js:180`) means a stored document without `version` still gets the default `budgets` and other collections. Your migration must run *after* that merge and must not migrate the defaults twice. If the version is bumped and stored once, `migrate(migrate(doc))` equals `migrate(doc)`.

**8. A second entity.** A single `editing = { type, id } | null` scales better than one variable per entity. It is reset in the same two places as today (Add at `app.js:157`, after success at `213`). Also reset it on Close and Cancel (164-165), which today do not clear the flag. For bills, either store the full due date, or make the edit form ask for a day of the month. Re-deriving `dueDay` from a date picker defaults to *today's* date (`app.js:144`), which silently moves the bill. The catch-it test: edit an income, then assert `state.incomes.length` is unchanged and the id is preserved, as in test 1.

## Review notes on the delivered code

Observations with evidence, for practising review comments:

- **Persist-before-publish covers two of five writers.** Delete, the bill toggle and Reset still mutate first (`app.js:150-151`, `584-585`, `633-635`). Exercise 4 shows the resulting three-way disagreement.
- **Paid bills count as spending in every month.** `expenseTotal = sum(expenses) + sum(paidBills)` (`app.js:315`). Bills are filtered by owner only (line 308). A bill marked paid while viewing July also raises August's "spent". Worth raising as a product question.
- **`editingExpenseId` survives Close and Cancel** (`app.js:164-165`). It is harmless only because Add resets it (line 157). A second opener, such as a keyboard shortcut, would inherit a stale edit mode and overwrite an expense.
- **Category is not validated.** See Exercise 3.
- **Ids are interpolated into HTML attributes unescaped** (`data-edit-expense="${expense.id}"`, `app.js:570`; also 571 and 615). App-minted ids are safe UUIDs. But `loadState` trusts whatever is in `localStorage`, so a hand-edited or imported document could inject markup. `escapeHtml` already exists (`app.js:765`); use it on ids too.
- **Two tabs overwrite each other.** Each tab keeps its own `state` and writes the whole document. There is no `storage` event listener, so the last save wins.
