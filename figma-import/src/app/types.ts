export type Currency = 'UZS' | 'USD' | 'EUR' | 'RUB';

export type AccountType = 'bank_card' | 'cash' | 'savings' | 'credit';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: Currency;
  balance: number;
  initialBalance: number;
  createdAt: Date;
}

export type ExpenseCategory = 
  | 'food' 
  | 'transport' 
  | 'utilities' 
  | 'entertainment' 
  | 'healthcare' 
  | 'education' 
  | 'shopping' 
  | 'other';

export type IncomeCategory = 
  | 'salary' 
  | 'freelance' 
  | 'business' 
  | 'investment' 
  | 'gift' 
  | 'other';

export interface Expense {
  id: string;
  amount: number;
  date: Date;
  description: string;
  category: ExpenseCategory;
  accountId: string;
  createdAt: Date;
}

export interface Income {
  id: string;
  amount: number;
  date: Date;
  source: string;
  category: IncomeCategory;
  accountId: string;
  createdAt: Date;
}

export interface Transfer {
  id: string;
  amount: number;
  date: Date;
  fromAccountId: string;
  toAccountId: string;
  exchangeRate?: number;
  description?: string;
  createdAt: Date;
}

export type DebtStatus = 'open' | 'closed';

export interface Debt {
  id: string;
  amount: number;
  person: string;
  date: Date;
  description?: string;
  status: DebtStatus;
  createdAt: Date;
}

export interface Receivable {
  id: string;
  amount: number;
  person: string;
  date: Date;
  description?: string;
  status: DebtStatus;
  createdAt: Date;
}

export interface BudgetLimit {
  id: string;
  category: ExpenseCategory | IncomeCategory;
  type: 'expense' | 'income';
  monthlyLimit: number;
  month: string; // YYYY-MM
}

export interface Statistics {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byCategory: {
    category: string;
    income: number;
    expense: number;
  }[];
}
