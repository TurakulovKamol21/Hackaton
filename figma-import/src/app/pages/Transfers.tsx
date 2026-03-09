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
} from '@mui/material';
import { Add, SwapHoriz } from '@mui/icons-material';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/categories';
import { format } from 'date-fns';

export const Transfers = () => {
  const { transfers, accounts, addTransfer } = useFinance();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    exchangeRate: 1,
    description: '',
  });

  const handleOpen = () => {
    setFormData({
      fromAccountId: accounts[0]?.id || '',
      toAccountId: accounts[1]?.id || '',
      amount: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      exchangeRate: 1,
      description: '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    if (!formData.fromAccountId || !formData.toAccountId || formData.amount <= 0) {
      return;
    }

    if (formData.fromAccountId === formData.toAccountId) {
      alert('Bir xil hisoblar orasida transfer qilib bo\'lmaydi');
      return;
    }

    const fromAccount = accounts.find(a => a.id === formData.fromAccountId);
    const toAccount = accounts.find(a => a.id === formData.toAccountId);

    const transferData = {
      ...formData,
      date: new Date(formData.date),
      exchangeRate: fromAccount?.currency !== toAccount?.currency ? formData.exchangeRate : undefined,
    };

    addTransfer(transferData);
    handleClose();
  };

  const fromAccount = accounts.find(a => a.id === formData.fromAccountId);
  const toAccount = accounts.find(a => a.id === formData.toAccountId);
  const needsExchangeRate = fromAccount?.currency !== toAccount?.currency;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Transferlar</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
          Transfer qilish
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sana</TableCell>
              <TableCell>Qayerdan</TableCell>
              <TableCell align="center">
                <SwapHoriz />
              </TableCell>
              <TableCell>Qayerga</TableCell>
              <TableCell>Summa</TableCell>
              <TableCell>Tavsif</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transfers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    Hozircha transferlar yo'q
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              transfers
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((transfer) => {
                  const fromAcc = accounts.find(a => a.id === transfer.fromAccountId);
                  const toAcc = accounts.find(a => a.id === transfer.toAccountId);
                  return (
                    <TableRow key={transfer.id}>
                      <TableCell>{format(new Date(transfer.date), 'dd.MM.yyyy')}</TableCell>
                      <TableCell>{fromAcc?.name || '-'}</TableCell>
                      <TableCell align="center">
                        <SwapHoriz color="primary" />
                      </TableCell>
                      <TableCell>{toAcc?.name || '-'}</TableCell>
                      <TableCell>
                        {formatCurrency(transfer.amount, fromAcc?.currency)}
                        {transfer.exchangeRate && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            Kurs: {transfer.exchangeRate}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{transfer.description || '-'}</TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Yangi transfer</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Qayerdan"
              fullWidth
              value={formData.fromAccountId}
              onChange={(e) => setFormData({ ...formData, fromAccountId: e.target.value })}
            >
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.name} ({formatCurrency(account.balance, account.currency)})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Qayerga"
              fullWidth
              value={formData.toAccountId}
              onChange={(e) => setFormData({ ...formData, toAccountId: e.target.value })}
            >
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.name} ({formatCurrency(account.balance, account.currency)})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Summa"
              type="number"
              fullWidth
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              helperText={fromAccount && `Balans: ${formatCurrency(fromAccount.balance, fromAccount.currency)}`}
            />

            {needsExchangeRate && (
              <TextField
                label="Valyuta kursi"
                type="number"
                fullWidth
                value={formData.exchangeRate}
                onChange={(e) => setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) || 1 })}
                helperText={`${fromAccount?.currency} → ${toAccount?.currency}`}
              />
            )}

            <TextField
              label="Sana"
              type="date"
              fullWidth
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
            Transfer qilish
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
