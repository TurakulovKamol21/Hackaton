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
  LinearProgress,
  Card,
  CardContent,
  IconButton,
  Grid,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useFinance } from '../context/FinanceContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, formatCurrency } from '../utils/categories';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export const Budget = () => {
  const { budgets, transactions, addBudget, deleteBudget } = useFinance();
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [formData, setFormData] = useState({
    category: '',
    type: 'expense' as 'income' | 'expense',
    limit: 0,
    month: format(new Date(), 'yyyy-MM'),
  });

  const handleOpen = (type: 'income' | 'expense') => {
    setFormData({
      category: '',
      type,
      limit: 0,
      month: selectedMonth,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    if (!formData.category || formData.limit <= 0) {
      return;
    }

    addBudget(formData);
    handleClose();
  };

  const handleDelete = (budgetId: string) => {
    if (window.confirm('Haqiqatan ham bu byudjetni o\'chirmoqchimisiz?')) {
      deleteBudget(budgetId);
    }
  };

  // Filter budgets for selected month
  const monthBudgets = budgets.filter(b => b.month === selectedMonth);

  // Calculate actual spending/income for the month
  const monthStart = startOfMonth(new Date(selectedMonth));
  const monthEnd = endOfMonth(new Date(selectedMonth));

  const getActualAmount = (category: string, type: 'income' | 'expense') => {
    return transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return (
          t.type === type &&
          t.category === category &&
          transactionDate >= monthStart &&
          transactionDate <= monthEnd
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const expenseBudgets = monthBudgets.filter(b => b.type === 'expense');
  const incomeBudgets = monthBudgets.filter(b => b.type === 'income');

  const totalExpenseBudget = expenseBudgets.reduce((sum, b) => sum + b.limit, 0);
  const totalExpenseActual = expenseBudgets.reduce((sum, b) => sum + getActualAmount(b.category, 'expense'), 0);

  const totalIncomeBudget = incomeBudgets.reduce((sum, b) => sum + b.limit, 0);
  const totalIncomeActual = incomeBudgets.reduce((sum, b) => sum + getActualAmount(b.category, 'income'), 0);

  const BudgetCard = ({ budget }: { budget: any }) => {
    const actual = getActualAmount(budget.category, budget.type);
    const percentage = Math.min((actual / budget.limit) * 100, 100);
    const isOverBudget = actual > budget.limit;

    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6">{budget.category}</Typography>
              <Typography variant="caption" color="text.secondary">
                {budget.type === 'income' ? 'Tushum' : 'Xarajat'}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => handleDelete(budget.id)} color="error">
              <Delete fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {formatCurrency(actual)} / {formatCurrency(budget.limit)}
              </Typography>
              <Typography variant="body2" color={isOverBudget ? 'error' : 'text.secondary'}>
                {percentage.toFixed(0)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={percentage} 
              color={isOverBudget ? 'error' : 'primary'}
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>
          {isOverBudget && (
            <Typography variant="caption" color="error">
              Reja oshib ketdi: {formatCurrency(actual - budget.limit)}
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Byudjet</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" color="error" startIcon={<Add />} onClick={() => handleOpen('expense')}>
            Xarajat
          </Button>
          <Button variant="contained" color="success" startIcon={<Add />} onClick={() => handleOpen('income')}>
            Tushum
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Xarajatlar byudjeti
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" color="error.main">
                {formatCurrency(totalExpenseActual)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rejadan: {formatCurrency(totalExpenseBudget)}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min((totalExpenseActual / totalExpenseBudget) * 100 || 0, 100)} 
                color={totalExpenseActual > totalExpenseBudget ? 'error' : 'primary'}
                sx={{ mt: 1, height: 8, borderRadius: 1 }}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tushumlar byudjeti
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" color="success.main">
                {formatCurrency(totalIncomeActual)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rejadan: {formatCurrency(totalIncomeBudget)}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min((totalIncomeActual / totalIncomeBudget) * 100 || 0, 100)} 
                color="success"
                sx={{ mt: 1, height: 8, borderRadius: 1 }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>
        Xarajatlar
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {expenseBudgets.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Bu oy uchun xarajatlar byudjeti belgilanmagan
              </Typography>
            </Paper>
          </Grid>
        ) : (
          expenseBudgets.map((budget) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={budget.id}>
              <BudgetCard budget={budget} />
            </Grid>
          ))
        )}
      </Grid>

      <Typography variant="h6" gutterBottom>
        Tushumlar
      </Typography>
      <Grid container spacing={2}>
        {incomeBudgets.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Bu oy uchun tushumlar byudjeti belgilanmagan
              </Typography>
            </Paper>
          </Grid>
        ) : (
          incomeBudgets.map((budget) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={budget.id}>
              <BudgetCard budget={budget} />
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {formData.type === 'income' ? 'Tushum byudjeti' : 'Xarajat byudjeti'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Kategoriya"
              fullWidth
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {(formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Reja (limit)"
              type="number"
              fullWidth
              value={formData.limit}
              onChange={(e) => setFormData({ ...formData, limit: parseFloat(e.target.value) || 0 })}
            />
            <TextField
              type="month"
              label="Oy"
              fullWidth
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Bekor qilish</Button>
          <Button onClick={handleSubmit} variant="contained">
            Qo'shish
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};