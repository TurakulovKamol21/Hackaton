import { createContext, startTransition, useContext, useEffect, useState } from "react";
import { useAuth } from "../auth/auth-context";
import {
  categoriesByType,
  currentMonthValue,
  emptyDashboard,
  endOfMonth,
  fetchJson,
  sendJson
} from "../lib/finance-utils";

const FinanceContext = createContext(null);

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeMonthValue(value) {
  return value || currentMonthValue;
}

export function FinanceProvider({ children }) {
  const { clearSession } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [entries, setEntries] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [debts, setDebts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [dashboard, setDashboard] = useState(emptyDashboard());
  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue);
  const [granularity, setGranularity] = useState("MONTHLY");
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const monthValue = normalizeMonthValue(selectedMonth);
        const from = `${monthValue}-01`;
        const to = endOfMonth(monthValue);

        const [referencePayload, dashboardPayload, entryPayload, transferPayload, debtPayload, budgetPayload] =
          await Promise.all([
            fetchJson("/api/reference"),
            fetchJson(`/api/dashboard?month=${monthValue}&granularity=${granularity}`),
            fetchJson(`/api/entries?from=${from}&to=${to}`),
            fetchJson("/api/transfers"),
            fetchJson("/api/debts"),
            fetchJson(`/api/budgets?month=${monthValue}`)
          ]);

        if (!active) {
          return;
        }

        setAccounts(referencePayload.accounts ?? []);
        setCategories(referencePayload.categories ?? []);
        setDashboard(dashboardPayload ?? emptyDashboard(monthValue));
        setEntries(entryPayload ?? []);
        setTransfers(transferPayload ?? []);
        setDebts(debtPayload ?? []);
        setBudgets(budgetPayload ?? []);
      } catch (loadError) {
        if (!active) {
          return;
        }

        if (loadError.status === 401) {
          clearSession();
          return;
        }

        const message = loadError.message || "Ma'lumotlarni yuklab bo'lmadi";
        setError(message);
        setToast({
          open: true,
          message,
          severity: "error"
        });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [selectedMonth, granularity, refreshKey]);

  function closeToast() {
    setToast((previous) => ({ ...previous, open: false }));
  }

  function refresh() {
    startTransition(() => {
      setRefreshKey((previous) => previous + 1);
    });
  }

  async function mutate(actionKey, successMessage, operation) {
    setBusyAction(actionKey);
    setError("");

    try {
      const result = await operation();
      if (successMessage) {
        setToast({
          open: true,
          message: successMessage,
          severity: "success"
        });
      }
      refresh();
      return result;
    } catch (mutationError) {
      if (mutationError.status === 401) {
        clearSession();
        throw mutationError;
      }

      const message = mutationError.message || "So'rov bajarilmadi";
      setError(message);
      setToast({
        open: true,
        message,
        severity: "error"
      });
      throw mutationError;
    } finally {
      setBusyAction("");
    }
  }

  function createAccount(payload) {
    return mutate("create-account", "Hisob qo'shildi", () =>
      sendJson("/api/accounts", {
        method: "POST",
        body: {
          name: payload.name.trim(),
          type: payload.type,
          currency: payload.currency,
          initialBalance: Number(payload.initialBalance || 0)
        }
      })
    );
  }

  function updateAccount(id, payload) {
    return mutate("update-account", "Hisob yangilandi", () =>
      sendJson(`/api/accounts/${id}`, {
        method: "PUT",
        body: {
          name: payload.name.trim(),
          type: payload.type,
          currency: payload.currency,
          initialBalance: Number(payload.initialBalance || 0)
        }
      })
    );
  }

  function deleteAccount(id) {
    return mutate("delete-account", "Hisob o'chirildi", () =>
      sendJson(`/api/accounts/${id}`, {
        method: "DELETE"
      })
    );
  }

  function createEntry(payload) {
    return mutate("create-entry", "Tranzaksiya qo'shildi", () =>
      sendJson("/api/entries", {
        method: "POST",
        body: {
          type: payload.type,
          amount: Number(payload.amount),
          transactionDate: payload.transactionDate || todayValue(),
          title: payload.title.trim(),
          note: payload.note?.trim() || null,
          categoryId: Number(payload.categoryId),
          accountId: Number(payload.accountId)
        }
      })
    );
  }

  function updateEntry(id, payload) {
    return mutate("update-entry", "Tranzaksiya yangilandi", () =>
      sendJson(`/api/entries/${id}`, {
        method: "PUT",
        body: {
          type: payload.type,
          amount: Number(payload.amount),
          transactionDate: payload.transactionDate || todayValue(),
          title: payload.title.trim(),
          note: payload.note?.trim() || null,
          categoryId: Number(payload.categoryId),
          accountId: Number(payload.accountId)
        }
      })
    );
  }

  function deleteEntry(id) {
    return mutate("delete-entry", "Tranzaksiya o'chirildi", () =>
      sendJson(`/api/entries/${id}`, {
        method: "DELETE"
      })
    );
  }

  function createTransfer(payload) {
    return mutate("create-transfer", "Transfer yaratildi", () =>
      sendJson("/api/transfers", {
        method: "POST",
        body: {
          fromAccountId: Number(payload.fromAccountId),
          toAccountId: Number(payload.toAccountId),
          fromAmount: Number(payload.fromAmount),
          toAmount: Number(payload.toAmount),
          rate: Number(payload.rate),
          transferDate: payload.transferDate || todayValue(),
          note: payload.note?.trim() || null
        }
      })
    );
  }

  function createDebt(payload) {
    return mutate("create-debt", "Qarz yozuvi qo'shildi", () =>
      sendJson("/api/debts", {
        method: "POST",
        body: {
          type: payload.type,
          counterparty: payload.counterparty.trim(),
          amount: Number(payload.amount),
          currency: payload.currency,
          openedOn: payload.openedOn || todayValue(),
          dueDate: payload.dueDate || null,
          status: payload.status,
          note: payload.note?.trim() || null
        }
      })
    );
  }

  function updateDebt(id, payload) {
    return mutate("update-debt", "Qarz yozuvi yangilandi", () =>
      sendJson(`/api/debts/${id}`, {
        method: "PUT",
        body: {
          type: payload.type,
          counterparty: payload.counterparty.trim(),
          amount: Number(payload.amount),
          currency: payload.currency,
          openedOn: payload.openedOn,
          dueDate: payload.dueDate || null,
          status: payload.status,
          note: payload.note?.trim() || null
        }
      })
    );
  }

  function deleteDebt(id) {
    return mutate("delete-debt", "Qarz yozuvi o'chirildi", () =>
      sendJson(`/api/debts/${id}`, {
        method: "DELETE"
      })
    );
  }

  function saveBudget(payload) {
    return mutate("save-budget", "Byudjet saqlandi", () =>
      sendJson("/api/budgets", {
        method: "POST",
        body: {
          month: payload.month || selectedMonth,
          type: payload.type,
          amount: Number(payload.amount),
          currency: payload.currency,
          categoryId: payload.type === "EXPENSE_LIMIT" ? Number(payload.categoryId) : null
        }
      })
    );
  }

  function deleteBudget(id) {
    return mutate("delete-budget", "Byudjet o'chirildi", () =>
      sendJson(`/api/budgets/${id}`, {
        method: "DELETE"
      })
    );
  }

  const expenseCategories = categoriesByType(categories, "EXPENSE");
  const incomeCategories = categoriesByType(categories, "INCOME");

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        categories,
        entries,
        transfers,
        debts,
        budgets,
        dashboard,
        selectedMonth,
        granularity,
        loading,
        busyAction,
        error,
        toast,
        expenseCategories,
        incomeCategories,
        setSelectedMonth,
        setGranularity,
        closeToast,
        refresh,
        createAccount,
        updateAccount,
        deleteAccount,
        createEntry,
        updateEntry,
        deleteEntry,
        createTransfer,
        createDebt,
        updateDebt,
        deleteDebt,
        saveBudget,
        deleteBudget
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);

  if (!context) {
    throw new Error("useFinance must be used inside FinanceProvider");
  }

  return context;
}
