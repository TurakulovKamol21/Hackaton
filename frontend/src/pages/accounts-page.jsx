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
import { useFinance } from "../finance/finance-context";
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
        eyebrow="Accounts"
        title="Hisoblar va kartalar"
        subtitle="Kartalar, bank hisobraqamlari, naqd pul va elektron hamyonlarni app-card formatida boshqaring."
        action={
          <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>
            Hisob qo'shish
          </Button>
        }
      />

      <SectionCard
        title="Portfolio"
        subtitle="Joriy balans backenddagi barcha income, expense va transferlardan hosil qilinadi."
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
                  {accountTypeLabel(account.type)}
                </Typography>

                <Typography variant="h4" sx={{ mt: 3 }}>
                  {formatMoney(account.currentBalance, account.currency)}
                </Typography>

                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 2 }}>
                  <Chip label={account.currency} color="primary" variant="outlined" />
                  <Chip
                    label={`Start: ${formatMoney(account.initialBalance, account.currency)}`}
                    variant="outlined"
                  />
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <EmptyState
            title="Hisoblar hali kiritilmagan"
            message="MVP demoda account qo‘shilgach, u avtomatik ravishda boshqa sahifalardagi selectlarda ham paydo bo‘ladi."
          />
        )}
      </SectionCard>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>{editingAccount ? "Hisobni tahrirlash" : "Yangi hisob qo'shish"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Nomi"
                value={formData.name}
                onChange={(event) => setFormData((previous) => ({ ...previous, name: event.target.value }))}
              />
              <TextField
                select
                label="Turi"
                value={formData.type}
                onChange={(event) => setFormData((previous) => ({ ...previous, type: event.target.value }))}
              >
                {accountTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {accountTypeLabel(type)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Valyuta"
                value={formData.currency}
                helperText={editingAccount ? "Agar account tarixga ega bo‘lsa, currency o‘zgarishi bloklanadi." : "Boshlang‘ich valyuta tanlang."}
                onChange={(event) => setFormData((previous) => ({ ...previous, currency: event.target.value }))}
              >
                {currencies.map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Boshlang'ich balans"
                type="number"
                value={formData.initialBalance}
                helperText={editingAccount && editingAccount.currentBalance !== editingAccount.initialBalance
                  ? `Joriy balans: ${formatMoney(editingAccount.currentBalance, editingAccount.currency)}`
                  : "Joriy balans tranzaksiya va transferlar bilan hisoblanadi."}
                onChange={(event) => setFormData((previous) => ({ ...previous, initialBalance: event.target.value }))}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClose}>Bekor qilish</Button>
            <Button type="submit" variant="contained" disabled={Boolean(busyAction)}>
              {editingAccount ? "Saqlash" : "Qo'shish"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
