import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Account {
  id: string;
  name: string;
  type: 'bank_account' | 'cash' | 'card';
  currency: string;
  balance: number;
  initialBalance: number;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: Date;
  description: string;
  category: string;
  accountId: string;
}

export interface Transfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: Date;
  exchangeRate?: number;
  description?: string;
}

export interface Debt {
  id: string;
  type: 'given' | 'received';
  person: string;
  amount: number;
  currency: string;
  date: Date;
  dueDate?: Date;
  status: 'OPEN' | 'CLOSED';
  description?: string;
}

export interface Budget {
  id: string;
  category: string;
  type: 'income' | 'expense';
  limit: number;
  month: string; // YYYY-MM
}

interface FinanceContextType {
  accounts: Account[];
  transactions: Transaction[];
  transfers: Transfer[];
  debts: Debt[];
  budgets: Budget[];
  addAccount: (account: Omit<Account, 'id' | 'createdAt'>) => void;
  updateAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addTransfer: (transfer: Omit<Transfer, 'id'>) => void;
  addDebt: (debt: Omit<Debt, 'id'>) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  getTotalBalance: () => number;
  getAccountBalance: (accountId: string) => number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }
  return context;
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('finance_accounts');
    return saved ? JSON.parse(saved, (key, value) => {
      if (key === 'createdAt') return new Date(value);
      return value;
    }) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finance_transactions');
    return saved ? JSON.parse(saved, (key, value) => {
      if (key === 'date') return new Date(value);
      return value;
    }) : [];
  });

  const [transfers, setTransfers] = useState<Transfer[]>(() => {
    const saved = localStorage.getItem('finance_transfers');
    return saved ? JSON.parse(saved, (key, value) => {
      if (key === 'date') return new Date(value);
      return value;
    }) : [];
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem('finance_debts');
    return saved ? JSON.parse(saved, (key, value) => {
      if (key === 'date' || key === 'dueDate') return value ? new Date(value) : undefined;
      return value;
    }) : [];
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('finance_budgets');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('finance_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('finance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finance_transfers', JSON.stringify(transfers));
  }, [transfers]);

  useEffect(() => {
    localStorage.setItem('finance_debts', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('finance_budgets', JSON.stringify(budgets));
  }, [budgets]);

  const addAccount = (account: Omit<Account, 'id' | 'createdAt'>) => {
    const newAccount: Account = {
      ...account,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setAccounts([...accounts, newAccount]);
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(accounts.map(acc => acc.id === id ? { ...acc, ...updates } : acc));
  };

  const deleteAccount = (id: string) => {
    setAccounts(accounts.filter(acc => acc.id !== id));
    setTransactions(transactions.filter(t => t.accountId !== id));
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions([...transactions, newTransaction]);
    
    // Update account balance
    const account = accounts.find(acc => acc.id === transaction.accountId);
    if (account) {
      const balanceChange = transaction.type === 'income' ? transaction.amount : -transaction.amount;
      updateAccount(account.id, { balance: account.balance + balanceChange });
    }
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const oldTransaction = transactions.find(t => t.id === id);
    if (!oldTransaction) return;

    // Revert old balance change
    const oldAccount = accounts.find(acc => acc.id === oldTransaction.accountId);
    if (oldAccount) {
      const oldChange = oldTransaction.type === 'income' ? oldTransaction.amount : -oldTransaction.amount;
      updateAccount(oldAccount.id, { balance: oldAccount.balance - oldChange });
    }

    // Apply new transaction
    const newTransaction = { ...oldTransaction, ...updates };
    setTransactions(transactions.map(t => t.id === id ? newTransaction : t));

    // Apply new balance change
    const newAccount = accounts.find(acc => acc.id === newTransaction.accountId);
    if (newAccount) {
      const newChange = newTransaction.type === 'income' ? newTransaction.amount : -newTransaction.amount;
      updateAccount(newAccount.id, { balance: newAccount.balance + newChange });
    }
  };

  const deleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      const account = accounts.find(acc => acc.id === transaction.accountId);
      if (account) {
        const balanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount;
        updateAccount(account.id, { balance: account.balance + balanceChange });
      }
    }
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const addTransfer = (transfer: Omit<Transfer, 'id'>) => {
    const newTransfer: Transfer = {
      ...transfer,
      id: Date.now().toString(),
    };
    setTransfers([...transfers, newTransfer]);

    // Update balances
    const fromAccount = accounts.find(acc => acc.id === transfer.fromAccountId);
    const toAccount = accounts.find(acc => acc.id === transfer.toAccountId);

    if (fromAccount) {
      updateAccount(fromAccount.id, { balance: fromAccount.balance - transfer.amount });
    }

    if (toAccount) {
      const receivedAmount = transfer.exchangeRate ? transfer.amount * transfer.exchangeRate : transfer.amount;
      updateAccount(toAccount.id, { balance: toAccount.balance + receivedAmount });
    }
  };

  const addDebt = (debt: Omit<Debt, 'id'>) => {
    const newDebt: Debt = {
      ...debt,
      id: Date.now().toString(),
    };
    setDebts([...debts, newDebt]);
  };

  const updateDebt = (id: string, updates: Partial<Debt>) => {
    setDebts(debts.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDebt = (id: string) => {
    setDebts(debts.filter(d => d.id !== id));
  };

  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
    };
    setBudgets([...budgets, newBudget]);
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    setBudgets(budgets.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBudget = (id: string) => {
    setBudgets(budgets.filter(b => b.id !== id));
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  };

  const getAccountBalance = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.balance : 0;
  };

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        transactions,
        transfers,
        debts,
        budgets,
        addAccount,
        updateAccount,
        deleteAccount,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addTransfer,
        addDebt,
        updateDebt,
        deleteDebt,
        addBudget,
        updateBudget,
        deleteBudget,
        getTotalBalance,
        getAccountBalance,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};
