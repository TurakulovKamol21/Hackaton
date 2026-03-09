import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { formatCurrency, getCategoryLabel, getMonthYear } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export const Statistics: React.FC = () => {
  const { expenses, incomes, accounts } = useFinance();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  // Calculate statistics by category
  const categoryStats = React.useMemo(() => {
    const stats: { [key: string]: { income: number; expense: number } } = {};

    expenses.forEach(expense => {
      if (!stats[expense.category]) {
        stats[expense.category] = { income: 0, expense: 0 };
      }
      stats[expense.category].expense += expense.amount;
    });

    incomes.forEach(income => {
      if (!stats[income.category]) {
        stats[income.category] = { income: 0, expense: 0 };
      }
      stats[income.category].income += income.amount;
    });

    return Object.entries(stats).map(([category, data]) => ({
      category: getCategoryLabel(category),
      income: data.income,
      expense: data.expense,
    }));
  }, [expenses, incomes]);

  // Expense breakdown for pie chart
  const expenseBreakdown = React.useMemo(() => {
    const breakdown: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      if (!breakdown[expense.category]) {
        breakdown[expense.category] = 0;
      }
      breakdown[expense.category] += expense.amount;
    });

    return Object.entries(breakdown).map(([category, amount]) => ({
      name: getCategoryLabel(category),
      value: amount,
    }));
  }, [expenses]);

  // Income breakdown for pie chart
  const incomeBreakdown = React.useMemo(() => {
    const breakdown: { [key: string]: number } = {};
    
    incomes.forEach(income => {
      if (!breakdown[income.category]) {
        breakdown[income.category] = 0;
      }
      breakdown[income.category] += income.amount;
    });

    return Object.entries(breakdown).map(([category, amount]) => ({
      name: getCategoryLabel(category),
      value: amount,
    }));
  }, [incomes]);

  // Time series data
  const timeSeriesData = React.useMemo(() => {
    const dataByPeriod: { [key: string]: { income: number; expense: number } } = {};

    const getKey = (date: Date) => {
      switch (period) {
        case 'daily':
          return date.toISOString().split('T')[0];
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          return weekStart.toISOString().split('T')[0];
        case 'monthly':
          return getMonthYear(date);
        case 'yearly':
          return date.getFullYear().toString();
      }
    };

    expenses.forEach(expense => {
      const key = getKey(new Date(expense.date));
      if (!dataByPeriod[key]) {
        dataByPeriod[key] = { income: 0, expense: 0 };
      }
      dataByPeriod[key].expense += expense.amount;
    });

    incomes.forEach(income => {
      const key = getKey(new Date(income.date));
      if (!dataByPeriod[key]) {
        dataByPeriod[key] = { income: 0, expense: 0 };
      }
      dataByPeriod[key].income += income.amount;
    });

    return Object.entries(dataByPeriod)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-10) // Last 10 periods
      .map(([period, data]) => ({
        period,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
      }));
  }, [expenses, incomes, period]);

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-gray-900">Statistika va tahlil</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Umumiy daromad</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-green-600">
              {formatCurrency(totalIncome, 'UZS')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Umumiy xarajat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-red-600">
              {formatCurrency(totalExpense, 'UZS')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Sof balans</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-semibold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netBalance, 'UZS')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Umumiy</TabsTrigger>
          <TabsTrigger value="category">Kategoriya</TabsTrigger>
          <TabsTrigger value="timeline">Vaqt bo'yicha</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Xarajatlar taqsimoti</CardTitle>
              </CardHeader>
              <CardContent>
                {expenseBreakdown.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">Ma'lumot yo'q</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value, 'UZS')} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daromadlar taqsimoti</CardTitle>
              </CardHeader>
              <CardContent>
                {incomeBreakdown.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">Ma'lumot yo'q</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={incomeBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {incomeBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value, 'UZS')} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="category" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kategoriya bo'yicha daromad vs xarajat</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryStats.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">Ma'lumot yo'q</p>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={categoryStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value, 'UZS')} />
                    <Legend />
                    <Bar dataKey="income" fill="#10b981" name="Daromad" />
                    <Bar dataKey="expense" fill="#ef4444" name="Xarajat" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kategoriya bo'yicha batafsil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryStats.map((stat, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900">{stat.category}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Daromad</p>
                        <p className="font-medium text-green-600">{formatCurrency(stat.income, 'UZS')}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Xarajat</p>
                        <p className="font-medium text-red-600">{formatCurrency(stat.expense, 'UZS')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vaqt bo'yicha tahlil</CardTitle>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPeriod('daily')}
                    className={`px-3 py-1 text-sm rounded ${period === 'daily' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Kunlik
                  </button>
                  <button
                    onClick={() => setPeriod('weekly')}
                    className={`px-3 py-1 text-sm rounded ${period === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Haftalik
                  </button>
                  <button
                    onClick={() => setPeriod('monthly')}
                    className={`px-3 py-1 text-sm rounded ${period === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Oylik
                  </button>
                  <button
                    onClick={() => setPeriod('yearly')}
                    className={`px-3 py-1 text-sm rounded ${period === 'yearly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Yillik
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {timeSeriesData.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">Ma'lumot yo'q</p>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value, 'UZS')} />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#10b981" name="Daromad" strokeWidth={2} />
                    <Line type="monotone" dataKey="expense" stroke="#ef4444" name="Xarajat" strokeWidth={2} />
                    <Line type="monotone" dataKey="net" stroke="#3b82f6" name="Sof" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
