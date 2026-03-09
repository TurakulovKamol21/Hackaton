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
  IconButton,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { useFinance } from '../context/FinanceContext';
import { CURRENCIES, ACCOUNT_TYPES, formatCurrency } from '../utils/categories';

export const Accounts = () => {
  const { accounts, addAccount, updateAccount, deleteAccount } = useFinance();
  const [open, setOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'card' as 'bank_account' | 'cash' | 'card',
    currency: 'UZS',
    balance: 0,
    initialBalance: 0,
  });

  const handleOpen = () => {
    setEditingAccount(null);
    setFormData({
      name: '',
      type: 'card',
      currency: 'UZS',
      balance: 0,
      initialBalance: 0,
    });
    setOpen(true);
  };

  const handleEdit = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (account) {
      setEditingAccount(accountId);
      setFormData({
        name: account.name,
        type: account.type,
        currency: account.currency,
        balance: account.balance,
        initialBalance: account.initialBalance,
      });
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingAccount(null);
  };

  const handleSubmit = () => {
    if (!formData.name) return;

    if (editingAccount) {
      updateAccount(editingAccount, formData);
    } else {
      addAccount({
        ...formData,
        balance: formData.initialBalance,
      });
    }
    handleClose();
  };

  const handleDelete = (accountId: string) => {
    if (window.confirm('Haqiqatan ham bu hisobni o\'chirmoqchimisiz?')) {
      deleteAccount(accountId);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Hisoblar va kartalar</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
          Qo'shish
        </Button>
      </Box>

      <Grid container spacing={3}>
        {accounts.map((account) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={account.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">{account.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {ACCOUNT_TYPES.find(t => t.value === account.type)?.label}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => handleEdit(account.id)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(account.id)} color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="h5" color={account.balance >= 0 ? 'success.main' : 'error.main'}>
                  {formatCurrency(account.balance, account.currency)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Boshlang'ich: {formatCurrency(account.initialBalance, account.currency)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {accounts.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Hozircha hisoblar yo'q. Yangi hisob qo'shish uchun yuqoridagi tugmani bosing.
          </Typography>
        </Paper>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAccount ? 'Hisobni tahrirlash' : 'Yangi hisob qo\'shish'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nomi"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              select
              label="Turi"
              fullWidth
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            >
              {ACCOUNT_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Valyuta"
              fullWidth
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            >
              {CURRENCIES.map((currency) => (
                <MenuItem key={currency.code} value={currency.code}>
                  {currency.name} ({currency.symbol})
                </MenuItem>
              ))}
            </TextField>
            {!editingAccount && (
              <TextField
                label="Boshlang'ich balans"
                type="number"
                fullWidth
                value={formData.initialBalance}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  initialBalance: parseFloat(e.target.value) || 0 
                })}
              />
            )}
            {editingAccount && (
              <TextField
                label="Joriy balans"
                type="number"
                fullWidth
                value={formData.balance}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  balance: parseFloat(e.target.value) || 0 
                })}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Bekor qilish</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingAccount ? 'Saqlash' : 'Qo\'shish'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};