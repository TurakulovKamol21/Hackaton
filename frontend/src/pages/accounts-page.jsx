import { useState } from "react";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import {
  Add,
  DeleteOutline,
  EditOutlined,
  Wallet
} from "@mui/icons-material";
import { EmptyState, PageHeader, SectionCard } from "../components/ui-kit";
import { VoiceField, VoiceFormNotice } from "../components/voice-input";
import { useFinance } from "../finance/finance-context";
import { useI18n } from "../i18n/i18n-context";
import { accountTypeLabel, formatMoney } from "../lib/finance-utils";

const accountTypes = ["BANK_ACCOUNT", "BANK_CARD", "CASH", "SAVINGS", "E_WALLET"];
const currencies = ["UZS", "USD", "EUR", "RUB"];

const emptyForm = {
  name: "",
  type: "BANK_CARD",
  currency: "UZS",
  initialBalance: "0"
};

export default function AccountsPage() {
  const theme = useTheme();
  const { t } = useI18n();
  const { accounts, busyAction, createAccount, updateAccount, deleteAccount } = useFinance();
  const [open, setOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  function handleCreate() {
    setEditingAccount(null);
    setFormData(emptyForm);
    setOpen(true);
  }

  function handleEdit(account) {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      currency: account.currency,
      initialBalance: String(account.initialBalance)
    });
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    setEditingAccount(null);
    setFormData(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    if (editingAccount) {
      await updateAccount(editingAccount.id, formData);
    } else {
      await createAccount(formData);
    }

    handleClose();
  }

  async function handleDelete(id) {
    await deleteAccount(id);
  }

  return (
    <Box>
      <PageHeader
        eyebrow={t("Accounts")}
        title={t("Hisoblar va kartalar")}
        subtitle={t("Kartalar, bank hisobraqamlari, naqd pul va elektron hamyonlarni app-card formatida boshqaring.")}
        action={
          <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>
            {t("Hisob qo'shish")}
          </Button>
        }
      />

      <SectionCard
        title={t("Portfolio")}
        subtitle={t("Joriy balans backenddagi barcha income, expense va transferlardan hosil qilinadi.")}
      >
        {accounts.length ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" },
              gap: 2
            }}
          >
            {accounts.map((account) => (
              <Box
                key={account.id}
                sx={{
                  p: 2.5,
                  borderRadius: 6,
                  background: `linear-gradient(160deg, ${alpha(theme.palette.primary.main, 0.14)} 0%, rgba(255,255,255,0.92) 62%)`,
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: `0 18px 44px ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 4,
                      display: "grid",
                      placeItems: "center",
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: "primary.main"
                    }}
                  >
                    <Wallet />
                  </Box>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton color="primary" onClick={() => handleEdit(account)}>
                      <EditOutlined fontSize="small" />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(account.id)}>
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>

                <Typography variant="h6" sx={{ mt: 2.5 }}>
                  {account.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {accountTypeLabel(account.type, t)}
                </Typography>

                <Typography variant="h4" sx={{ mt: 3 }}>
                  {formatMoney(account.currentBalance, account.currency)}
                </Typography>

                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 2 }}>
                  <Chip label={account.currency} color="primary" variant="outlined" />
                  <Chip
                    label={t("Start: {{value}}", { value: formatMoney(account.initialBalance, account.currency) })}
                    variant="outlined"
                  />
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <EmptyState
            title={t("Hisoblar hali kiritilmagan")}
            message={t("MVP demoda account qo‘shilgach, u avtomatik ravishda boshqa sahifalardagi selectlarda ham paydo bo‘ladi.")}
          />
        )}
      </SectionCard>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>{editingAccount ? t("Hisobni tahrirlash") : t("Yangi hisob qo'shish")}</DialogTitle>
          <DialogContent>
            <VoiceFormNotice />
            <Stack spacing={2} sx={{ pt: 1 }}>
              <VoiceField
                label={t("Nomi")}
                value={formData.name}
                onValueChange={(nextValue) => setFormData((previous) => ({ ...previous, name: nextValue }))}
              />
              <VoiceField
                select
                label={t("Turi")}
                value={formData.type}
                voiceType="select"
                voiceOptions={accountTypes.map((type) => ({
                  value: type,
                  label: accountTypeLabel(type, t)
                }))}
                onValueChange={(nextValue) => setFormData((previous) => ({ ...previous, type: nextValue }))}
              >
                {accountTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {accountTypeLabel(type, t)}
                  </MenuItem>
                ))}
              </VoiceField>
              <VoiceField
                select
                label={t("Valyuta")}
                value={formData.currency}
                voiceType="select"
                voiceOptions={currencies.map((currency) => ({ value: currency, label: currency }))}
                helperText={editingAccount ? t("Agar account tarixga ega bo‘lsa, currency o‘zgarishi bloklanadi.") : t("Boshlang‘ich valyuta tanlang.")}
                onValueChange={(nextValue) => setFormData((previous) => ({ ...previous, currency: nextValue }))}
              >
                {currencies.map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency}
                  </MenuItem>
                ))}
              </VoiceField>
              <VoiceField
                label={t("Boshlang'ich balans")}
                type="number"
                voiceType="number"
                value={formData.initialBalance}
                helperText={editingAccount && editingAccount.currentBalance !== editingAccount.initialBalance
                  ? t("Joriy balans: {{value}}", { value: formatMoney(editingAccount.currentBalance, editingAccount.currency) })
                  : t("Joriy balans tranzaksiya va transferlar bilan hisoblanadi.")}
                onValueChange={(nextValue) => setFormData((previous) => ({ ...previous, initialBalance: nextValue }))}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClose}>{t("Bekor qilish")}</Button>
            <Button type="submit" variant="contained" disabled={Boolean(busyAction)}>
              {editingAccount ? t("Saqlash") : t("Qo'shish")}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
