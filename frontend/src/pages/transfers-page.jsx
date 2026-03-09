import { useState } from "react";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { Add, SwapHoriz } from "@mui/icons-material";
import { format } from "date-fns";
import { EmptyState, PageHeader, SectionCard } from "../components/ui-kit";
import { useFinance } from "../finance/finance-context";
import { formatMoney } from "../lib/finance-utils";

const initialTransfer = {
  fromAccountId: "",
  toAccountId: "",
  fromAmount: "",
  toAmount: "",
  rate: "1",
  transferDate: new Date().toISOString().slice(0, 10),
  note: ""
};

export default function TransfersPage() {
  const theme = useTheme();
  const { accounts, transfers, selectedMonth, busyAction, createTransfer } = useFinance();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(initialTransfer);

  const visibleTransfers = transfers
    .filter((item) => item.transferDate.startsWith(selectedMonth))
    .sort((left, right) => right.transferDate.localeCompare(left.transferDate) || right.id - left.id);

  const fromAccount = accounts.find((account) => String(account.id) === formData.fromAccountId);
  const toAccount = accounts.find((account) => String(account.id) === formData.toAccountId);
  const sameCurrency = fromAccount && toAccount && fromAccount.currency === toAccount.currency;

  function handleOpen() {
    setFormData({
      ...initialTransfer,
      fromAccountId: String(accounts[0]?.id ?? ""),
      toAccountId: String(accounts[1]?.id ?? accounts[0]?.id ?? "")
    });
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    setFormData(initialTransfer);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.fromAccountId || !formData.toAccountId || formData.fromAccountId === formData.toAccountId) {
      return;
    }

    const rate = Number(formData.rate || 1);
    const fromAmount = Number(formData.fromAmount || 0);
    const toAmount = sameCurrency ? fromAmount : Number(formData.toAmount || 0);

    await createTransfer({
      ...formData,
      rate,
      fromAmount,
      toAmount
    });

    handleClose();
  }

  return (
    <Box>
      <PageHeader
        eyebrow="Transfers"
        title="Ichki transferlar"
        subtitle="Bir accountdan boshqasiga mablag‘ o‘tkazing, kerak bo‘lsa valyuta kursini bir vaqtda kiriting."
        action={
          <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
            Transfer yaratish
          </Button>
        }
      />

      <SectionCard title="Transfer logi" subtitle="Tanlangan oy bo‘yicha barcha ichki o‘tkazmalar.">
        {visibleTransfers.length ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sana</TableCell>
                  <TableCell>Qayerdan</TableCell>
                  <TableCell align="center">Yo'nalish</TableCell>
                  <TableCell>Qayerga</TableCell>
                  <TableCell>Summa</TableCell>
                  <TableCell>Izoh</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleTransfers.map((transfer) => (
                  <TableRow
                    key={transfer.id}
                    hover
                    sx={{
                      "&:nth-of-type(odd)": {
                        backgroundColor: alpha(theme.palette.background.default, 0.45)
                      }
                    }}
                  >
                    <TableCell>{format(new Date(transfer.transferDate), "dd.MM.yyyy")}</TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {transfer.fromAccountName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatMoney(transfer.fromAmount, transfer.fromCurrency)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <SwapHoriz color="primary" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {transfer.toAccountName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatMoney(transfer.toAmount, transfer.toCurrency)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{`Rate: ${transfer.rate}`}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {transfer.fromCurrency} → {transfer.toCurrency}
                      </Typography>
                    </TableCell>
                    <TableCell>{transfer.note || "Izoh yo'q"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <EmptyState
            title="Transferlar hali yo'q"
            message="Cross-account yoki cross-currency o'tkazma qilganingizdan so'ng, u shu jadvalda alohida ko‘rinadi."
          />
        )}
      </SectionCard>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>Yangi transfer</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                select
                label="Qayerdan"
                value={formData.fromAccountId}
                onChange={(event) => setFormData((previous) => ({ ...previous, fromAccountId: event.target.value }))}
              >
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={String(account.id)}>
                    {account.name} • {formatMoney(account.currentBalance, account.currency)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Qayerga"
                value={formData.toAccountId}
                onChange={(event) => setFormData((previous) => ({ ...previous, toAccountId: event.target.value }))}
              >
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={String(account.id)}>
                    {account.name} • {formatMoney(account.currentBalance, account.currency)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Jo'natiladigan summa"
                type="number"
                value={formData.fromAmount}
                onChange={(event) => setFormData((previous) => ({ ...previous, fromAmount: event.target.value }))}
              />
              {sameCurrency ? (
                <TextField
                  label="Qabul qilinadigan summa"
                  value={formData.fromAmount}
                  disabled
                  helperText="Bir xil valyuta uchun qabul qilinadigan summa jo'natilgan summaga teng."
                />
              ) : (
                <>
                  <TextField
                    label="Qabul qilinadigan summa"
                    type="number"
                    value={formData.toAmount}
                    onChange={(event) => setFormData((previous) => ({ ...previous, toAmount: event.target.value }))}
                  />
                  <TextField
                    label="Valyuta kursi"
                    type="number"
                    value={formData.rate}
                    onChange={(event) => setFormData((previous) => ({ ...previous, rate: event.target.value }))}
                    helperText={fromAccount && toAccount ? `${fromAccount.currency} → ${toAccount.currency}` : "Valyutani tanlang"}
                  />
                </>
              )}
              <TextField
                type="date"
                label="Sana"
                value={formData.transferDate}
                onChange={(event) => setFormData((previous) => ({ ...previous, transferDate: event.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Izoh"
                multiline
                minRows={3}
                value={formData.note}
                onChange={(event) => setFormData((previous) => ({ ...previous, note: event.target.value }))}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClose}>Bekor qilish</Button>
            <Button type="submit" variant="contained" disabled={Boolean(busyAction)}>
              Saqlash
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
