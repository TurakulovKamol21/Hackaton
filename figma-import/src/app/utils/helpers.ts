import { Currency } from '../types';

export const formatCurrency = (amount: number, currency: Currency): string => {
  const symbols: Record<Currency, string> = {
    UZS: "so'm",
    USD: '$',
    EUR: '€',
    RUB: '₽',
  };

  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${symbols[currency]}`;
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const getMonthYear = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    food: 'Oziq-ovqat',
    transport: 'Transport',
    utilities: 'Kommunal',
    entertainment: 'Ko\'ngilochar',
    healthcare: 'Sog\'liqni saqlash',
    education: 'Ta\'lim',
    shopping: 'Xarid',
    salary: 'Oylik',
    freelance: 'Freelance',
    business: 'Biznes',
    investment: 'Investitsiya',
    gift: 'Sovg\'a',
    other: 'Boshqa',
  };
  return labels[category] || category;
};

export const getAccountTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    bank_card: 'Bank kartasi',
    cash: 'Naqd pul',
    savings: 'Jamg\'arma',
    credit: 'Kredit',
  };
  return labels[type] || type;
};
