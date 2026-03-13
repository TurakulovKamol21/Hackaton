import { addDays, format, startOfWeek } from "date-fns";
import { enUS, ru, uz } from "date-fns/locale";
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, languageOptions } from "../i18n/translations";

export const currentMonthValue = new Date().toISOString().slice(0, 7);
const defaultApiBaseUrl = import.meta.env.PROD ? "" : "http://localhost:8080";
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl).replace(/\/$/, "");

const dateLocaleMap = {
  uz,
  en: enUS,
  ru
};

let activeLanguage = DEFAULT_LANGUAGE;

export function setActiveLanguage(language) {
  activeLanguage = languageOptions.some((item) => item.value === language) ? language : DEFAULT_LANGUAGE;
}

function currentLanguage() {
  if (activeLanguage) {
    return activeLanguage;
  }

  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return languageOptions.some((item) => item.value === savedLanguage) ? savedLanguage : DEFAULT_LANGUAGE;
}

function currentLocaleTag() {
  return languageOptions.find((item) => item.value === currentLanguage())?.locale || "uz-UZ";
}

function currentDateLocale() {
  return dateLocaleMap[currentLanguage()] || uz;
}

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
    debtSummaries: [],
    insights: []
  };
}

export function categoriesByType(categories, type) {
  return categories.filter((category) => category.type === type);
}

export function apiUrl(path) {
  return path.startsWith("http://") || path.startsWith("https://") ? path : `${API_BASE_URL}${path}`;
}

export function fetchJson(url, options = {}) {
  return fetch(apiUrl(url), {
    credentials: "include",
    ...options
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

export function sendJson(url, options = {}) {
  const { headers, body, ...rest } = options;

  return fetch(apiUrl(url), {
    headers: {
      "Content-Type": "application/json",
      ...(headers || {})
    },
    credentials: "include",
    ...rest,
    body: body ? JSON.stringify(body) : undefined
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
    const error = new Error(payload.message || "So'rov bajarilmadi");
    error.status = response.status;
    return error;
  } catch {
    const error = new Error("So'rov bajarilmadi");
    error.status = response.status;
    return error;
  }
}

export function endOfMonth(monthValue) {
  const date = new Date(`${monthValue}-01T00:00:00`);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().slice(0, 10);
}

export function formatMoney(value, currency) {
  const amount = Number(value || 0);

  try {
    return new Intl.NumberFormat(currentLocaleTag(), {
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
    return new Intl.NumberFormat(currentLocaleTag(), {
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
  return new Intl.NumberFormat(currentLocaleTag(), {
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

export function formatDateValue(value, pattern = "dd.MM.yyyy") {
  const dateValue = value instanceof Date ? value : new Date(value);
  return format(dateValue, pattern, { locale: currentDateLocale() });
}

export function formatMonthValue(value) {
  const dateValue = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(currentLocaleTag(), {
    month: "long",
    year: "numeric"
  }).format(dateValue);
}

export function getWeekdayLabels() {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, index) => {
    return format(addDays(weekStart, index), "EE", { locale: currentDateLocale() });
  });
}

export function signedMoney(value, currency) {
  const amount = Number(value || 0);
  const sign = amount > 0 ? "+" : "";
  return `${sign}${formatMoney(amount, currency)}`;
}

export function accountTypeLabel(type, t = (value) => value) {
  return {
    BANK_ACCOUNT: t("Bank hisobraqami"),
    BANK_CARD: t("Bank kartasi"),
    CASH: t("Naqd pul"),
    SAVINGS: t("Jamg'arma"),
    E_WALLET: t("Elektron hamyon")
  }[type] || type;
}

export function debtTypeLabel(type, t = (value) => value) {
  return {
    DEBT: t("Mening qarzim"),
    RECEIVABLE: t("Menga qaytishi kerak")
  }[type] || type;
}

export function budgetTypeLabel(type, t = (value) => value) {
  return {
    INCOME_TARGET: t("Daromad rejasi"),
    EXPENSE_LIMIT: t("Xarajat limiti")
  }[type] || type;
}

export function transactionTypeLabel(type, t = (value) => value) {
  return {
    INCOME: t("Tushum"),
    EXPENSE: t("Xarajat"),
    TRANSFER: t("Transfer")
  }[type] || type;
}

export function categoryLabel(name, t = (value) => value) {
  const localizedCategories = {
    Salary: t("Ish haqi"),
    Freelance: t("Frilans"),
    Cashback: t("Keshbek"),
    Grocery: t("Oziq-ovqat"),
    Transport: t("Transport"),
    Utilities: t("Kommunal"),
    Dining: t("Ovqatlanish"),
    Entertainment: t("Ko'ngilochar")
  };

  return localizedCategories[name] || name;
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
