const STORAGE_KEY = 'astra-finance-dashboard';

const defaultState = {
  salary: 50000,
  bills: [
    { id: crypto.randomUUID(), name: 'Rent', amount: 18000 },
    { id: crypto.randomUUID(), name: 'Internet', amount: 2500 },
    { id: crypto.randomUUID(), name: 'Utilities', amount: 3200 },
  ],
};

let state = loadState();

const salaryInput = document.getElementById('salary');
const billForm = document.getElementById('billForm');
const billNameInput = document.getElementById('billName');
const billAmountInput = document.getElementById('billAmount');
const billList = document.getElementById('billList');
const addBillBtn = document.getElementById('addBillBtn');

const annualSalaryEl = document.getElementById('annualSalary');
const monthlyTaxEl = document.getElementById('monthlyTax');
const totalBillsEl = document.getElementById('totalBills');
const annualTaxEl = document.getElementById('annualTax');
const takeHomeEl = document.getElementById('takeHome');
const remainingBudgetEl = document.getElementById('remainingBudget');
const meterFillEl = document.getElementById('meterFill');
const salaryAfterTaxEl = document.getElementById('salaryAfterTax');
const billCoverageEl = document.getElementById('billCoverage');
const suggestedSavingsEl = document.getElementById('suggestedSavings');

salaryInput.addEventListener('input', (event) => {
  state.salary = Number(event.target.value || 0);
  saveState();
  render();
});

billForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = billNameInput.value.trim();
  const amount = Number(billAmountInput.value || 0);

  if (!name || amount <= 0) {
    return;
  }

  state.bills.push({ id: crypto.randomUUID(), name, amount });
  saveState();
  billForm.reset();
  render();
});

addBillBtn.addEventListener('click', () => {
  billNameInput.focus();
});

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return defaultState;
    }

    const parsed = JSON.parse(saved);
    return {
      salary: Number(parsed.salary || defaultState.salary),
      bills: Array.isArray(parsed.bills) && parsed.bills.length ? parsed.bills : defaultState.bills,
    };
  } catch (error) {
    console.error('Could not load state', error);
    return defaultState;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function calculatePhilippineTax(annualSalary) {
  if (annualSalary <= 250000) {
    return 0;
  }

  if (annualSalary <= 400000) {
    return (annualSalary - 250000) * 0.2;
  }

  if (annualSalary <= 800000) {
    return 30000 + (annualSalary - 400000) * 0.25;
  }

  if (annualSalary <= 2000000) {
    return 130000 + (annualSalary - 800000) * 0.3;
  }

  if (annualSalary <= 8000000) {
    return 490000 + (annualSalary - 2000000) * 0.35;
  }

  return 2410000 + (annualSalary - 8000000) * 0.4;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 2,
  }).format(value);
}

function render() {
  const annualSalary = state.salary * 12;
  const annualTax = calculatePhilippineTax(annualSalary);
  const monthlyTax = annualTax / 12;
  const totalBills = state.bills.reduce((sum, bill) => sum + bill.amount, 0);
  const salaryAfterTax = state.salary - monthlyTax;
  const remainingBudget = salaryAfterTax - totalBills;
  const billCoverage = state.salary ? Math.min(100, (totalBills / state.salary) * 100) : 0;
  const suggestedSavings = Math.max(0, remainingBudget * 0.2);

  annualSalaryEl.textContent = formatCurrency(annualSalary);
  monthlyTaxEl.textContent = formatCurrency(monthlyTax);
  totalBillsEl.textContent = formatCurrency(totalBills);
  annualTaxEl.textContent = formatCurrency(annualTax);
  takeHomeEl.textContent = formatCurrency(remainingBudget);
  remainingBudgetEl.textContent = formatCurrency(remainingBudget);
  salaryAfterTaxEl.textContent = formatCurrency(salaryAfterTax);
  billCoverageEl.textContent = `${billCoverage.toFixed(0)}%`;
  suggestedSavingsEl.textContent = formatCurrency(suggestedSavings);

  const meterPercent = Math.min(100, Math.max(0, (remainingBudget / state.salary) * 100));
  meterFillEl.style.width = `${meterPercent}%`;

  billList.innerHTML = '';
  state.bills.forEach((bill) => {
    const item = document.createElement('li');
    item.className = 'bill-item';
    item.innerHTML = `
      <div>
        <strong>${bill.name}</strong>
        <div class="muted">${formatCurrency(bill.amount)}</div>
      </div>
      <button type="button" data-id="${bill.id}">Remove</button>
    `;
    billList.appendChild(item);
  });

  billList.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-id');
      state.bills = state.bills.filter((bill) => bill.id !== id);
      saveState();
      render();
    });
  });
}

render();
