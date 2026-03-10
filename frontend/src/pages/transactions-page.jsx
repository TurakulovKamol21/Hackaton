import { useEffect, useState } from "react";
import {
  alpha,
  useTheme
} from "@mui/material/styles";
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
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { Add, DeleteOutline, EditOutlined, NorthEast, SouthWest } from "@mui/icons-material";
import { EmptyState, MetricCard, PageHeader, SectionCard } from "../components/ui-kit";
import { VoiceField, VoiceFormNotice } from "../components/voice-input";
import { useFinance } from "../finance/finance-context";
import { useI18n } from "../i18n/i18n-context";
import { categoryLabel, formatDateValue, formatMoney, sumNumeric } from "../lib/finance-utils";

const initialForm = {
  type: "EXPENSE",
  amount: "",
  transactionDate: new Date().toISOString().slice(0, 10),
  title: "",
  note: "",
  categoryId: "",
  accountId: ""
};

export default function TransactionsPage() {
  const theme = useTheme();
  const { t } = useI18n();
  const {
    accounts,
    entries,
    expenseCategories,
    incomeCategories,
    busyAction,
    createEntry,
    updateEntry,
    deleteEntry
  } = useFinance();
  const [tab, setTab] = useState("EXPENSE");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const categories = tab === "EXPENSE" ? expenseCategories : incomeCategories;
  const visibleEntries = entries
    .filter((entry) => entry.type === tab)
    .sort((left, right) => right.transactionDate.localeCompare(left.transactionDate) || right.id - left.id);
  const totalVisible = sumNumeric(visibleEntries, (item) => item.amount);

  useEffect(() => {
    if (!open || editingId) {
      return;
    }

    setFormData((previous) => ({
      ...previous,
      type: tab,
      categoryId: previous.categoryId || String(categories[0]?.id ?? ""),
      accountId: previous.accountId || String(accounts[0]?.id ?? "")
    }));
  }, [open, editingId, tab, categories, accounts]);

  function openCreate(nextType) {
    setTab(nextType);
    setEditingId(null);
    setFormData({
      ...initialForm,
      type: nextType,
      categoryId: String((nextType === "EXPENSE" ? expenseCategories : incomeCategories)[0]?.id ?? ""),
      accountId: String(accounts[0]?.id ?? "")
    });
    setOpen(true);
  }

  function openEdit(entry) {
    setEditingId(entry.id);
    setTab(entry.type);
    setFormData({
      type: entry.type,
      amount: String(entry.amount),
      transactionDate: entry.transactionDate,
      title: entry.title,
      note: entry.note ?? "",
      categoryId: String(entry.categoryId),
      accountId: String(entry.accountId)
    });
    setOpen(true);
  }

  function closeDialog() {
    setOpen(false);
    setEditingId(null);
    setFormData(initialForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.amount || !formData.title.trim() || !formData.categoryId || !formData.accountId) {
      return;
    }

    if (editingId) {
      await updateEntry(editingId, formData);
    } else {
      await createEntry(formData);
    }

    closeDialog();
  }

  async function handleDelete(id) {
    await deleteEntry(id);
  }

  return (
    <Box>
      <PageHeader
        eyebrow={t("Cashflow")}
        title={t("Tushum va xarajatlar")}
        subtitle={t("Barcha kirim-chiqimlarni bir formatda boshqaring: account, kategoriya va kundalik yozuvlar shu sahifada.")}
        action={
          <Stack direction="row" spacing={1}>
            <Button color="error" variant="contained" startIcon={<Add />} onClick={() => openCreate("EXPENSE")}>
              {t("Xarajat")}
            </Button>
            <Button color="success" variant="contained" startIcon={<Add />} onClick={() => openCreate("INCOME")}>
              {t("Tushum")}
            </Button>
          </Stack>
        }
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(3, minmax(0, 1fr))" },
          gap: 2,
          mb: 3
        }}
      >
        <MetricCard
          title={t("Tanlangan oqim")}
          value={formatMoney(totalVisible, visibleEntries[0]?.currency || accounts[0]?.currency || "UZS")}
          caption={tab === "EXPENSE" ? t("Aktiv tab bo‘yicha umumiy xarajat") : t("Aktiv tab bo‘yicha umumiy tushum")}
          icon={tab === "EXPENSE" ? <SouthWest /> : <NorthEast />}
          accent={tab === "EXPENSE" ? theme.palette.error.main : theme.palette.success.main}
        />
        <MetricCard
          title={t("Yozuvlar soni")}
          value={String(visibleEntries.length)}
          caption={t("Tanlangan oy kesimida bu turdagi tranzaksiyalar soni.")}
          icon={<Chip label={tab === "EXPENSE" ? "EXP" : "INC"} />}
          accent="#6d5efc"
        />
        <MetricCard
          title={t("Asosiy account")}
          value={accounts[0]?.name || t("Hisob yo'q")}
          caption={t("Yangi yozuvlar uchun default sifatida birinchi account tanlanadi.")}
          icon={<Chip label={accounts[0]?.currency || "CUR"} />}
          accent="#0f9d88"
        />
      </Box>

      <SectionCard
        title={t("Tranzaksiya registri")}
        subtitle={t("Edit va delete amallari shu jadvalda. Tab bo‘yicha darhol filterlanadi.")}
        action={
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            sx={{
              minHeight: "unset",
              "& .MuiTabs-indicator": {
                borderRadius: 999
              }
            }}
          >
            <Tab value="EXPENSE" label={t("Xarajatlar")} />
            <Tab value="INCOME" label={t("Tushumlar")} />
          </Tabs>
        }
        padded={false}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("Sana")}</TableCell>
                <TableCell>{t("Tavsif")}</TableCell>
                <TableCell>{t("Kategoriya")}</TableCell>
                <TableCell>{t("Hisoblar")}</TableCell>
                <TableCell align="right">{t("Summa")}</TableCell>
                <TableCell align="right">{t("Amallar")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleEntries.length ? (
                visibleEntries.map((entry) => (
                  <TableRow
                    key={entry.id}
                    hover
                    sx={{
                      "&:nth-of-type(odd)": {
                        backgroundColor: alpha(theme.palette.background.default, 0.4)
                      }
                    }}
                  >
                    <TableCell>{formatDateValue(entry.transactionDate)}</TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {entry.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {entry.note || t("Izoh berilmagan")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={categoryLabel(entry.categoryName, t)}
                        color={entry.type === "INCOME" ? "success" : "error"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{entry.accountName}</TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 800,
                          color: entry.type === "INCOME" ? "success.main" : "error.main"
                        }}
                      >
                        {entry.type === "INCOME" ? "+" : "-"}
                        {formatMoney(entry.amount, entry.currency)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => openEdit(entry)}>
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(entry.id)}>
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box sx={{ p: 3 }}>
                      <EmptyState
                        title={t("Tranzaksiya topilmadi")}
                        message={t("Bu tur uchun yozuvlar hali yo‘q. Yuqoridagi action tugmalaridan yangi income yoki expense yarating.")}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>

      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>{editingId ? t("Tranzaksiyani tahrirlash") : tab === "EXPENSE" ? t("Yangi xarajat") : t("Yangi tushum")}</DialogTitle>
          <DialogContent>
            <VoiceFormNotice />
            <Stack spacing={2} sx={{ pt: 1 }}>
              <VoiceField
                select
                label={t("Turi")}
                value={formData.type}
                voiceType="select"
                voiceOptions={[
                  { value: "EXPENSE", label: t("Xarajat") },
                  { value: "INCOME", label: t("Tushum") }
                ]}
                onValueChange={(nextType) => {
                  const nextCategories = nextType === "EXPENSE" ? expenseCategories : incomeCategories;
                  setTab(nextType);
                  setFormData((previous) => ({
                    ...previous,
                    type: nextType,
                    categoryId: String(nextCategories[0]?.id ?? "")
                  }));
                }}
              >
                <MenuItem value="EXPENSE">{t("Xarajat")}</MenuItem>
                <MenuItem value="INCOME">{t("Tushum")}</MenuItem>
              </VoiceField>
              <VoiceField
                label={t("Summa")}
                type="number"
                voiceType="number"
                value={formData.amount}
                onValueChange={(nextValue) => setFormData((previous) => ({ ...previous, amount: nextValue }))}
              />
              <VoiceField
                type="date"
                label={t("Sana")}
                voiceType="date"
                value={formData.transactionDate}
                onValueChange={(nextValue) => setFormData((previous) => ({ ...previous, transactionDate: nextValue }))}
                InputLabelProps={{ shrink: true }}
              />
              <VoiceField
                label={t("Sarlavha")}
                value={formData.title}
                onValueChange={(nextValue) => setFormData((previous) => ({ ...previous, title: nextValue }))}
              />
              <VoiceField
                label={t("Izoh")}
                multiline
                minRows={3}
                voiceAppend
                value={formData.note}
                onValueChange={(nextValue) => setFormData((previous) => ({ ...previous, note: nextValue }))}
              />
              <VoiceField
                select
                label={t("Kategoriya")}
                value={formData.categoryId}
                voiceType="select"
                voiceOptions={(formData.type === "EXPENSE" ? expenseCategories : incomeCategories).map((category) => ({
                  value: String(category.id),
                  label: categoryLabel(category.name, t)
                }))}
                onValueChange={(nextValue) => setFormData((previous) => ({ ...previous, categoryId: nextValue }))}
              >
                {(formData.type === "EXPENSE" ? expenseCategories : incomeCategories).map((category) => (
                  <MenuItem key={category.id} value={String(category.id)}>
                    {categoryLabel(category.name, t)}
                  </MenuItem>
                ))}
              </VoiceField>
              <VoiceField
                select
                label={t("Hisoblar")}
                value={formData.accountId}
                voiceType="select"
                voiceOptions={accounts.map((account) => ({
                  value: String(account.id),
                  label: account.name,
                  aliases: [account.name]
                }))}
                onValueChange={(nextValue) => setFormData((previous) => ({ ...previous, accountId: nextValue }))}
              >
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={String(account.id)}>
                    {account.name} • {formatMoney(account.currentBalance, account.currency)}
                  </MenuItem>
                ))}
              </VoiceField>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={closeDialog}>{t("Bekor qilish")}</Button>
            <Button type="submit" variant="contained" disabled={Boolean(busyAction)}>
              {editingId ? t("Saqlash") : t("Qo'shish")}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
