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
import { IncomeCategory } from '../types';

const incomeCategories: IncomeCategory[] = [
  'salary',
  'freelance',
  'business',
  'investment',
  'gift',
  'other',
];

export const Income: React.FC = () => {
  const { accounts, incomes, addIncome, deleteIncome } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    source: '',
    category: 'salary' as IncomeCategory,
    accountId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || !formData.accountId) return;

    addIncome({
      amount,
      date: new Date(formData.date),
      source: formData.source,
      category: formData.category,
      accountId: formData.accountId,
    });

    setFormData({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      source: '',
      category: 'salary',
      accountId: '',
    });
    setIsOpen(false);
  };

  const sortedIncomes = [...incomes].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-gray-900">Daromadlar</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Yangi daromad
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yangi daromad qo'shish</DialogTitle>
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
                <Label htmlFor="source">Manba</Label>
                <Textarea
                  id="source"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="Masalan: Oylik maosh"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Kategoriya</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as IncomeCategory })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeCategories.map((cat) => (
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
          <CardTitle>Barcha daromadlar</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedIncomes.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Hozircha daromadlar yo'q
            </p>
          ) : (
            <div className="space-y-3">
              {sortedIncomes.map((income) => {
                const account = accounts.find(a => a.id === income.accountId);
                return (
                  <div key={income.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">{income.source}</p>
                        <p className="text-sm font-semibold text-green-600">
                          +{formatCurrency(income.amount, account?.currency || 'UZS')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{getCategoryLabel(income.category)}</span>
                        <span>•</span>
                        <span>{account?.name || 'Unknown'}</span>
                        <span>•</span>
                        <span>{formatDate(new Date(income.date))}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Haqiqatan ham bu daromadni o\'chirmoqchimisiz?')) {
                          deleteIncome(income.id);
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
