import { useState } from "react";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { Add, DeleteOutline } from "@mui/icons-material";
import { EmptyState, PageHeader, SectionCard } from "../components/ui-kit";
import { useFinance } from "../finance/finance-context";
import { formatMoney, percent } from "../lib/finance-utils";

const budgetForm = {
  month: "",
  type: "EXPENSE_LIMIT",
  amount: "",
  currency: "UZS",
  categoryId: ""
};

export default function BudgetPage() {
  const theme = useTheme();
  const { budgets, dashboard, selectedMonth, expenseCategories, busyAction, saveBudget, deleteBudget } = useFinance();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    ...budgetForm,
    month: selectedMonth,
    categoryId: String(expenseCategories[0]?.id ?? "")
  });

  const comparisonMap = Object.fromEntries(
    dashboard.budgetComparisons.map((item) => [`${item.type}-${item.label}-${item.currency}`, item])
  );

  function openDialog(type) {
    setFormData({
      ...budgetForm,
      month: selectedMonth,
      type,
      currency: "UZS",
      categoryId: String(expenseCategories[0]?.id ?? "")
    });
    setOpen(true);
  }

  function closeDialog() {
    setOpen(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.amount) {
      return;
    }

    await saveBudget(formData);
    closeDialog();
  }

  async function handleDelete(id) {
    await deleteBudget(id);
  }

  const incomeBudgets = budgets.filter((budget) => budget.type === "INCOME_TARGET");
  const expenseBudgets = budgets.filter((budget) => budget.type === "EXPENSE_LIMIT");

  return (
    <Box>
      <PageHeader
        eyebrow="Planning"
        title="Byudjet va rejalashtirish"
        subtitle="Income target va category-based expense limitlarni shu sahifada boshqaring."
        action={
          <Stack direction="row" spacing={1}>
            <Button color="warning" variant="contained" startIcon={<Add />} onClick={() => openDialog("EXPENSE_LIMIT")}>
              Xarajat limiti
            </Button>
            <Button color="success" variant="contained" startIcon={<Add />} onClick={() => openDialog("INCOME_TARGET")}>
              Daromad rejasi
            </Button>
          </Stack>
        }
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "1fr 1fr" },
          gap: 2
        }}
      >
        <SectionCard title="Expense limitlar" subtitle="Kategoriya bo‘yicha oy ichidagi sarf limitlari.">
          {expenseBudgets.length ? (
            <Stack spacing={2}>
              {expenseBudgets.map((budget) => {
                const comparison = comparisonMap[`EXPENSE_LIMIT-${budget.categoryName}-${budget.currency}`];
                const progress = percent(comparison?.actual, budget.amount);
                const over = Number(comparison?.delta || 0) > 0;

                return (
                  <Box
                    key={budget.id}
                    sx={{
                      p: 2.25,
                      borderRadius: 5,
                      border: "1px solid",
                      borderColor: "divider",
                      backgroundColor: alpha(theme.palette.background.default, 0.52)
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {budget.categoryName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {budget.month}
                        </Typography>
                      </Box>
                      <IconButton color="error" onClick={() => handleDelete(budget.id)}>
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Typography variant="h6" sx={{ mt: 2 }}>
                      {formatMoney(comparison?.actual || 0, budget.currency)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Limit: {formatMoney(budget.amount, budget.currency)}
                    </Typography>
                    <LinearProgress
                      value={progress}
                      variant="determinate"
                      color={over ? "error" : "primary"}
                      sx={{ mt: 1.5, height: 8, borderRadius: 999 }}
                    />
                    <Typography variant="caption" color={over ? "error.main" : "text.secondary"} sx={{ mt: 1, display: "block" }}>
                      {over
                        ? `Reja oshdi: ${formatMoney(comparison?.delta || 0, budget.currency)}`
                        : `Zaxira: ${formatMoney(Math.max(Number(budget.amount) - Number(comparison?.actual || 0), 0), budget.currency)}`}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <EmptyState
              title="Expense limit yo'q"
              message="Kategoriya bo‘yicha sarf limiti qo‘shilsa, bu yerda progress kartalari chiqadi."
            />
          )}
        </SectionCard>

        <SectionCard title="Income targetlar" subtitle="Oy bo‘yicha daromad rejalari va bajarilish holati.">
          {incomeBudgets.length ? (
            <Stack spacing={2}>
              {incomeBudgets.map((budget) => {
                const comparison = comparisonMap[`INCOME_TARGET-Monthly income target-${budget.currency}`];
                const progress = percent(comparison?.actual, budget.amount);

                return (
                  <Box
                    key={budget.id}
                    sx={{
                      p: 2.25,
                      borderRadius: 5,
                      border: "1px solid",
                      borderColor: "divider",
                      background: `linear-gradient(155deg, ${alpha(theme.palette.success.main, 0.14)} 0%, rgba(255,255,255,0.94) 64%)`
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          Monthly income target
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {budget.month}
                        </Typography>
                      </Box>
                      <IconButton color="error" onClick={() => handleDelete(budget.id)}>
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Typography variant="h6" sx={{ mt: 2 }}>
                      {formatMoney(comparison?.actual || 0, budget.currency)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Target: {formatMoney(budget.amount, budget.currency)}
                    </Typography>
                    <LinearProgress
                      value={progress}
                      variant="determinate"
                      color="success"
                      sx={{ mt: 1.5, height: 8, borderRadius: 999 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                      Delta: {formatMoney(comparison?.delta || 0, budget.currency)}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <EmptyState
              title="Income target belgilanmagan"
              message="Bu oy bo‘yicha umumiy daromad maqsadini kiritsangiz, backend reja va faktni avtomatik solishtiradi."
            />
          )}
        </SectionCard>
      </Box>

      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>{formData.type === "INCOME_TARGET" ? "Daromad rejasi" : "Xarajat limiti"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                type="month"
                label="Oy"
                value={formData.month}
                onChange={(event) => setFormData((previous) => ({ ...previous, month: event.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                select
                label="Turi"
                value={formData.type}
                onChange={(event) => setFormData((previous) => ({ ...previous, type: event.target.value }))}
              >
                <MenuItem value="EXPENSE_LIMIT">Xarajat limiti</MenuItem>
                <MenuItem value="INCOME_TARGET">Daromad rejasi</MenuItem>
              </TextField>
              <TextField
                label="Summa"
                type="number"
                value={formData.amount}
                onChange={(event) => setFormData((previous) => ({ ...previous, amount: event.target.value }))}
              />
              <TextField
                select
                label="Valyuta"
                value={formData.currency}
                onChange={(event) => setFormData((previous) => ({ ...previous, currency: event.target.value }))}
              >
                {["UZS", "USD", "EUR", "RUB"].map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency}
                  </MenuItem>
                ))}
              </TextField>
              {formData.type === "EXPENSE_LIMIT" ? (
                <TextField
                  select
                  label="Kategoriya"
                  value={formData.categoryId}
                  onChange={(event) => setFormData((previous) => ({ ...previous, categoryId: event.target.value }))}
                >
                  {expenseCategories.map((category) => (
                    <MenuItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
              ) : null}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={closeDialog}>Bekor qilish</Button>
            <Button type="submit" variant="contained" disabled={Boolean(busyAction)}>
              Saqlash
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
