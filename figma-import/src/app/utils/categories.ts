export const EXPENSE_CATEGORIES = [
  'Oziq-ovqat',
  'Transport',
  'Kommunal',
  'O\'yin-kulgi',
  'Kiyim-kechak',
  'Sog\'liqni saqlash',
  'Ta\'lim',
  'Uyga xarajatlar',
  'Boshqalar',
];

export const INCOME_CATEGORIES = [
  'Ish haqi',
  'Biznes',
  'Investitsiya',
  'Sovg\'a',
  'Boshqalar',
];

export const CURRENCIES = [
  { code: 'UZS', symbol: 'so\'m', name: 'O\'zbek so\'mi' },
  { code: 'USD', symbol: '$', name: 'AQSH dollari' },
  { code: 'EUR', symbol: '€', name: 'Evro' },
  { code: 'RUB', symbol: '₽', name: 'Rossiya rubli' },
];

export const ACCOUNT_TYPES = [
  { value: 'bank_account', label: 'Bank hisobraqami' },
  { value: 'card', label: 'Bank kartasi' },
  { value: 'cash', label: 'Naqd pul' },
];

export const formatCurrency = (amount: number, currency: string = 'UZS') => {
  const currencyInfo = CURRENCIES.find(c => c.code === currency);
  if (!currencyInfo) return `${amount.toLocaleString()} ${currency}`;
  
  if (currency === 'UZS') {
    return `${amount.toLocaleString()} ${currencyInfo.symbol}`;
  }
  return `${currencyInfo.symbol}${amount.toLocaleString()}`;
};
