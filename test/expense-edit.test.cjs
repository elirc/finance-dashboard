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
