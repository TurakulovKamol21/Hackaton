import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { useFinance } from '../context/FinanceContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, formatCurrency } from '../utils/categories';
import { format } from 'date-fns';

export const Transactions = () => {
  const { transactions, accounts, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const [open, setOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    category: '',
    accountId: '',
  });

  const handleOpen = (type: 'income' | 'expense') => {
    setEditingTransaction(null);
    setFormData({
      type,
      amount: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      category: '',
      accountId: accounts[0]?.id || '',
    });
    setOpen(true);
  };

  const handleEdit = (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
      setEditingTransaction(transactionId);
      setFormData({
        type: transaction.type,
        amount: transaction.amount,
        date: format(new Date(transaction.date), 'yyyy-MM-dd'),
        description: transaction.description,
        category: transaction.category,
        accountId: transaction.accountId,
      });
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTransaction(null);
  };

  const handleSubmit = () => {
    if (!formData.description || !formData.category || !formData.accountId || formData.amount <= 0) {
      return;
    }

    const transactionData = {
      ...formData,
      date: new Date(formData.date),
    };

    if (editingTransaction) {
      updateTransaction(editingTransaction, transactionData);
    } else {
      addTransaction(transactionData);
    }
    handleClose();
  };

  const handleDelete = (transactionId: string) => {
    if (window.confirm('Haqiqatan ham bu tranzaksiyani o\'chirmoqchimisiz?')) {
      deleteTransaction(transactionId);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    activeTab === 0 ? t.type === 'expense' : t.type === 'income'
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const categories = activeTab === 0 ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Tranzaksiyalar</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            color="error"
            startIcon={<Add />} 
            onClick={() => handleOpen('expense')}
          >
            Xarajat
          </Button>
          <Button 
            variant="contained" 
            color="success"
            startIcon={<Add />} 
            onClick={() => handleOpen('income')}
          >
            Tushum
          </Button>
        </Box>
      </Box>

      <Paper>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab label="Xarajatlar" />
          <Tab label="Tushumlar" />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sana</TableCell>
                <TableCell>Tavsif</TableCell>
                <TableCell>Kategoriya</TableCell>
                <TableCell>Hisob</TableCell>
                <TableCell align="right">Summa</TableCell>
                <TableCell align="right">Amallar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      Hozircha tranzaksiyalar yo'q
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => {
                  const account = accounts.find(a => a.id === transaction.accountId);
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>{format(new Date(transaction.date), 'dd.MM.yyyy')}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <Chip 
                          label={transaction.category} 
                          size="small"
                          color={transaction.type === 'income' ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>{account?.name || '-'}</TableCell>
                      <TableCell align="right">
                        <Typography color={transaction.type === 'income' ? 'success.main' : 'error.main'}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount, account?.currency)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleEdit(transaction.id)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(transaction.id)} color="error">
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTransaction 
            ? 'Tranzaksiyani tahrirlash' 
            : formData.type === 'income' ? 'Yangi tushum' : 'Yangi xarajat'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Summa"
              type="number"
              fullWidth
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            />
            <TextField
              label="Sana"
              type="date"
              fullWidth
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Tavsif"
              fullWidth
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              select
              label="Kategoriya"
              fullWidth
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Hisob"
              fullWidth
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
            >
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.name} ({formatCurrency(account.balance, account.currency)})
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Bekor qilish</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTransaction ? 'Saqlash' : 'Qo\'shish'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
