const storageKey = "eli-elyn-finance-dashboard-v1";

const colors = {
  housing: "#2563eb",
  food: "#1f8a5f",
  transport: "#d95745",
  utilities: "#b7791f",
  insurance: "#6d5bd0",
  fun: "#0891b2",
  savings: "#26a269",
  investing: "#7c3aed",
  personal: "#ec4899",
  debt: "#475569"
};

const iconPaths = {
  "layout-dashboard": '<rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect>',
  "receipt-text": '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path><path d="M8 7h8"></path><path d="M8 11h8"></path><path d="M8 15h5"></path>',
  "calendar-check": '<path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path><path d="m9 16 2 2 4-4"></path>',
  target: '<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>',
  "trending-up": '<path d="m22 7-8.5 8.5-5-5L2 17"></path><path d="M16 7h6v6"></path>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3v4a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5"></path><path d="M18 12h.01"></path>',
  "credit-card": '<rect width="20" height="14" x="2" y="5" rx="2"></rect><path d="M2 10h20"></path>',
  "bell-ring": '<path d="M10.268 21a2 2 0 0 0 3.464 0"></path><path d="M22 8c0-2.3-.8-4.3-2-5.7"></path><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.674C19.41 13.956 18 12.499 18 8a6 6 0 0 0-12 0c0 4.499-1.411 5.956-2.738 7.326"></path><path d="M4 2.3C2.8 3.7 2 5.7 2 8"></path>',
  "piggy-bank": '<path d="M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3.4a8 8 0 0 0 1.9-2.6H22v-4h-2.1A8 8 0 0 0 12 4H9.5a5 5 0 0 0-4 2H3v6h2a8 8 0 0 0 3 3.2V19a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1Z"></path><path d="M16 9h.01"></path>',
  "rotate-ccw": '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path>',
  plus: '<path d="M5 12h14"></path><path d="M12 5v14"></path>',
  x: '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>',
  check: '<path d="M20 6 9 17l-5-5"></path>',
  "trash-2": '<path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path>',
  home: '<path d="m3 11 9-9 9 9"></path><path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10"></path><path d="M9 21v-6h6v6"></path>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14Z"></path>',
  "shield-check": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.68-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.25-2.6a1.17 1.17 0 0 1 1.5 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1Z"></path><path d="m9 12 2 2 4-4"></path>',
  landmark: '<path d="M3 22h18"></path><path d="M6 18v-7"></path><path d="M10 18v-7"></path><path d="M14 18v-7"></path><path d="M18 18v-7"></path><path d="m12 2 9 5H3Z"></path>',
  clapperboard: '<path d="M20.2 6 3 11l-.9-2.8a2 2 0 0 1 1.3-2.5l12-3.6a2 2 0 0 1 2.5 1.3Z"></path><path d="m6.2 5.3 3.1 3.9"></path><path d="m12.4 3.4 3.1 4"></path><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"></path>',
  "shopping-cart": '<circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>',
  car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.4 5.8A3 3 0 0 0 15.6 4H8.4a3 3 0 0 0-2.8 1.8L3.5 11.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><circle cx="17" cy="17" r="2"></circle>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path><path d="M16 8h-6"></path><path d="M16 12h-6"></path><path d="M16 16h-6"></path>'
};

const defaultState = {
  budgets: [
    { category: "Housing", limit: 2450, color: colors.housing },
    { category: "Food", limit: 980, color: colors.food },
    { category: "Transportation", limit: 640, color: colors.transport },
    { category: "Utilities", limit: 510, color: colors.utilities },
    { category: "Insurance", limit: 430, color: colors.insurance },
    { category: "Personal", limit: 520, color: colors.personal },
    { category: "Fun", limit: 420, color: colors.fun }
  ],
  incomes: [
    { id: "inc-1", owner: "Eli", date: "2026-07-01", description: "Eli paycheck", amount: 5100 },
    { id: "inc-2", owner: "Elyn", date: "2026-07-01", description: "Elyn paycheck", amount: 4650 },
    { id: "inc-3", owner: "Household", date: "2026-07-08", description: "Side project income", amount: 450 }
  ],
  expenses: [
    { id: "exp-1", owner: "Household", date: "2026-07-02", category: "Food", description: "Costco and groceries", amount: 284.26 },
    { id: "exp-2", owner: "Eli", date: "2026-07-03", category: "Transportation", description: "Gas and parking", amount: 92.7 },
    { id: "exp-3", owner: "Elyn", date: "2026-07-04", category: "Personal", description: "Pharmacy and care", amount: 68.18 },
    { id: "exp-4", owner: "Household", date: "2026-07-05", category: "Fun", description: "Dinner with friends", amount: 126.1 },
    { id: "exp-5", owner: "Household", date: "2026-07-06", category: "Food", description: "Weekly groceries", amount: 197.43 },
    { id: "exp-6", owner: "Eli", date: "2026-07-07", category: "Personal", description: "Gym membership", amount: 49 },
    { id: "exp-7", owner: "Elyn", date: "2026-07-08", category: "Transportation", description: "Transit pass", amount: 84 }
  ],
  bills: [
    { id: "bill-1", owner: "Household", name: "Rent", category: "Housing", dueDay: 1, amount: 2250, paid: true, autopay: true },
    { id: "bill-2", owner: "Household", name: "Electric", category: "Utilities", dueDay: 12, amount: 156, paid: false, autopay: true },
    { id: "bill-3", owner: "Household", name: "Internet", category: "Utilities", dueDay: 15, amount: 86, paid: false, autopay: true },
    { id: "bill-4", owner: "Household", name: "Phone plan", category: "Utilities", dueDay: 18, amount: 142, paid: false, autopay: true },
    { id: "bill-5", owner: "Household", name: "Car insurance", category: "Insurance", dueDay: 20, amount: 211, paid: false, autopay: false },
    { id: "bill-6", owner: "Household", name: "Student loan", category: "Debt", dueDay: 24, amount: 315, paid: false, autopay: false },
    { id: "bill-7", owner: "Household", name: "Streaming bundle", category: "Fun", dueDay: 25, amount: 52, paid: false, autopay: true },
    { id: "bill-8", owner: "Household", name: "Water", category: "Utilities", dueDay: 28, amount: 74, paid: false, autopay: false }
  ],
  goals: [
    { id: "goal-1", name: "Emergency fund", owner: "Household", target: 18000, current: 12650, monthly: 800, deadline: "2027-02-01" },
    { id: "goal-2", name: "Home down payment", owner: "Household", target: 65000, current: 23800, monthly: 1600, deadline: "2028-10-01" },
    { id: "goal-3", name: "Japan anniversary trip", owner: "Household", target: 9000, current: 3125, monthly: 550, deadline: "2027-05-01" }
  ],
  investments: [
    { id: "inv-1", account: "Eli 401(k)", owner: "Eli", type: "Retirement", balance: 42600, monthly: 650, targetAllocation: "Index funds" },
    { id: "inv-2", account: "Elyn IRA", owner: "Elyn", type: "Retirement", balance: 21800, monthly: 500, targetAllocation: "Broad market ETF" },
    { id: "inv-3", account: "Joint brokerage", owner: "Household", type: "Taxable", balance: 14850, monthly: 750, targetAllocation: "80/20 stocks-bonds" },
    { id: "inv-4", account: "HSA investments", owner: "Household", type: "Health", balance: 5400, monthly: 250, targetAllocation: "Low-cost index" }
  ]
};

let state = loadState();
let charts = {};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  initializeControls();
  render();
  window.addEventListener("hashchange", setActiveNav);
});

function cacheElements() {
  [
    "monthPicker",
    "ownerFilter",
    "resetDataButton",
    "openAddModal",
    "entryModal",
    "closeAddModal",
    "cancelEntry",
    "entryForm",
    "entryType",
    "entryOwner",
    "entryDate",
    "entryAmount",
    "entryCategory",
    "entryDescription",
    "incomeKpi",
    "incomeNote",
    "expenseKpi",
    "expenseNote",
    "billsKpi",
    "billsNote",
    "netWorthKpi",
    "netWorthNote",
    "cashflowStatus",
    "nextBillStatus",
    "categoryLegend",
    "budgetList",
    "expenseRows",
    "billGrid",
    "goalList",
    "investmentList",
    "portfolioStatus",
    "sidebarSavingsRate",
    "sidebarSavingsMeter"
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function initializeControls() {
  const today = new Date();
  els.monthPicker.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  els.entryDate.value = today.toISOString().slice(0, 10);

  els.monthPicker.addEventListener("change", render);
  els.ownerFilter.addEventListener("change", render);
  els.resetDataButton.addEventListener("click", () => {
    if (window.confirm("Reset the dashboard back to the starter Eli and Elyn data?")) {
      state = structuredClone(defaultState);
      saveState();
      render();
    }
  });

  els.openAddModal.addEventListener("click", () => {
    updateCategoryOptions();
    els.entryModal.showModal();
  });
  els.closeAddModal.addEventListener("click", () => els.entryModal.close());
  els.cancelEntry.addEventListener("click", () => els.entryModal.close());
  els.entryType.addEventListener("change", updateCategoryOptions);
  els.entryForm.addEventListener("submit", handleEntrySubmit);

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", setActiveNav);
  });

  updateCategoryOptions();
}

function loadState() {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return structuredClone(defaultState);
    return { ...structuredClone(defaultState), ...JSON.parse(stored) };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function handleEntrySubmit(event) {
  event.preventDefault();
  const type = els.entryType.value;
  const entry = {
    id: `${type}-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`,
    owner: els.entryOwner.value,
    date: els.entryDate.value,
    amount: Number(els.entryAmount.value),
    description: els.entryDescription.value.trim()
  };

  if (!entry.amount || entry.amount < 0) return;

  if (type === "expense") {
    state.expenses.push({ ...entry, category: els.entryCategory.value });
  }

  if (type === "income") {
    state.incomes.push(entry);
  }

  if (type === "bill") {
    const dueDate = new Date(`${entry.date}T00:00:00`);
    state.bills.push({
      id: entry.id,
      owner: entry.owner,
      name: entry.description,
      category: els.entryCategory.value,
      dueDay: dueDate.getDate(),
      amount: entry.amount,
      paid: false,
      autopay: false
    });
  }

  if (type === "goal") {
    const goal = state.goals.find((item) => item.name === els.entryCategory.value);
    if (goal) goal.current += entry.amount;
  }

  if (type === "investment") {
    const account = state.investments.find((item) => item.account === els.entryCategory.value);
    if (account) account.balance += entry.amount;
  }

  saveState();
  els.entryForm.reset();
  els.entryDate.value = new Date().toISOString().slice(0, 10);
  els.entryModal.close();
  updateCategoryOptions();
  render();
}

function updateCategoryOptions() {
  const type = els.entryType.value;
  let options = [];

  if (type === "expense" || type === "bill") {
    options = [...new Set([...state.budgets.map((budget) => budget.category), "Debt"])];
  } else if (type === "goal") {
    options = state.goals.map((goal) => goal.name);
  } else if (type === "investment") {
    options = state.investments.map((account) => account.account);
  } else {
    options = ["Paycheck", "Side income", "Refund", "Gift", "Other"];
  }

  els.entryCategory.innerHTML = options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join("");
}

function render() {
  setActiveNav();
  const view = getViewData();
  renderKpis(view);
  renderCharts(view);
  renderCategoryLegend(view);
  renderBudgets(view);
  renderExpenses(view);
  renderBills(view);
  renderGoals(view);
  renderInvestments(view);
  renderIcons();
}

function getViewData() {
  const month = els.monthPicker.value;
  const owner = els.ownerFilter.value;
  const ownerMatches = (item) => owner === "All" || item.owner === owner;
  const inMonth = (item) => item.date ? item.date.startsWith(month) : true;

  const expenses = state.expenses.filter(ownerMatches).filter(inMonth);
  const incomes = state.incomes.filter(ownerMatches).filter(inMonth);
  const bills = state.bills.filter(ownerMatches);
  const goals = state.goals.filter(ownerMatches);
  const investments = state.investments.filter(ownerMatches);

  const paidBills = bills.filter((bill) => bill.paid);
  const openBills = bills.filter((bill) => !bill.paid);
  const incomeTotal = sum(incomes, "amount");
  const expenseTotal = sum(expenses, "amount") + sum(paidBills, "amount");
  const openBillTotal = sum(openBills, "amount");
  const savingsTotal = sum(goals, "current");
  const investmentsTotal = sum(investments, "balance");
  const netWorth = savingsTotal + investmentsTotal;
  const monthlyGoalContrib = sum(goals, "monthly") + sum(investments, "monthly");
  const savingsRate = incomeTotal > 0 ? Math.round((monthlyGoalContrib / incomeTotal) * 100) : 0;

  return {
    month,
    owner,
    expenses,
    incomes,
    bills,
    goals,
    investments,
    paidBills,
    openBills,
    incomeTotal,
    expenseTotal,
    openBillTotal,
    savingsTotal,
    investmentsTotal,
    netWorth,
    monthlyGoalContrib,
    savingsRate
  };
}

function renderKpis(view) {
  els.incomeKpi.textContent = money(view.incomeTotal);
  els.expenseKpi.textContent = money(view.expenseTotal);
  els.billsKpi.textContent = money(view.openBillTotal);
  els.netWorthKpi.textContent = money(view.netWorth);

  const available = view.incomeTotal - view.expenseTotal - view.openBillTotal - view.monthlyGoalContrib;
  els.incomeNote.textContent = `${view.incomes.length} income source${plural(view.incomes.length)}`;
  els.expenseNote.textContent = `${money(Math.max(available, 0))} projected free cash`;
  els.billsNote.textContent = `${view.openBills.length} bill${plural(view.openBills.length)} still open`;
  els.netWorthNote.textContent = `${money(view.savingsTotal)} saved, ${money(view.investmentsTotal)} invested`;

  els.sidebarSavingsRate.textContent = `${view.savingsRate}%`;
  els.sidebarSavingsMeter.style.width = `${clamp(view.savingsRate, 0, 45) / 45 * 100}%`;

  els.cashflowStatus.textContent = available >= 0 ? "Cash positive" : "Over budget";
  els.cashflowStatus.className = `status-pill ${available >= 0 ? "positive" : "danger"}`;
}

function renderCharts(view) {
  renderCashflowChart(view);
  renderCategoryChart(view);
  renderGoalChart(view);
  renderAssetChart(view);
}

function renderCashflowChart(view) {
  const plannedSavings = view.monthlyGoalContrib;
  const openBills = view.openBillTotal;
  const spent = view.expenseTotal;
  const remaining = Math.max(view.incomeTotal - spent - openBills - plannedSavings, 0);

  upsertChart("cashflowChart", {
    type: "bar",
    data: {
      labels: ["Income", "Spent", "Open bills", "Planned saving", "Remaining"],
      datasets: [{
        data: [view.incomeTotal, spent, openBills, plannedSavings, remaining],
        backgroundColor: ["#1f8a5f", "#d95745", "#b7791f", "#6d5bd0", "#2563eb"],
        borderRadius: 8
      }]
    },
    options: baseChartOptions({
      plugins: { legend: { display: false } },
      scales: { y: { ticks: { callback: currencyTick } } }
    })
  });
}

function renderCategoryChart(view) {
  const grouped = groupByCategory([...view.expenses, ...view.paidBills.map((bill) => ({ ...bill, description: bill.name }))]);
  const labels = Object.keys(grouped);
  const data = Object.values(grouped);
  const bg = labels.map((label) => categoryColor(label));

  upsertChart("categoryChart", {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: bg,
        borderColor: "#ffffff",
        borderWidth: 4
      }]
    },
    options: baseChartOptions({
      cutout: "62%",
      plugins: { legend: { display: false } }
    })
  });
}

function renderGoalChart(view) {
  const labels = view.goals.map((goal) => goal.name);
  upsertChart("goalChart", {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Current",
          data: view.goals.map((goal) => goal.current),
          backgroundColor: "#1f8a5f",
          borderRadius: 8
        },
        {
          label: "Remaining",
          data: view.goals.map((goal) => Math.max(goal.target - goal.current, 0)),
          backgroundColor: "#dce3eb",
          borderRadius: 8
        }
      ]
    },
    options: baseChartOptions({
      indexAxis: "y",
      scales: {
        x: { stacked: true, ticks: { callback: currencyTick } },
        y: { stacked: true }
      }
    })
  });
}

function renderAssetChart(view) {
  const labels = ["Savings goals", "Investments"];
  upsertChart("assetChart", {
    type: "polarArea",
    data: {
      labels,
      datasets: [{
        data: [view.savingsTotal, view.investmentsTotal],
        backgroundColor: ["rgba(31, 138, 95, 0.78)", "rgba(37, 99, 235, 0.78)"],
        borderColor: ["#1f8a5f", "#2563eb"]
      }]
    },
    options: baseChartOptions({
      plugins: { legend: { position: "bottom" } },
      scales: { r: { ticks: { callback: currencyTick } } }
    })
  });
}

function upsertChart(canvasId, config) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !window.Chart) return;
  if (charts[canvasId]) charts[canvasId].destroy();
  charts[canvasId] = new Chart(canvas, config);
}

function baseChartOptions(overrides = {}) {
  return deepMerge({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label ? `${context.dataset.label}: ` : ""}${money(context.parsed.y ?? context.parsed.x ?? context.parsed)}`
        }
      },
      legend: {
        labels: {
          boxWidth: 12,
          usePointStyle: true
        }
      }
    }
  }, overrides);
}

function renderIcons() {
  document.querySelectorAll("i[data-lucide]").forEach((node) => {
    const name = node.dataset.lucide;
    node.replaceWith(svgIcon(name));
  });
}

function svgIcon(name) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("width", "24");
  svg.setAttribute("height", "24");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = iconPaths[name] || iconPaths.receipt;
  return svg;
}

function renderCategoryLegend(view) {
  const grouped = groupByCategory([...view.expenses, ...view.paidBills.map((bill) => ({ ...bill, description: bill.name }))]);
  const total = Object.values(grouped).reduce((acc, value) => acc + value, 0);
  const rows = Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => {
      const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
      return `
        <div class="legend-item">
          <span><span class="swatch" style="background:${categoryColor(category)}"></span>${escapeHtml(category)}</span>
          <strong>${money(amount)} <span class="muted">${pct}%</span></strong>
        </div>
      `;
    }).join("");

  els.categoryLegend.innerHTML = rows || `<div class="empty-state">No expense data for this view.</div>`;
}

function renderBudgets(view) {
  const spentByCategory = groupByCategory([...view.expenses, ...view.paidBills]);
  els.budgetList.innerHTML = state.budgets.map((budget) => {
    const spent = spentByCategory[budget.category] || 0;
    const pct = budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0;
    const fillClass = pct > 100 ? "coral" : pct > 85 ? "amber" : "green";
    return `
      <article class="budget-item">
        <div class="item-topline">
          <div>
            <div class="item-title">${escapeHtml(budget.category)}</div>
            <div class="item-meta">${money(spent)} of ${money(budget.limit)}</div>
          </div>
          <strong>${pct}%</strong>
        </div>
        <div class="progress-track">
          <span class="progress-fill ${fillClass}" style="width:${clamp(pct, 0, 130)}%"></span>
        </div>
      </article>
    `;
  }).join("");
}

function renderExpenses(view) {
  const rows = view.expenses
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((expense) => `
      <tr>
        <td>${formatDate(expense.date)}</td>
        <td><span class="category-chip"><span class="swatch" style="background:${categoryColor(expense.category)}"></span>${escapeHtml(expense.category)}</span></td>
        <td>${escapeHtml(expense.description)}</td>
        <td><span class="owner-chip">${escapeHtml(expense.owner)}</span></td>
        <td class="numeric"><strong>${money(expense.amount)}</strong></td>
        <td class="numeric">
          <button class="danger-button" type="button" data-delete-expense="${expense.id}" title="Delete expense" aria-label="Delete expense">
            <i data-lucide="trash-2"></i>
          </button>
        </td>
      </tr>
    `).join("");

  els.expenseRows.innerHTML = rows || `<tr><td colspan="6"><div class="empty-state">No expenses for this month and view.</div></td></tr>`;
  els.expenseRows.querySelectorAll("[data-delete-expense]").forEach((button) => {
    button.addEventListener("click", () => {
      state.expenses = state.expenses.filter((expense) => expense.id !== button.dataset.deleteExpense);
      saveState();
      render();
    });
  });
}

function renderBills(view) {
  const today = new Date();
  const currentMonth = els.monthPicker.value;
  const [year, month] = currentMonth.split("-").map(Number);
  const sorted = view.bills.slice().sort((a, b) => a.dueDay - b.dueDay);
  const nextBill = sorted.find((bill) => !bill.paid);

  if (nextBill) {
    els.nextBillStatus.textContent = `${nextBill.name} due ${monthName(month)} ${nextBill.dueDay}`;
    els.nextBillStatus.className = "status-pill warning";
  } else {
    els.nextBillStatus.textContent = "All caught up";
    els.nextBillStatus.className = "status-pill positive";
  }

  els.billGrid.innerHTML = sorted.map((bill) => {
    const dueDate = new Date(year, month - 1, bill.dueDay);
    const overdue = !bill.paid && dueDate < stripTime(today) && currentMonth === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    const className = bill.paid ? "bill-card paid" : overdue ? "bill-card overdue" : "bill-card";
    return `
      <article class="${className}">
        <div class="bill-topline">
          <div class="bill-icon"><i data-lucide="${billIcon(bill.category)}"></i></div>
          <label class="toggle" title="Toggle paid status">
            <input type="checkbox" data-bill-paid="${bill.id}" ${bill.paid ? "checked" : ""} />
            <span></span>
          </label>
        </div>
        <div>
          <div class="item-title">${escapeHtml(bill.name)}</div>
          <div class="item-meta">${escapeHtml(bill.category)} due ${monthName(month)} ${bill.dueDay}</div>
        </div>
        <div class="bill-actions">
          <strong>${money(bill.amount)}</strong>
          <span class="owner-chip">${bill.autopay ? "Autopay" : "Manual"}</span>
        </div>
      </article>
    `;
  }).join("");

  els.billGrid.querySelectorAll("[data-bill-paid]").forEach((input) => {
    input.addEventListener("change", () => {
      const bill = state.bills.find((item) => item.id === input.dataset.billPaid);
      if (bill) bill.paid = input.checked;
      saveState();
      render();
    });
  });
}

function renderGoals(view) {
  els.goalList.innerHTML = view.goals.map((goal) => {
    const pct = Math.round((goal.current / goal.target) * 100);
    const remaining = Math.max(goal.target - goal.current, 0);
    const monthsLeft = goal.monthly > 0 ? Math.ceil(remaining / goal.monthly) : 0;
    return `
      <article class="goal-item">
        <div class="item-topline">
          <div>
            <div class="item-title">${escapeHtml(goal.name)}</div>
            <div class="item-meta">${monthsLeft} month${plural(monthsLeft)} at ${money(goal.monthly)}/month</div>
          </div>
          <strong>${pct}%</strong>
        </div>
        <div class="progress-track">
          <span class="progress-fill blue" style="width:${clamp(pct, 0, 100)}%"></span>
        </div>
        <div class="item-topline">
          <span class="muted">${money(goal.current)} saved</span>
          <span class="muted">${money(remaining)} left</span>
        </div>
      </article>
    `;
  }).join("") || `<div class="empty-state">No savings goals for this view.</div>`;
}

function renderInvestments(view) {
  const totalMonthly = sum(view.investments, "monthly");
  const totalBalance = sum(view.investments, "balance");
  els.portfolioStatus.textContent = `${money(totalMonthly)}/mo invested`;

  els.investmentList.innerHTML = view.investments.map((account) => {
    const share = totalBalance > 0 ? Math.round((account.balance / totalBalance) * 100) : 0;
    return `
      <article class="investment-item">
        <div class="item-topline">
          <div>
            <div class="item-title">${escapeHtml(account.account)}</div>
            <div class="item-meta">${escapeHtml(account.type)} - ${escapeHtml(account.targetAllocation)}</div>
          </div>
          <strong>${money(account.balance)}</strong>
        </div>
        <div class="progress-track">
          <span class="progress-fill green" style="width:${clamp(share, 0, 100)}%"></span>
        </div>
        <div class="item-topline">
          <span class="owner-chip">${escapeHtml(account.owner)}</span>
          <span class="muted">${money(account.monthly)}/month</span>
        </div>
      </article>
    `;
  }).join("") || `<div class="empty-state">No investment accounts for this view.</div>`;
}

function setActiveNav() {
  const hash = window.location.hash || "#overview";
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === hash);
  });
}

function groupByCategory(items) {
  return items.reduce((acc, item) => {
    const category = item.category || "Other";
    acc[category] = (acc[category] || 0) + Number(item.amount || 0);
    return acc;
  }, {});
}

function categoryColor(category) {
  const found = state.budgets.find((budget) => budget.category === category);
  if (found) return found.color;
  return colors[category.toLowerCase()] || colors.debt;
}

function billIcon(category) {
  const map = {
    Housing: "home",
    Utilities: "zap",
    Insurance: "shield-check",
    Debt: "landmark",
    Fun: "clapperboard",
    Food: "shopping-cart",
    Transportation: "car"
  };
  return map[category] || "receipt";
}

function sum(items, key) {
  return items.reduce((acc, item) => acc + Number(item[key] || 0), 0);
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2
  }).format(value || 0);
}

function currencyTick(value) {
  return money(Number(value));
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(`${dateString}T00:00:00`));
}

function monthName(monthNumber) {
  return new Date(2026, monthNumber - 1, 1).toLocaleString("en-US", { month: "short" });
}

function plural(count) {
  return count === 1 ? "" : "s";
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function deepMerge(target, source) {
  const output = { ...target };
  Object.keys(source).forEach((key) => {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      output[key] = deepMerge(output[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  });
  return output;
}
