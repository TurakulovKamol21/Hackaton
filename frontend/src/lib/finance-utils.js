export const currentMonthValue = new Date().toISOString().slice(0, 7);

export function emptyDashboard(month = currentMonthValue) {
  return {
    month,
    accounts: [],
    balanceTotals: [],
    incomeTotals: [],
    expenseTotals: [],
    budgetComparisons: [],
    categoryStats: [],
    trends: [],
    calendarItems: [],
    debtSummaries: []
  };
}

export function categoriesByType(categories, type) {
  return categories.filter((category) => category.type === type);
}

export function fetchJson(url) {
  return fetch(url).then(async (response) => {
    if (!response.ok) {
      throw await buildError(response);
    }

    return response.json();
  });
}

export function sendJson(url, options = {}) {
  return fetch(url, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  }).then(async (response) => {
    if (!response.ok) {
      throw await buildError(response);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  });
}

async function buildError(response) {
  try {
    const payload = await response.json();
    return new Error(payload.message || "So'rov bajarilmadi");
  } catch {
    return new Error("So'rov bajarilmadi");
  }
}

export function endOfMonth(monthValue) {
  const date = new Date(`${monthValue}-01T00:00:00`);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().slice(0, 10);
}

export function formatMoney(value, currency) {
  const amount = Number(value || 0);

  try {
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency,
      maximumFractionDigits: 2
    }).format(amount);
  } catch {
    return `${formatNumber(amount)} ${currency || ""}`.trim();
  }
}

export function compactMoney(value, currency) {
  const amount = Number(value || 0);

  try {
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1
    }).format(amount);
  } catch {
    return `${new Intl.NumberFormat("uz-UZ", {
      notation: "compact",
      maximumFractionDigits: 1
    }).format(amount)} ${currency || ""}`.trim();
  }
}

export function formatNumber(value) {
  return new Intl.NumberFormat("uz-UZ", {
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

export function signedMoney(value, currency) {
  const amount = Number(value || 0);
  const sign = amount > 0 ? "+" : "";
  return `${sign}${formatMoney(amount, currency)}`;
}

export function accountTypeLabel(type) {
  return {
    BANK_ACCOUNT: "Bank hisobraqami",
    BANK_CARD: "Bank kartasi",
    CASH: "Naqd pul",
    SAVINGS: "Jamg'arma",
    E_WALLET: "Elektron hamyon"
  }[type] || type;
}

export function debtTypeLabel(type) {
  return {
    DEBT: "Mening qarzim",
    RECEIVABLE: "Menga qaytishi kerak"
  }[type] || type;
}

export function budgetTypeLabel(type) {
  return {
    INCOME_TARGET: "Daromad rejasi",
    EXPENSE_LIMIT: "Xarajat limiti"
  }[type] || type;
}

export function transactionTypeLabel(type) {
  return {
    INCOME: "Tushum",
    EXPENSE: "Xarajat",
    TRANSFER: "Transfer"
  }[type] || type;
}

export function percent(value, max) {
  if (!max) {
    return 0;
  }

  return Math.max(0, Math.min(100, (Number(value || 0) / Number(max || 0)) * 100));
}

export function sumNumeric(items, selector) {
  return items.reduce((total, item) => total + Number(selector(item) || 0), 0);
}

export function groupBy(items, selector) {
  return items.reduce((accumulator, item) => {
    const key = selector(item);
    accumulator[key] = accumulator[key] ?? [];
    accumulator[key].push(item);
    return accumulator;
  }, {});
}
