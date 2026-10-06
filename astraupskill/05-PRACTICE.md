# Practice

[Course index](README.md) · [Solutions](06-SOLUTIONS-AND-REVIEW.md)

Put new tests in `test/practice.test.cjs` and run them with `node --test test/practice.test.cjs`. The file must end in `.test.cjs` for `npm test` to pick it up. Start each file with:

```javascript
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { openApp } = require("./browser.cjs");
const KEY = "eli-elyn-finance-dashboard-v1";
const two = {
  expenses: [
    { id: "e1", owner: "Household", date: "2026-07-10", category: "Food", description: "Lunch", amount: 10 },
    { id: "e2", owner: "Household", date: "2026-07-11", category: "Transportation", description: "Train", amount: 5 },
  ],
  bills: [], incomes: [], goals: [], investments: [],
};
async function july(doc = two) {
  const app = await openApp({ [KEY]: JSON.stringify(doc) });
  app.document.querySelector("#monthPicker").value = "2026-07";
  app.event("#monthPicker", "change");
  return app;
}
```

---

## Exercise 1: Predict, then run (easy)

**Goal.** Before running anything, write down what each of the four tests in `test/expense-edit.test.cjs` stores, shows and leaves open.

**Hint.** Use the table in [04](04-TESTING-AND-DEBUGGING.md) only *after* you have written your predictions.

**Check.** `node --test test/expense-edit.test.cjs` prints `# pass 4`. For test 2, explain why the stored amount is checked after each rejected value, not only at the end.

## Exercise 2: Sabotage the identity line (easy)

**Goal.** Delete `id: existing.id, ` from `app.js:208`. Predict which tests fail, and what the stored expense looks like.

**Hint.** `map` still replaces by the *old* id (line 209). What does the replacement object's `id` come from now?

**Check.** Exactly test 1 fails. The assertion diff shows `expected: 'e1'` and `actual: 'expense-<uuid>'`. The row count stays 1; the record is re-keyed, not duplicated. Restore the line; `git diff app.js` should be empty.

## Exercise 3: Category change moves money between budgets (medium)

**Goal.** Write a regression showing that editing an expense's category moves its amount from one budget to another without changing total spending or the row count.

**Hint.** Category options for an expense are the budget categories plus `Debt` (`app.js:273-274`). A value that is not in that list cannot be selected. Try `app.document.querySelector("#entryCategory").value = "Travel"` and read the value back before you trust it.

```javascript
test("category edit moves money between budgets", async () => {
  const app = await july();
  app.evaluate("editExpense('e1')");
  app.document.querySelector("#entryCategory").value = "Transportation";
  app.event("#entryForm", "submit");
  const stored = JSON.parse(app.w.localStorage.getItem(KEY));
  assert.deepEqual(stored.expenses.map((e) => [e.id, e.category, e.amount]),
    [["e1", "Transportation", 10], ["e2", "Transportation", 5]]);
  assert.equal(app.document.querySelector("#expenseKpi").textContent, "$15");
  assert.match(app.document.querySelector("#budgetList").textContent.replace(/\s+/g, " "),
    /Transportation \$15 of \$640/);
  app.close();
});
```

**Check.** The test passes. Three things to learn from it:

- The KPI is `"$15"`, not `"$15.00"`, because `money()` drops decimals for whole numbers (`app.js:737`). A regex like `/15\.00/` would fail.
- Setting the value to `"Travel"` reads back as `""`.
- Submitting after that would store `category: ""`, because `validateEntry` never checks category.

## Exercise 4: Characterize an unguarded writer (medium)

**Goal.** Prove what Delete does when storage fails. Do not fix it yet.

**Hint.** The handler at `app.js:583-587` filters `state.expenses`, then calls `saveState()`, then `render()`.

```javascript
test("delete under a failing write (current behavior)", async () => {
  const app = await july();
  app.evaluate("Storage.prototype.setItem=()=>{throw new Error('quota')}");
  app.event('[data-delete-expense="e1"]', "click");
  assert.equal(app.evaluate("state.expenses.length"), 1);                         // memory: deleted
  assert.equal(JSON.parse(app.w.localStorage.getItem(KEY)).expenses.length, 2);  // storage: not deleted
  assert.ok(app.document.querySelector('[data-edit-expense="e1"]'));             // screen: still shown
  app.close();
});
```

**Check.** The test passes against the current code, and jsdom prints `Error: Uncaught [Error: quota]` without failing the test. Memory, storage and screen now hold three different answers to "does e1 exist?". Write the same characterization for the bill paid checkbox (`app.js:631-637`). Set `checked = true` on `[data-bill-paid="b1"]`, dispatch `change`, and confirm that `state.bills[0].paid` is `true` while storage still says `false`.

## Exercise 5: What the number input really delivers (medium)

**Goal.** Measure how `<input type="number">` (`index.html:263`) transforms values before `app.js` reads them.

**Hint.** Inside a test: `const input = app.document.querySelector("#entryAmount"); input.value = "Infinity"; console.log(JSON.stringify(input.value));`. Repeat for each value below.

**Check.** You should observe:

| Set | Read back as |
|---|---|
| `Infinity` | `""` |
| `abc` | `""` |
| `" 5"` | `""` |
| `1e3` | `"1e3"` |
| `-1` | `"-1"` |

Then, in edit mode, submit an empty amount. `#entryError` reads "Enter an amount greater than zero and no more than 999,999,999.99." Decide whether a blank field deserves its own message, and where that check would go.

## Exercise 6: One commit helper for every writer (hard)

**Goal.** Extract a `commitState(next)` helper that writes, then publishes, and returns whether it succeeded. Use it in both submit branches *and* in the three unguarded writers.

**Hint.** Each caller must build a full replacement before calling it:
- Delete: `{ ...state, expenses: state.expenses.filter(...) }`
- Bill toggle: `structuredClone(state)`, then change the copy

Keep the two different submit messages; they tell the user different things. The unguarded writers have no error element today, so decide where their failure message goes.

**Check.**
- `npm test` passes all four original tests unchanged.
- Your Exercise 4 tests, with the assertions inverted (state still 2, the bill still unpaid in `state`), now pass.
- `grep -n "saveState()" app.js` finds no remaining callers, or you have deleted `saveState`.

## Exercise 7: Integer cents (stretch)

**Goal.** Design a versioned migration from `amount` to `amountCents`, and test the conversion function on its own.

**Hint.** `Math.round(value * 100)`, not `Math.floor`: `1.15 * 100` is `114.99999999999999`. Bump a `version` field so the migration runs once.

**Check.**
- A plain Node test of your `toCents` returns `115`, `820` and `435` for `1.15`, `8.2` and `4.35`.
- `migrate(migrate(doc))` deep-equals `migrate(doc)`.

Write the design note first: which functions change (`validateEntry`, `sum`, `money`, and every `render*` that reads `amount`), and how `loadState`'s shallow merge (`app.js:180`) interacts with a document that has a `version` field.

## Exercise 8: Edit a second entity (stretch, design)

**Goal.** Propose income editing (`data-edit-income`). Then propose bill editing, and decide what happens to `dueDay`, which is derived from the date at creation (`app.js:235-241`) and has no stored date afterwards.

**Check.** Your proposal names:
- the mode variable(s): one per entity, or `{ type, id }`
- every place the mode is reset (today: lines 157 and 213)
- the test that would catch an income edit accidentally creating a second income
