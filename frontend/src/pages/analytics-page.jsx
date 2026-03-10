import { useEffect, useState } from "react";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Box,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { EmptyState, PageHeader, SectionCard } from "../components/ui-kit";
import { useFinance } from "../finance/finance-context";
import { useI18n } from "../i18n/i18n-context";
import { categoryLabel, formatMoney } from "../lib/finance-utils";

const COLORS = ["#2457f5", "#0f9d88", "#f08c00", "#d92d20", "#7c3aed", "#2563eb", "#0ea5e9", "#22c55e"];

export default function AnalyticsPage() {
  const theme = useTheme();
  const { t } = useI18n();
  const { dashboard } = useFinance();
  const [currency, setCurrency] = useState("");

  const currencies = [...new Set([
    ...dashboard.trends.map((item) => item.currency),
    ...dashboard.categoryStats.map((item) => item.currency)
  ])];
  const activeCurrency = currencies.includes(currency) ? currency : currencies[0] || "UZS";

  const expenseStats = dashboard.categoryStats
    .filter((item) => item.type === "EXPENSE" && item.currency === activeCurrency)
    .map((item) => ({ name: categoryLabel(item.category, t), value: Number(item.total) }))
    .sort((left, right) => right.value - left.value);

  const incomeStats = dashboard.categoryStats
    .filter((item) => item.type === "INCOME" && item.currency === activeCurrency)
    .map((item) => ({ name: categoryLabel(item.category, t), value: Number(item.total) }))
    .sort((left, right) => right.value - left.value);

  const trendRows = dashboard.trends
    .filter((item) => item.currency === activeCurrency)
    .map((item) => ({
      label: item.periodLabel,
      income: Number(item.income),
      expense: Number(item.expense),
      net: Number(item.net)
    }));

  useEffect(() => {
    if (!currency && currencies[0]) {
      setCurrency(currencies[0]);
    }
  }, [currencies, currency]);

  return (
    <Box>
      <PageHeader
        eyebrow={t("Analytics")}
        title={t("Vizual tahlil paneli")}
        subtitle={t("Kategoriya kesimi, pul oqimi va net natijani grafiklar orqali ko‘ring.")}
        action={
          currencies.length ? (
            <TextField
              select
              size="small"
              label={t("Valyuta")}
              value={activeCurrency}
              onChange={(event) => setCurrency(event.target.value)}
              sx={{ minWidth: 140 }}
            >
              {currencies.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
          ) : null
        }
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "1.2fr 0.8fr" },
          gap: 2,
          mb: 2
        }}
      >
        <SectionCard title={t("Cashflow compare")} subtitle={t("Tushum va xarajatning period bo‘yicha taqqoslanishi.")}>
          {trendRows.length ? (
            <Box sx={{ height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendRows}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.text.primary, 0.08)} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => formatMoney(value, activeCurrency)} />
                  <Legend />
                  <Bar dataKey="income" fill={theme.palette.success.main} radius={[10, 10, 0, 0]} name={t("Tushum")} />
                  <Bar dataKey="expense" fill={theme.palette.error.main} radius={[10, 10, 0, 0]} name={t("Xarajat")} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <EmptyState
              title={t("Trend ma'lumotlari yo'q")}
              message={t("Tanlangan currency bo‘yicha yetarli activity bo‘lmasa, grafik bo‘sh qoladi.")}
            />
          )}
        </SectionCard>

        <SectionCard title={t("Net story")} subtitle={t("Period bo‘yicha sof natija.")}>
          {trendRows.length ? (
            <Stack spacing={1.25}>
              {trendRows.map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    p: 1.6,
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: alpha(
                      item.net >= 0 ? theme.palette.success.main : theme.palette.error.main,
                      0.08
                    )
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {item.label}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 800, color: item.net >= 0 ? "success.main" : "error.main" }}
                    >
                      {formatMoney(item.net, activeCurrency)}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : (
            <EmptyState title={t("Net story bo'sh")} message={t("Grafik paydo bo‘lishi uchun shu oy activity kiritilishi kerak.")} />
          )}
        </SectionCard>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "1fr 1fr" },
          gap: 2
        }}
      >
        <SectionCard title={t("Expense mix")} subtitle={t("Xarajatlarning kategoriya bo‘yicha ulushi.")}>
          {expenseStats.length ? (
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseStats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={94}
                    innerRadius={54}
                    paddingAngle={3}
                  >
                    {expenseStats.map((item, index) => (
                      <Cell key={item.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatMoney(value, activeCurrency)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <EmptyState title={t("Expense breakdown yo'q")} message={t("Expense kategoriyalari paydo bo‘lishi uchun tranzaksiya qo‘shing.")} />
          )}
        </SectionCard>

        <SectionCard title={t("Income mix")} subtitle={t("Daromad manbalari kesimida tarkib.")}>
          {incomeStats.length ? (
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeStats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={94}
                    innerRadius={54}
                    paddingAngle={3}
                  >
                    {incomeStats.map((item, index) => (
                      <Cell key={item.name} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatMoney(value, activeCurrency)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <EmptyState title={t("Income breakdown yo'q")} message={t("Income kategoriyalari paydo bo‘lishi uchun yozuv kiriting.")} />
          )}
        </SectionCard>
      </Box>
    </Box>
  );
}
