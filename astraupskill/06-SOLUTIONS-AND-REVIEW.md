# Solutions and engineering review

[Course index](README.md) · [Practice prompts](05-PRACTICE.md)

Attempt each exercise before using these notes. These are solution approaches and review criteria, not claims that every extension has been implemented. The actual completed behavior is described in the worked-change chapter.

## Existing implementation

The existing modal supports an expense-edit mode with prefilled values, positive finite two-decimal amounts, real calendar dates and nonblank descriptions. Failed validation or storage keeps the original expense and the editor open. Totals continue to be derived from state.

The key model is: The saved document contains expenses, incomes, budgets, bills, goals and investments. An expense has id, owner, date, category, description and amount. Editing changes its fields, not its id or the number of expenses.

The worked fixture should behave as follows: The fixture contains one $10.00 expense and no paid bills. Edit it to $12.50. There must still be exactly one expense with the same id, monthly spending must be $12.50, and reload must retain $12.50. Trying -1 or 1.001 must leave $10.00 unchanged in a fresh fixture.

## Extension solutions

### Exercise 1

**Prompt:** Display an explicit saved confirmation after an edit.

**Approach:** The modal closes on success (`app.js:264`), so anything announced inside it is removed from the accessibility tree in the same tick. Put a live region in the page, outside the dialog, and write to it after `state = next`.

```html
<!-- index.html, a sibling of the dashboard content, never inside <dialog> -->
<p id="saveStatus" role="status" aria-live="polite" class="visually-hidden"></p>
```

```javascript
function announceSaved(text) {
  const node = document.querySelector("#saveStatus");
  node.textContent = "";        // force a change even if the text repeats
  node.textContent = text;      // textContent, never innerHTML: descriptions are user input
}

// edit branch, after `state = next;`
announceSaved(`Saved ${updated.description}, ${formatMoney(updated.amount)}.`);
// create branch, after `state = next;`
announceSaved(`Added ${entry.description}, ${formatMoney(entry.amount)}.`);
```

**Review:** The ordinary case is editing Lunch to $12.50 and finding "Saved Lunch, $12.50." in `#saveStatus`. Two naive implementations break, and both are worth demonstrating. The first announces before the write - move the call above the `try` and case 2 still passes (it only checks the stored amount), but a user with a full disk is told their edit was saved when it was not; assert that on a throwing `setItem` the status node is **empty** and only `#entryError` has text. The second puts the live region inside `#entryModal`: the announcement is made and the dialog closes in the same task, and most screen readers announce nothing at all, because a live region that leaves the tree before the next paint never fires. Note the deliberate blank-then-set: assigning identical text twice is not a change, so a second identical save would be silent. The invariant that remains unchanged: the announcement is derived from the record that was actually written (`updated` / `entry` after publication), never from the form fields, which `els.entryForm.reset()` is about to clear.

### Exercise 2

**Prompt:** Add a category-change regression that checks both category and overall totals.

**Approach:** The assertion set is the deliverable. A category change must be visible in *three* derived numbers moving in a coordinated way, and one of them must not move at all.

```javascript
test("changing an expense category moves money between budgets without changing the total", async () => {
  const twoExpenses = {
    ...fixture,
    expenses: [
      { id: "e1", owner: "Household", date: "2026-07-10", category: "Food",   description: "Lunch",  amount: 10 },
      { id: "e2", owner: "Household", date: "2026-07-11", category: "Travel", description: "Train",  amount: 5 },
    ],
  };
  const app = await openApp({ [KEY]: JSON.stringify(twoExpenses) });
  app.document.querySelector("#monthPicker").value = "2026-07";
  app.event("#monthPicker", "change");

  const spent = (category) => app.evaluate(
    `state.expenses.filter(e => e.category === '${category}' && e.date.startsWith('2026-07'))
       .reduce((sum, e) => sum + e.amount, 0)`);
  assert.equal(spent("Food"), 10);
  assert.equal(spent("Travel"), 5);

  app.evaluate("editExpense('e1')");
  app.document.querySelector("#entryCategory").value = "Travel";
  app.event("#entryForm", "submit");

  assert.equal(spent("Food"), 0);
  assert.equal(spent("Travel"), 15);
  assert.match(app.document.querySelector("#expenseKpi").textContent, /15\.00/);   // unchanged total
  assert.equal(app.evaluate("state.expenses.length"), 2);                          // no row created
  assert.equal(app.evaluate("state.expenses.find(e => e.id === 'e1').description"), "Lunch");
  app.close();
});
```

**Review:** The ordinary case is the move itself; the case that breaks a naive implementation is the *total*. An implementation that pushes a new row instead of replacing (drop `id: existing.id` from `app.js:208` and let the minted id survive) still makes Travel read 15 - the assertion most people write - while the KPI silently becomes 25 and the row count becomes 3. That is precisely the "edit becomes an accidental duplicate" bug, and only the unchanged-total assertion catches it. The second thing worth demonstrating: because the category select is repopulated by `updateCategoryOptions` (`app.js:269`), setting `#entryCategory.value` to a category that is not in the current option list silently leaves it at the previous value - so assert `spent("Travel") === 15`, not merely that the submit did not error. The invariant that remains unchanged: budgets hold no per-category totals; every number here is recomputed from `state.expenses` on render, which is why one write moves three displayed figures consistently.

### Exercise 3

**Prompt:** Refactor create and edit to share a storage-first commit helper.

**Approach:** The two branches in `handleEntrySubmit` now do the same three steps in the same order (`app.js:210-212` and `:258-260`), which is exactly the signal to extract a helper. The remaining unguarded writers - `app.js:151`, `:585`, `:635` - are the reason to bother.

```javascript
// One commit point for the whole app. Returns true when `state` was published.
function commitState(next, onError) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    onError("Could not save. Nothing was changed.");
    return false;
  }
  state = next;
  return true;
}

// edit branch
const next = { ...state, expenses: state.expenses.map((item) => item.id === existing.id ? updated : item) };
if (!commitState(next, (text) => { errorNode.textContent = "Could not save. The original expense is unchanged."; })) return;

// create branch
const next = structuredClone(state);
/* ...the five type branches, all against `next`... */
if (!commitState(next, (text) => { errorNode.textContent = "Could not save. Nothing was added."; })) return;

// the bill toggle at app.js:577, previously `state.bills[i].paid = !paid; saveState();`
const next = structuredClone(state);
const bill = next.bills.find((item) => item.id === id);
bill.paid = !bill.paid;
if (!commitState(next, showToast)) return;
render();
```

**Review:** The ordinary case is that all four existing tests pass unchanged - a pure refactor should be invisible to them. Two implementations break, in opposite directions. The first keeps the shallow `{ ...state }` for the create path: `goal` and `investment` entries mutate nested objects (`app.js:248-255`), so `next.goals[0]` and `state.goals[0]` are the same object and a failed write has already moved the goal's `current`. Demonstrate it with a goal contribution under a throwing `setItem` and assert `state.goals[0].current` is unchanged - a shallow spread fails this and `structuredClone` passes. The second centralizes the *message* as well as the write, which loses real information: "The original expense is unchanged" and "Nothing was added" tell the user different things about what to do next, which is why `onError` is a callback rather than a string constant. The invariant that remains unchanged: validation stays at the form boundary. `validateEntry` (`app.js:786`) must not move into `commitState`, because it needs the field-level context to say *which* field is wrong, and a storage helper has no business knowing about decimal places.

### Exercise 4

**Prompt:** Migrate expense amounts to integer cents with a versioned saved-data migration.

**Approach:** Cents everywhere internally; decimals only at the two edges (the input field and the formatter). Version the document so the conversion runs once and is recognisable afterwards.

```javascript
const STORAGE_VERSION = 2;

const toCents = (value) => Math.round(Number(value) * 100);          // "12.50" -> 1250
const fromCents = (cents) => (cents / 100).toFixed(2);               // 1250 -> "12.50"

function migrate(loaded) {
  if (loaded.version === STORAGE_VERSION) return loaded;
  // Keep the original document. A migration that loses data is worse than no migration.
  try { localStorage.setItem(`${storageKey}:v1-backup`, JSON.stringify(loaded)); } catch { /* ignore */ }
  return {
    ...loaded,
    version: STORAGE_VERSION,
    expenses:    loaded.expenses.map((e) => ({ ...e, amountCents: toCents(e.amount), amount: undefined })),
    incomes:     loaded.incomes.map((i) => ({ ...i, amountCents: toCents(i.amount), amount: undefined })),
    bills:       loaded.bills.map((b) => ({ ...b, amountCents: toCents(b.amount), amount: undefined })),
    goals:       loaded.goals.map((g) => ({ ...g, currentCents: toCents(g.current), targetCents: toCents(g.target) })),
    investments: loaded.investments.map((a) => ({ ...a, balanceCents: toCents(a.balance) })),
  };
}
```

`validateEntry` then becomes simpler, not more complex: `Number.isSafeInteger(entry.amountCents) && entry.amountCents > 0 && entry.amountCents <= 99999999999` replaces the epsilon comparison at `app.js:789` entirely, because "at most two decimal places" is no longer a property to detect - it is the representation.

**Review:** The ordinary case is the one the exercise names: two expenses of `0.10` and `0.20` must total exactly `30` cents, and `assert.equal(total, 30)` must pass where `assert.equal(0.1 + 0.2, 0.3)` fails. Two naive implementations break. The first uses `Math.floor(value * 100)` or `parseInt(value * 100)`: `1.15 * 100` is `114.99999999999999`, so a $1.15 lunch is stored as 114 cents and every migrated ledger quietly loses money - demonstrate with a fixture containing `1.15`, `8.2` and `4.35` and assert 115, 820 and 435. The second migrates in place without a version field, so the second load multiplies by 100 again and a $12.50 expense becomes $12,500; the version check is not ceremony, it is the idempotency guard for a data migration - run `migrate(migrate(doc))` in a test and assert it equals `migrate(doc)`. The invariant that remains unchanged: totals are still derived per render, so nothing outside the formatter needs to know the unit changed - and that is only true because the delivered design refused to cache a total anywhere.

## Review questions with answer guidance

**Why not trust input just because it came from this UI?** A caller can bypass the UI, a saved file can be edited, and older data can have a different shape. Validate at the boundary that owns the operation.

**Why keep the id stable?** It identifies the same domain record across views and edits. Changing it can create duplicates, disconnect child records or make reconciliation impossible.

**What makes the failure test meaningful?** It observes the promised state invariant. For this project, explain exactly why the failing scenario in [test/expense-edit.test.cjs](../test/expense-edit.test.cjs) would detect the original or a plausible regression.

**What does the test not prove?** A bounded suite does not prove all concurrency, browsers, deployment configurations or unrelated domain behavior. Name the real limitation from this lesson instead of adding a generic disclaimer.

**When should you extract a helper?** When it isolates a coherent responsibility, makes an invariant clearer or enables a meaningful test without duplicating application logic. A pure validator and a shared persistence boundary are common examples, but do not abstract solely to increase the number of files.

## A sample change explanation

“The previous behavior was: Expenses could be added and deleted, but there was no edit action. The shared submit handler also accepted some malformed amounts without useful feedback. I changed the implementation so that: The existing modal supports an expense-edit mode with prefilled values, positive finite two-decimal amounts, real calendar dates and nonblank descriptions. Failed validation or storage keeps the original expense and the editor open. Totals continue to be derived from state. The strongest evidence is the regression that exercises the worked fixture and checks authoritative state. A remaining design question is the final stretch exercise.”

Replace that explanation with your own words and actual test results. A strong junior engineer can connect a concrete user problem to code, verification and a clearly stated limit. Completing that explanation independently is the final checkpoint for this course.
