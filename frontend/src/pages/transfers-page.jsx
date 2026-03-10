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
import { EmptyState, PageHeader, SectionCard } from "../components/ui-kit";
import { VoiceField, VoiceFormNotice } from "../components/voice-input";
import { useFinance } from "../finance/finance-context";
import { useI18n } from "../i18n/i18n-context";
import { formatDateValue, formatMoney } from "../lib/finance-utils";

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
  const { t } = useI18n();
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
        eyebrow={t("Transfers")}
        title={t("Ichki transferlar")}
        subtitle={t("Bir accountdan boshqasiga mablag‘ o‘tkazing, kerak bo‘lsa valyuta kursini bir vaqtda kiriting.")}
        action={
          <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
            {t("Transfer yaratish")}
          </Button>
        }
      />

      <SectionCard title={t("Transfer logi")} subtitle={t("Tanlangan oy bo‘yicha barcha ichki o‘tkazmalar.")}>
        {visibleTransfers.length ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("Sana")}</TableCell>
                  <TableCell>{t("Qayerdan")}</TableCell>
                  <TableCell align="center">{t("Yo'nalish")}</TableCell>
                  <TableCell>{t("Qayerga")}</TableCell>
                  <TableCell>{t("Summa")}</TableCell>
                  <TableCell>{t("Izoh")}</TableCell>
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
                    <TableCell>{formatDateValue(transfer.transferDate)}</TableCell>
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
                      <Typography variant="subtitle2">{t("Rate: {{value}}", { value: transfer.rate })}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {transfer.fromCurrency} → {transfer.toCurrency}
                      </Typography>
                    </TableCell>
                    <TableCell>{transfer.note || t("Izoh yo'q")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <EmptyState
            title={t("Transferlar hali yo'q")}
            message={t("Cross-account yoki cross-currency o'tkazma qilganingizdan so'ng, u shu jadvalda alohida ko‘rinadi.")}
          />
        )}
      </SectionCard>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>{t("Yangi transfer")}</DialogTitle>
          <DialogContent>
            <VoiceFormNotice />
            <Stack spacing={2} sx={{ pt: 1 }}>
              <VoiceField
                select
                label={t("Qayerdan")}
                value={formData.fromAccountId}
                voiceType="select"
                voiceOptions={accounts.map((account) => ({
                  value: String(account.id),
                  label: account.name,
                  aliases: [account.name]
                }))}
                onValueChange={(nextValue) => setFormData((previous) => ({ ...previous, fromAccountId: nextValue }))}
              >
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={String(account.id)}>
                    {account.name} • {formatMoney(account.currentBalance, account.currency)}
                  </MenuItem>
                ))}
              </VoiceField>
              <VoiceField
                select
                label={t("Qayerga")}
                value={formData.toAccountId}
                voiceType="select"
                voiceOptions={accounts.map((account) => ({
                  value: String(account.id),
                  label: account.name,
                  aliases: [account.name]
                }))}
                onValueChange={(nextValue) => setFormData((previous) => ({ ...previous, toAccountId: nextValue }))}
              >
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={String(account.id)}>
                    {account.name} • {formatMoney(account.currentBalance, account.currency)}
                  </MenuItem>
                ))}
              </VoiceField>
              <VoiceField
                label={t("Jo'natiladigan summa")}
                type="number"
                voiceType="number"
                value={formData.fromAmount}
                onValueChange={(nextValue) => setFormData((previous) => ({ ...previous, fromAmount: nextValue }))}
              />
              {sameCurrency ? (
                <TextField
                  label={t("Qabul qilinadigan summa")}
                  value={formData.fromAmount}
                  disabled
                  helperText={t("Bir xil valyuta uchun qabul qilinadigan summa jo'natilgan summaga teng.")}
                />
              ) : (
                <>
                  <VoiceField
                    label={t("Qabul qilinadigan summa")}
                    type="number"
                    voiceType="number"
                    value={formData.toAmount}
                    onValueChange={(nextValue) => setFormData((previous) => ({ ...previous, toAmount: nextValue }))}
                  />
                  <VoiceField
                    label={t("Valyuta kursi")}
                    type="number"
                    voiceType="number"
                    value={formData.rate}
                    onValueChange={(nextValue) => setFormData((previous) => ({ ...previous, rate: nextValue }))}
                    helperText={fromAccount && toAccount ? `${fromAccount.currency} → ${toAccount.currency}` : t("Valyutani tanlang")}
                  />
                </>
              )}
              <VoiceField
                type="date"
                label={t("Sana")}
                voiceType="date"
                value={formData.transferDate}
                onValueChange={(nextValue) => setFormData((previous) => ({ ...previous, transferDate: nextValue }))}
                InputLabelProps={{ shrink: true }}
              />
              <VoiceField
                label={t("Izoh")}
                multiline
                minRows={3}
                voiceAppend
                value={formData.note}
                onValueChange={(nextValue) => setFormData((previous) => ({ ...previous, note: nextValue }))}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClose}>{t("Bekor qilish")}</Button>
            <Button type="submit" variant="contained" disabled={Boolean(busyAction)}>
              {t("Saqlash")}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
