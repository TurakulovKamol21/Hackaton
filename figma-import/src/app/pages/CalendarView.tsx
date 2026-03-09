import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar } from '../components/ui/calendar';
import { formatCurrency, getCategoryLabel } from '../utils/helpers';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { expenses, incomes, accounts } = useFinance();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const selectedDateTransactions = React.useMemo(() => {
    if (!selectedDate) return [];

    const dateStr = selectedDate.toISOString().split('T')[0];

    const dayExpenses = expenses
      .filter(e => new Date(e.date).toISOString().split('T')[0] === dateStr)
      .map(e => ({ ...e, type: 'expense' as const }));

    const dayIncomes = incomes
      .filter(i => new Date(i.date).toISOString().split('T')[0] === dateStr)
      .map(i => ({ ...i, type: 'income' as const }));

    return [...dayExpenses, ...dayIncomes].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [selectedDate, expenses, incomes]);

  const selectedDayIncome = selectedDateTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const selectedDayExpense = selectedDateTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate days with transactions for highlighting
  const daysWithTransactions = React.useMemo(() => {
    const dates = new Set<string>();
    
    expenses.forEach(e => {
      dates.add(new Date(e.date).toISOString().split('T')[0]);
    });
    
    incomes.forEach(i => {
      dates.add(new Date(i.date).toISOString().split('T')[0]);
    });
    
    return Array.from(dates).map(d => new Date(d));
  }, [expenses, incomes]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-gray-900">Kalendar ko'rinishi</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Kalendar</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                hasTransactions: daysWithTransactions,
              }}
              modifiersStyles={{
                hasTransactions: {
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                },
              }}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {selectedDate?.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Daromad</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(selectedDayIncome, 'UZS')}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Xarajat</p>
                <p className="text-lg font-semibold text-red-600">
                  {formatCurrency(selectedDayExpense, 'UZS')}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Sof</p>
                <p className={`text-lg font-semibold ${selectedDayIncome - selectedDayExpense >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(selectedDayIncome - selectedDayExpense, 'UZS')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate?.toLocaleDateString('en-GB')} - Tranzaksiyalar
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateTransactions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Bu kun uchun tranzaksiyalar yo'q
            </p>
          ) : (
            <div className="space-y-3">
              {selectedDateTransactions.map((transaction) => {
                const account = accounts.find(a => a.id === transaction.accountId);
                const isIncome = transaction.type === 'income';
                
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${isIncome ? 'bg-green-100' : 'bg-red-100'}`}>
                        {isIncome ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {isIncome 
                            ? (transaction as any).source 
                            : (transaction as any).description
                          }
                        </p>
                        <p className="text-xs text-gray-500">
                          {getCategoryLabel(transaction.category)} • {account?.name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <p className={`text-sm font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                      {isIncome ? '+' : '-'} {formatCurrency(transaction.amount, account?.currency || 'UZS')}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
