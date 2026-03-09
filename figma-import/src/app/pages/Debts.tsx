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
  Chip,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import { Add, Delete, CheckCircle } from '@mui/icons-material';
import { useFinance } from '../context/FinanceContext';
import { CURRENCIES, formatCurrency } from '../utils/categories';
import { format } from 'date-fns';

export const Debts = () => {
  const { debts, addDebt, updateDebt, deleteDebt } = useFinance();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    type: 'given' as 'given' | 'received',
    person: '',
    amount: 0,
    currency: 'UZS',
    date: format(new Date(), 'yyyy-MM-dd'),
    dueDate: '',
    description: '',
  });

  const handleOpen = (type: 'given' | 'received') => {
    setFormData({
      type,
      person: '',
      amount: 0,
      currency: 'UZS',
      date: format(new Date(), 'yyyy-MM-dd'),
      dueDate: '',
      description: '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    if (!formData.person || formData.amount <= 0) {
      return;
    }

    const debtData = {
      ...formData,
      date: new Date(formData.date),
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      status: 'OPEN' as const,
    };

    addDebt(debtData);
    handleClose();
  };

  const handleMarkAsClosed = (debtId: string) => {
    updateDebt(debtId, { status: 'CLOSED' });
  };

  const handleDelete = (debtId: string) => {
    if (window.confirm('Haqiqatan ham bu qarzni o\'chirmoqchimisiz?')) {
      deleteDebt(debtId);
    }
  };

  const filteredDebts = debts.filter(d => 
    activeTab === 0 ? d.type === 'given' : d.type === 'received'
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const openDebts = filteredDebts.filter(d => d.status === 'OPEN');
  const closedDebts = filteredDebts.filter(d => d.status === 'CLOSED');

  const totalOpen = openDebts.reduce((sum, d) => sum + d.amount, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Qarzlar</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            color="warning"
            startIcon={<Add />} 
            onClick={() => handleOpen('given')}
          >
            Berilgan qarz
          </Button>
          <Button 
            variant="contained" 
            color="success"
            startIcon={<Add />} 
            onClick={() => handleOpen('received')}
          >
            Olingan qarz
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 2, p: 2 }}>
        <Typography variant="h6">
          Ochiq qarzlar: {formatCurrency(totalOpen)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {activeTab === 0 ? 'Men berganim' : 'Menga berishgan'}
        </Typography>
      </Paper>

      <Paper>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab label="Berilgan qarzlar" />
          <Tab label="Olingan qarzlar" />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Kishi</TableCell>
                <TableCell>Summa</TableCell>
                <TableCell>Sana</TableCell>
                <TableCell>Muddat</TableCell>
                <TableCell>Holat</TableCell>
                <TableCell>Tavsif</TableCell>
                <TableCell align="right">Amallar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {openDebts.length === 0 && closedDebts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      Hozircha qarzlar yo'q
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {openDebts.map((debt) => (
                    <TableRow key={debt.id}>
                      <TableCell>{debt.person}</TableCell>
                      <TableCell>
                        <Typography color="warning.main" fontWeight={600}>
                          {formatCurrency(debt.amount, debt.currency)}
                        </Typography>
                      </TableCell>
                      <TableCell>{format(new Date(debt.date), 'dd.MM.yyyy')}</TableCell>
                      <TableCell>
                        {debt.dueDate ? format(new Date(debt.dueDate), 'dd.MM.yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip label="Ochiq" color="warning" size="small" />
                      </TableCell>
                      <TableCell>{debt.description || '-'}</TableCell>
                      <TableCell align="right">
                        <IconButton 
                          size="small" 
                          color="success"
                          onClick={() => handleMarkAsClosed(debt.id)}
                          title="Yopildi deb belgilash"
                        >
                          <CheckCircle fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(debt.id)} color="error">
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {closedDebts.map((debt) => (
                    <TableRow key={debt.id} sx={{ opacity: 0.6 }}>
                      <TableCell>{debt.person}</TableCell>
                      <TableCell>{formatCurrency(debt.amount, debt.currency)}</TableCell>
                      <TableCell>{format(new Date(debt.date), 'dd.MM.yyyy')}</TableCell>
                      <TableCell>
                        {debt.dueDate ? format(new Date(debt.dueDate), 'dd.MM.yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip label="Yopilgan" color="success" size="small" />
                      </TableCell>
                      <TableCell>{debt.description || '-'}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleDelete(debt.id)} color="error">
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {formData.type === 'given' ? 'Berilgan qarz' : 'Olingan qarz'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Kishi"
              fullWidth
              value={formData.person}
              onChange={(e) => setFormData({ ...formData, person: e.target.value })}
            />
            <TextField
              label="Summa"
              type="number"
              fullWidth
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            />
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
            <TextField
              label="Sana"
              type="date"
              fullWidth
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Qaytarish muddati (ixtiyoriy)"
              type="date"
              fullWidth
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Tavsif (ixtiyoriy)"
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
