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
import { format } from "date-fns";
import { CurrencyStack, EmptyState, PageHeader, SectionCard } from "../components/ui-kit";
import { useFinance } from "../finance/finance-context";
import { formatMoney } from "../lib/finance-utils";

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
        eyebrow="Liabilities"
        title="Qarzlar va haqdorliklar"
        subtitle="Kimga qarzdorligingizni va kim sizga qaytarishi kerakligini bir xil workflow bilan kuzating."
        action={
          <Stack direction="row" spacing={1}>
            <Button color="warning" variant="contained" startIcon={<Add />} onClick={() => handleOpen("DEBT")}>
              Qarz qo'shish
            </Button>
            <Button color="success" variant="contained" startIcon={<Add />} onClick={() => handleOpen("RECEIVABLE")}>
              Haqdorlik qo'shish
            </Button>
          </Stack>
        }
      />

      <SectionCard
        title="Ochiq pozitsiyalar"
        subtitle={tab === "DEBT" ? "Siz qaytarishingiz kerak bo'lgan yozuvlar." : "Sizga qaytishi kerak bo'lgan yozuvlar."}
        action={
          <Tabs value={tab} onChange={(_, value) => setTab(value)}>
            <Tab value="DEBT" label="Mening qarzim" />
            <Tab value="RECEIVABLE" label="Menga qaytadi" />
          </Tabs>
        }
      >
        <Stack spacing={2.5}>
          <CurrencyStack items={currencyTotals} tone={tab === "DEBT" ? "error" : "success"} emptyLabel="Ochiq yozuv yo'q" />

          {visibleDebts.length ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Kontragent</TableCell>
                    <TableCell>Summa</TableCell>
                    <TableCell>Ochilgan sana</TableCell>
                    <TableCell>Muddat</TableCell>
                    <TableCell>Holat</TableCell>
                    <TableCell>Izoh</TableCell>
                    <TableCell align="right">Amallar</TableCell>
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
                      <TableCell>{format(new Date(item.openedOn), "dd.MM.yyyy")}</TableCell>
                      <TableCell>{item.dueDate ? format(new Date(item.dueDate), "dd.MM.yyyy") : "Belgilanmagan"}</TableCell>
                      <TableCell>
                        <Chip label={item.status === "OPEN" ? "Ochiq" : "Yopilgan"} color={item.status === "OPEN" ? "warning" : "success"} />
                      </TableCell>
                      <TableCell>{item.note || "Izoh yo'q"}</TableCell>
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
              title="Qarz yozuvlari yo'q"
              message="Yuqoridagi tugmalar orqali yangi qarz yoki receivable qo‘shing. Status keyin shu yerda kuzatiladi."
            />
          )}
        </Stack>
      </SectionCard>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>{formData.type === "DEBT" ? "Yangi qarz" : "Yangi haqdorlik"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Kontragent"
                value={formData.counterparty}
                onChange={(event) => setFormData((previous) => ({ ...previous, counterparty: event.target.value }))}
              />
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
                {currencies.map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                type="date"
                label="Ochilgan sana"
                value={formData.openedOn}
                onChange={(event) => setFormData((previous) => ({ ...previous, openedOn: event.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="date"
                label="Qaytarish muddati"
                value={formData.dueDate}
                onChange={(event) => setFormData((previous) => ({ ...previous, dueDate: event.target.value }))}
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
