import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { formatCurrency, formatDate, getCategoryLabel } from '../utils/helpers';
import { Plus, Trash2 } from 'lucide-react';
import { ExpenseCategory } from '../types';

const expenseCategories: ExpenseCategory[] = [
  'food',
  'transport',
  'utilities',
  'entertainment',
  'healthcare',
  'education',
  'shopping',
  'other',
];

export const Expenses: React.FC = () => {
  const { accounts, expenses, addExpense, deleteExpense } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'food' as ExpenseCategory,
    accountId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || !formData.accountId) return;

    addExpense({
      amount,
      date: new Date(formData.date),
      description: formData.description,
      category: formData.category,
      accountId: formData.accountId,
    });

    setFormData({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: 'food',
      accountId: '',
    });
    setIsOpen(false);
  };

  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-gray-900">Xarajatlar</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Yangi xarajat
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yangi xarajat qo'shish</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="amount">Summa</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Sana</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Tavsif</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Masalan: Oziq-ovqat xaridi"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Kategoriya</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as ExpenseCategory })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {getCategoryLabel(cat)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="account">Hisob</Label>
                <Select value={formData.accountId} onValueChange={(value) => setFormData({ ...formData, accountId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Hisob tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({formatCurrency(account.balance, account.currency)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Qo'shish</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Barcha xarajatlar</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedExpenses.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Hozircha xarajatlar yo'q
            </p>
          ) : (
            <div className="space-y-3">
              {sortedExpenses.map((expense) => {
                const account = accounts.find(a => a.id === expense.accountId);
                return (
                  <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                        <p className="text-sm font-semibold text-red-600">
                          -{formatCurrency(expense.amount, account?.currency || 'UZS')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{getCategoryLabel(expense.category)}</span>
                        <span>•</span>
                        <span>{account?.name || 'Unknown'}</span>
                        <span>•</span>
                        <span>{formatDate(new Date(expense.date))}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Haqiqatan ham bu xarajatni o\'chirmoqchimisiz?')) {
                          deleteExpense(expense.id);
                        }
                      }}
                      className="ml-4"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
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
