# Worked implementation and examples

[Course index](README.md)

## Before and after

**Before:** Expenses could be added and deleted, but there was no edit action. The shared submit handler also accepted some malformed amounts without useful feedback.

**After:** The existing modal supports an expense-edit mode with prefilled values, positive finite two-decimal amounts, real calendar dates and nonblank descriptions. Failed validation or storage keeps the original expense and the editor open. Totals continue to be derived from state.

## Predict this example

The fixture contains one $10.00 expense and no paid bills. Edit it to $12.50. There must still be exactly one expense with the same id, monthly spending must be $12.50, and reload must retain $12.50. Trying -1 or 1.001 must leave $10.00 unchanged in a fresh fixture.

Before running anything, write the exact expected stored values and visible response. Include ids or record counts where they matter. Then run the focused tests and reproduce the matching UI/API action. Do not settle for seeing a success message: inspect the authoritative stored result as well.

## Actual implementation excerpt

The excerpt below comes from [app.js](../app.js) near line 799. It is a teaching snapshot; the linked source is authoritative if you later edit the project. Read surrounding code for callers and setup.

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
  els.entryDescription.value = expense.description;
  document.querySelector("#entryModal h3").textContent = "Edit expense";
  document.querySelector("#entryError").textContent = "";
  els.entryModal.showModal();
  els.entryDescription.focus();
}
```

## How to reason through the code

1. Identify the inputs. Distinguish data supplied by a caller from state read from storage or a trusted context.
2. Find the guard clauses. For each early return or thrown error, describe which invariant it protects and whether anything has already been written.
3. Find the candidate state or query. Explain whether it mutates an existing object or constructs a replacement.
4. Locate the persistence operation. For asynchronous code, follow the promise through success and rejection; for transactions, check that all related writes use the same transaction object.
5. Find the output or state publication. Ask what a repeated invocation would do after the first invocation succeeds.

Use this project-specific reasoning as your guide:

Create and edit look similar in the UI but have different identity semantics. Reusing a form is reasonable only when its mode is explicit. A new id on edit would turn an update into an accidental duplicate; replacing the entire expense array with a one-record array would erase unrelated data. The map operation expresses a precise replacement. Deriving totals avoids a second state variable that can become stale after editing. Persistence-before-publish is used on the edit path so storage failure does not pretend success, and since the 2026-09-17 follow-up on the create path as well. The bill toggles and the settings form still write through the unguarded `saveState()` (`app.js:151`, `:585`, `:635`); this is not a general transactional storage engine and the remaining gap is named rather than hidden. Amounts remain JavaScript numbers in this educational app; validation limits decimal places, but robust financial systems commonly use integer minor units or decimal arithmetic. This exercise is about software state and validation, not financial advice.

### The changed lines: the two write paths, side by side

`editExpense` above only opens the editor. The commit logic lives in `handleEntrySubmit`, and reading its two branches next to each other is the point of this chapter.

The **edit** branch (`app.js:205-219`) was the delivered change:

```javascript
  if (editingExpenseId) {
    const existing = state.expenses.find((item) => item.id === editingExpenseId);
    if (!existing) { errorNode.textContent = "This expense no longer exists."; return; }
    const updated = { ...existing, ...entry, id: existing.id, category: els.entryCategory.value };
    const next = { ...state, expenses: state.expenses.map((item) => item.id === existing.id ? updated : item) };
    try { localStorage.setItem(storageKey, JSON.stringify(next)); }
    catch { errorNode.textContent = "Could not save. The original expense is unchanged."; return; }
    state = next;
    /* ... close the modal, render ... */
  }
```

Two details carry the lesson. `id: existing.id` is written *after* the spread of `entry`, so the freshly minted id at `app.js:194` cannot win - that one token is the whole defence against an edit silently becoming a duplicate. And `next` is a complete replacement state, so a failed `setItem` leaves `state` untouched with nothing to roll back.

The **create** branch used to contradict both ideas, 15 lines below. Before (`AstraOrganized2/astrafinalplan/implementation/backups/04/app.js`):

```javascript
  if (type === "expense") {
    state.expenses.push({ ...entry, category: els.entryCategory.value });   // mutates published state
  }
  /* ... income, bill, goal, investment, all mutating `state` in place ... */

  saveState();          // unguarded: a throw here leaves the row on screen and not in storage
```

After (`app.js:221-260`):

```javascript
  // Create follows the same rule as the edit branch above: build a complete
  // replacement state, write it, and only then publish.
  const next = structuredClone(state);

  if (type === "expense") {
    next.expenses.push({ ...entry, category: els.entryCategory.value });
  }
  /* ... the same five branches, all against `next` ... */

  try { localStorage.setItem(storageKey, JSON.stringify(next)); }
  catch { errorNode.textContent = "Could not save. Nothing was added."; return; }
  state = next;
```

`structuredClone` rather than `{ ...state }` is deliberate and worth pausing on: two of the five branches (`goal` and `investment`, `app.js:248-255`) do not push onto an array, they increment a field inside a nested object. A shallow spread would hand `next.goals` the *same* object references as `state.goals`, so `goal.current += entry.amount` would mutate the published state before the write - the exact bug the change exists to remove, hiding one level down. The edit branch can use a shallow spread safely only because `map` builds a new array and `{ ...existing, ...entry }` builds a new record.

## Three variations to work through

All three are about `Number()` and floating-point money, because that is where this handler's real edges are. The input is `Number(els.entryAmount.value)` at `app.js:197`, and the gate is `validateEntry` at `app.js:786-797`.

**Variation 1 - `0.1 + 0.2`.** Edit the $10.00 fixture expense to `0.1`, then create a second expense for `0.2`. Predicted: both are accepted (each has two decimal places or fewer), and `#expenseKpi` reads **$0.30** - but `state.expenses[0].amount + state.expenses[1].amount` is `0.30000000000000004`. The KPI is right only because it is formatted to two decimals on the way out. Prove the underlying value with `assert.notEqual(0.1 + 0.2, 0.3)` in the test file, then find the formatting call that hides it. This is what "amounts remain JavaScript numbers in this educational app" costs, and it is why exercise 4 migrates to integer cents.

**Variation 2 - `1.001`.** Submit `1.001`. Predicted: **rejected** with "Use no more than two decimal places." Read the check at `app.js:789`: `Math.abs(entry.amount * 100 - Math.round(entry.amount * 100)) > 0.00001`. Ask why it is not `entry.amount * 100 !== Math.round(entry.amount * 100)`. Try it: `1.005 * 100` is `100.49999999999999`, and `8.2 * 100` is `819.9999999999999` - a strict comparison would reject `8.2`, a perfectly ordinary price. The epsilon is not sloppiness, it is the cost of testing a decimal property with binary arithmetic. Test 2 already loops `['-1','0','1.001']`; add `'8.2'` and assert it is *accepted*.

**Variation 3 - `1e3` and its neighbours.** Submit `1e3`, then `Infinity`, then `1e3` with 1,000,000,000 (`1e9`). Predicted: `1e3` is **accepted** as 1000 - `Number('1e3')` is 1000 and `<input type="number">` accepts exponential notation, so the stored description "Coffee" may sit next to a $1,000 amount the user did not intend to type. `Infinity` is **rejected** by `!Number.isFinite` at `app.js:787`, and `1e9` is rejected by the `> 999999999.99` bound on the same line. Then try the one that surprises people: an empty amount field gives `Number('')` === `0`, which is rejected by `<= 0` rather than by any "required field" rule - so the user is told "Enter an amount greater than zero" for a field they left blank. Decide whether that message is good enough and write the assertion either way.

## Executable examples

These are the first two of the four regression tests in [test/expense-edit.test.cjs](../test/expense-edit.test.cjs); cases 3 and 4 cover the create path's failed write and the "This expense no longer exists." branch. Read each test as arrange → act → assert. Setup creates a controlled initial state, the action exercises the application code, and assertions compare observable behavior with an independently stated expectation.

```javascript
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { openApp } = require("./browser.cjs");
const KEY = "eli-elyn-finance-dashboard-v1";
const fixture = {
  expenses: [
    {
      id: "e1",
      owner: "Household",
      date: "2026-07-10",
      category: "Food",
      description: "Lunch",
      amount: 10,
    },
  ],
  bills: [],
  incomes: [],
  goals: [],
  investments: [],
};
test("edit updates one row and derived totals, preserving identity through reload", async () => {
  let app = await openApp({ [KEY]: JSON.stringify(fixture) });
  app.document.querySelector("#monthPicker").value = "2026-07";
  app.event("#monthPicker", "change");
  app.event('[data-edit-expense="e1"]', "click");
  app.document.querySelector("#entryAmount").value = "12.50";
  app.event("#entryForm", "submit");
  const stored = JSON.parse(app.w.localStorage.getItem(KEY));
  assert.equal(stored.expenses.length, 1);
  assert.equal(stored.expenses[0].id, "e1");
  assert.equal(stored.expenses[0].amount, 12.5);
  assert.match(app.document.querySelector("#expenseKpi").textContent, /12.50/);
  const saved = app.snapshot();
  app.close();
  app = await openApp(saved);
  assert.equal(app.evaluate("state.expenses[0].amount"), 12.5);
  app.close();
});
test("invalid input and storage failure preserve the original expense and open editor", async () => {
  const app = await openApp({ [KEY]: JSON.stringify(fixture) });
  app.evaluate("editExpense('e1')");
  for (const value of ["-1", "0", "1.001"]) {
    app.document.querySelector("#entryAmount").value = value;
    app.event("#entryForm", "submit");
    assert.equal(
      JSON.parse(app.w.localStorage.getItem(KEY)).expenses[0].amount,
      10,
    );
  }
  app.document.querySelector("#entryAmount").value = "20";
  app.evaluate("Storage.prototype.setItem=()=>{throw new Error('quota')}");
  app.event("#entryForm", "submit");
  assert.equal(app.evaluate("state.expenses[0].amount"), 10);
  assert.equal(app.document.querySelector("#entryModal").open, true);
  assert.match(
    app.document.querySelector("#entryError").textContent,
    /Could not save/,
  );
  app.close();
});
test("creating an expense persists before publishing; a failed write adds nothing", async () => {
  const app = await openApp({ [KEY]: JSON.stringify(fixture) });
  app.document.querySelector("#monthPicker").value = "2026-07";
  app.event("#monthPicker", "change");
  app.evaluate(
    "els.entryType.value = 'expense'; updateCategoryOptions(); els.entryModal.showModal();",
  );
  for (const [selector, value] of [
    ["#entryDate", "2026-07-12"],
    ["#entryAmount", "5.25"],
    ["#entryDescription", "Coffee"],
  ])
    app.document.querySelector(selector).value = value;
  app.evaluate("Storage.prototype.setItem=()=>{throw new Error('quota')}");
  app.event("#entryForm", "submit");
  assert.equal(app.evaluate("state.expenses.length"), 1);
  assert.equal(
    JSON.parse(app.w.localStorage.getItem(KEY)).expenses.length,
    1,
  );
  assert.equal(app.document.querySelector("#entryModal").open, true);
  assert.match(
    app.document.querySelector("#entryError").textContent,
    /Could not save/,
  );
  app.close();
});
test("editing an expense that no longer exists reports it and writes nothing", async () => {
  const app = await openApp({ [KEY]: JSON.stringify(fixture) });
  app.evaluate("editExpense('e1')");
  app.document.querySelector("#entryAmount").value = "12.50";
  // The row disappears between opening the editor and submitting it.
  app.evaluate("state = { ...state, expenses: [] };");
  app.event("#entryForm", "submit");
  assert.equal(
    app.document.querySelector("#entryError").textContent,
    "This expense no longer exists.",
  );
  assert.equal(
    JSON.parse(app.w.localStorage.getItem(KEY)).expenses[0].amount,
    10,
  );
  assert.equal(app.document.querySelector("#entryModal").open, true);
  app.close();
});
```

## Explain it back

Give a five-minute walkthrough: the original problem, one invariant, the exact changed function, the most revealing failure test, and one remaining limitation. You should be able to explain why the implementation is correct for the worked example without reading the code aloud line by line.
