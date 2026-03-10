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
import {
  Add,
  CheckCircleOutline,
  DeleteOutline
} from "@mui/icons-material";
import { CurrencyStack, EmptyState, PageHeader, SectionCard } from "../components/ui-kit";
import { VoiceField, VoiceFormNotice } from "../components/voice-input";
import { useFinance } from "../finance/finance-context";
import { useI18n } from "../i18n/i18n-context";
import { formatDateValue, formatMoney } from "../lib/finance-utils";

const currencies = ["UZS", "USD", "EUR", "RUB"];
const emptyDebt = {
  type: "DEBT",
  counterparty: "",
  amount: "",
  currency: "UZS",
  openedOn: new Date().toISOString().slice(0, 10),
  dueDate: "",
  status: "OPEN",
  note: ""
};

function summarizeByCurrency(items, key) {
  const buckets = {};
  items.forEach((item) => {
    buckets[item.currency] = (buckets[item.currency] || 0) + Number(item[key] || 0);
  });

  return Object.entries(buckets).map(([currency, amount]) => ({ currency, amount }));
}

export default function DebtsPage() {
  const theme = useTheme();
  const { t } = useI18n();
  const { debts, busyAction, createDebt, updateDebt, deleteDebt } = useFinance();
  const [tab, setTab] = useState("DEBT");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(emptyDebt);

  const visibleDebts = debts
    .filter((item) => item.type === tab)
    .sort((left, right) => right.openedOn.localeCompare(left.openedOn) || right.id - left.id);
  const openDebts = visibleDebts.filter((item) => item.status === "OPEN");
  const closedDebts = visibleDebts.filter((item) => item.status === "CLOSED");
  const currencyTotals = summarizeByCurrency(openDebts, "amount");

  function handleOpen(nextType) {
    setTab(nextType);
    setFormData({ ...emptyDebt, type: nextType });
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    setFormData(emptyDebt);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.counterparty.trim() || !formData.amount) {
      return;
    }

    await createDebt(formData);
    handleClose();
  }

  async function markClosed(item) {
    await updateDebt(item.id, {
      ...item,
      status: item.status === "OPEN" ? "CLOSED" : "OPEN"
    });
  }

  async function removeDebt(id) {
    await deleteDebt(id);
  }

  return (
    <Box>
      <PageHeader
        eyebrow={t("Liabilities")}
        title={t("Qarzlar va haqdorliklar")}
        subtitle={t("Kimga qarzdorligingizni va kim sizga qaytarishi kerakligini bir xil workflow bilan kuzating.")}
        action={
          <Stack direction="row" spacing={1}>
            <Button color="warning" variant="contained" startIcon={<Add />} onClick={() => handleOpen("DEBT")}>
              {t("Qarz qo'shish")}
            </Button>
            <Button color="success" variant="contained" startIcon={<Add />} onClick={() => handleOpen("RECEIVABLE")}>
              {t("Haqdorlik qo'shish")}
            </Button>
          </Stack>
        }
      />

      <SectionCard
        title={t("Ochiq pozitsiyalar")}
        subtitle={tab === "DEBT" ? t("Siz qaytarishingiz kerak bo'lgan yozuvlar.") : t("Sizga qaytishi kerak bo'lgan yozuvlar.")}
        action={
          <Tabs value={tab} onChange={(_, value) => setTab(value)}>
            <Tab value="DEBT" label={t("Mening qarzim")} />
            <Tab value="RECEIVABLE" label={t("Menga qaytishi kerak")} />
          </Tabs>
        }
      >
        <Stack spacing={2.5}>
          <CurrencyStack items={currencyTotals} tone={tab === "DEBT" ? "error" : "success"} emptyLabel={t("Ochiq yozuv yo'q")} />

          {visibleDebts.length ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("Kontragent")}</TableCell>
                    <TableCell>{t("Summa")}</TableCell>
                    <TableCell>{t("Ochilgan sana")}</TableCell>
                    <TableCell>{t("Muddat")}</TableCell>
                    <TableCell>{t("Holat")}</TableCell>
                    <TableCell>{t("Izoh")}</TableCell>
                    <TableCell align="right">{t("Amallar")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...openDebts, ...closedDebts].map((item) => (
                    <TableRow
                      key={item.id}
                      hover
                      sx={{
                        opacity: item.status === "CLOSED" ? 0.62 : 1,
                        "&:nth-of-type(odd)": {
                          backgroundColor: alpha(theme.palette.background.default, 0.42)
                        }
                      }}
                    >
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {item.counterparty}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatMoney(item.amount, item.currency)}</TableCell>
                      <TableCell>{formatDateValue(item.openedOn)}</TableCell>
                      <TableCell>{item.dueDate ? formatDateValue(item.dueDate) : t("Belgilanmagan")}</TableCell>
                      <TableCell>
                        <Chip label={item.status === "OPEN" ? t("Ochiq") : t("Yopilgan")} color={item.status === "OPEN" ? "warning" : "success"} />
                      </TableCell>
                      <TableCell>{item.note || t("Izoh yo'q")}</TableCell>
                      <TableCell align="right">
                        {item.status === "OPEN" ? (
                          <IconButton color="success" onClick={() => markClosed(item)}>
                            <CheckCircleOutline fontSize="small" />
                          </IconButton>
                        ) : null}
                        <IconButton color="error" onClick={() => removeDebt(item.id)}>
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <EmptyState
              title={t("Qarz yozuvlari yo'q")}
              message={t("Yuqoridagi tugmalar orqali yangi qarz yoki receivable qo‘shing. Status keyin shu yerda kuzatiladi.")}
            />
          )}
        </Stack>
      </SectionCard>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>{formData.type === "DEBT" ? t("Yangi qarz") : t("Yangi haqdorlik")}</DialogTitle>
          <DialogContent>
            <VoiceFormNotice />
            <Stack spacing={2} sx={{ pt: 1 }}>
              <VoiceField
                label={t("Kontragent")}
                value={formData.counterparty}
                onValueChange={(nextValue) => setFormData((previous) => ({ ...previous, counterparty: nextValue }))}
              />
              <VoiceField
                label={t("Summa")}
                type="number"
                voiceType="number"
                value={formData.amount}
                onValueChange={(nextValue) => setFormData((previous) => ({ ...previous, amount: nextValue }))}
              />
              <VoiceField
                select
                label={t("Valyuta")}
                value={formData.currency}
                voiceType="select"
                voiceOptions={currencies.map((currency) => ({ value: currency, label: currency }))}
                onValueChange={(nextValue) => setFormData((previous) => ({ ...previous, currency: nextValue }))}
              >
                {currencies.map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency}
                  </MenuItem>
                ))}
              </VoiceField>
              <VoiceField
                type="date"
                label={t("Ochilgan sana")}
                voiceType="date"
                value={formData.openedOn}
                onValueChange={(nextValue) => setFormData((previous) => ({ ...previous, openedOn: nextValue }))}
                InputLabelProps={{ shrink: true }}
              />
              <VoiceField
                type="date"
                label={t("Qaytarish muddati")}
                voiceType="date"
                value={formData.dueDate}
                onValueChange={(nextValue) => setFormData((previous) => ({ ...previous, dueDate: nextValue }))}
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
