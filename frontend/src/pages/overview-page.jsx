import { useEffect, useState } from "react";
import {
  alpha,
  useTheme
} from "@mui/material/styles";
import {
  Box,
  Chip,
  Divider,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import {
  AccountBalanceWallet,
  CalendarMonth,
  Insights,
  NorthEast,
  SouthWest
} from "@mui/icons-material";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { PageHeader, MetricCard, SectionCard, CurrencyStack, EmptyState } from "../components/ui-kit";
import { useFinance } from "../finance/finance-context";
import {
  compactMoney,
  formatMoney,
  percent,
  transactionTypeLabel
} from "../lib/finance-utils";

function kindColor(kind) {
  return {
    INCOME: "success",
    EXPENSE: "error",
    TRANSFER: "warning"
  }[kind] || "default";
}

export default function OverviewPage() {
  const theme = useTheme();
  const { dashboard, accounts, loading } = useFinance();
  const [trendCurrency, setTrendCurrency] = useState("");

  const trendCurrencies = [...new Set(dashboard.trends.map((item) => item.currency))];
  const activeTrendCurrency = trendCurrencies.includes(trendCurrency)
    ? trendCurrency
    : trendCurrencies[0] || dashboard.balanceTotals[0]?.currency || "UZS";
  const visibleTrends = dashboard.trends.filter((item) => item.currency === activeTrendCurrency);
  const netBalances = dashboard.balanceTotals;
  const debtPressure = dashboard.debtSummaries;
  const budgetRows = dashboard.budgetComparisons.slice(0, 4);

  useEffect(() => {
    if (!trendCurrency && trendCurrencies[0]) {
      setTrendCurrency(trendCurrencies[0]);
    }
  }, [trendCurrencies, trendCurrency]);

  return (
    <Box>
      <PageHeader
        eyebrow="Fintech workspace"
        title="Moliyaviy boshqaruv paneli"
        subtitle="Bir oydagi balans, tushum, xarajat, budget va qarz holatini bitta app-screen ichida kuzating."
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" },
          gap: 2,
          mb: 3
        }}
      >
        <MetricCard
          title="Umumiy balans"
          value={netBalances[0] ? compactMoney(netBalances[0].amount, netBalances[0].currency) : "0"}
          caption="Bir nechta valyuta bo‘lsa, ular alohida ko‘rsatiladi."
          accent="#2457f5"
          icon={<AccountBalanceWallet />}
          footer={<CurrencyStack items={netBalances} emptyLabel="Balans topilmadi" />}
        />
        <MetricCard
          title="Oylik tushum"
          value={
            dashboard.incomeTotals[0]
              ? compactMoney(dashboard.incomeTotals[0].amount, dashboard.incomeTotals[0].currency)
              : "0"
          }
          caption="Tanlangan oy bo‘yicha barcha income yozuvlari."
          accent="#1f9d55"
          icon={<NorthEast />}
          footer={<CurrencyStack items={dashboard.incomeTotals} tone="success" emptyLabel="Bu oy tushum yo'q" />}
        />
        <MetricCard
          title="Oylik xarajat"
          value={
            dashboard.expenseTotals[0]
              ? compactMoney(dashboard.expenseTotals[0].amount, dashboard.expenseTotals[0].currency)
              : "0"
          }
          caption="Asosiy chiqimlar tanlangan oy kesimida hisoblandi."
          accent="#d92d20"
          icon={<SouthWest />}
          footer={<CurrencyStack items={dashboard.expenseTotals} tone="error" emptyLabel="Bu oy xarajat yo'q" />}
        />
        <MetricCard
          title="Qarz bosimi"
          value={debtPressure[0] ? compactMoney(debtPressure[0].debt, debtPressure[0].currency) : "0"}
          caption="Ochiq qarz va haqdorliklar valyuta bo‘yicha ajratilgan."
          accent="#f08c00"
          icon={<Insights />}
          footer={
            <Stack spacing={1}>
              {debtPressure.length ? (
                debtPressure.map((item) => (
                  <Stack key={item.currency} direction="row" spacing={1} flexWrap="wrap">
                    <Chip label={`Qarz: ${formatMoney(item.debt, item.currency)}`} color="warning" />
                    <Chip label={`Haqdorlik: ${formatMoney(item.receivable, item.currency)}`} color="success" />
                  </Stack>
                ))
              ) : (
                <Typography color="text.secondary">Ochiq qarz yozuvlari yo‘q</Typography>
              )}
            </Stack>
          }
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "1.45fr 1fr" },
          gap: 2,
          mb: 3
        }}
      >
        <SectionCard
          title="Trend monitor"
          subtitle="Daromad va xarajatlarning vaqt bo‘yicha dinamikasi."
          action={
            trendCurrencies.length > 1 ? (
              <TextField
                select
                size="small"
                label="Valyuta"
                value={activeTrendCurrency}
                onChange={(event) => setTrendCurrency(event.target.value)}
                sx={{ minWidth: 132 }}
              >
                {trendCurrencies.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
            ) : null
          }
        >
          {visibleTrends.length ? (
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={visibleTrends}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.text.primary, 0.08)} />
                  <XAxis dataKey="periodLabel" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={74} />
                  <Tooltip
                    formatter={(value) => formatMoney(value, activeTrendCurrency)}
                    contentStyle={{ borderRadius: 16, borderColor: alpha(theme.palette.text.primary, 0.08) }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke={theme.palette.success.main}
                    fillOpacity={1}
                    fill="url(#incomeGradient)"
                    name="Tushum"
                    strokeWidth={2.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke={theme.palette.error.main}
                    fillOpacity={1}
                    fill="url(#expenseGradient)"
                    name="Xarajat"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <EmptyState
              title="Trend uchun ma'lumot yetarli emas"
              message="Tanlangan oy yoki granularlik bo‘yicha tranzaksiyalar qo‘shilgach, grafik shu yerda ko‘rinadi."
            />
          )}
        </SectionCard>

        <SectionCard title="Hisoblar snapshot" subtitle="Har bir account bo‘yicha joriy balans holati.">
          {accounts.length ? (
            <Stack spacing={1.5}>
              {accounts.map((account) => (
                <Box
                  key={account.id}
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: alpha(theme.palette.background.default, 0.55)
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {account.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {account.type.replaceAll("_", " ")}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      {formatMoney(account.currentBalance, account.currency)}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : (
            <EmptyState
              title="Hisoblar topilmadi"
              message="Birinchi karta yoki account qo‘shilgach, bu yerda balans kartalari ko‘rinadi."
            />
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
        <SectionCard title="Budget pulse" subtitle="Reja va fakt o‘rtasidagi farqni tez ko‘rish uchun.">
          {budgetRows.length ? (
            <Stack spacing={2}>
              {budgetRows.map((item) => {
                const progress = percent(item.actual, item.budgeted);
                const overBudget = Number(item.delta) > 0;
                return (
                  <Box key={`${item.label}-${item.currency}`}>
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {item.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.type === "INCOME_TARGET" ? "Daromad rejasi" : "Kategoriya limiti"}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle2" color={overBudget ? "error.main" : "text.primary"}>
                        {formatMoney(item.actual, item.currency)}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      color={overBudget ? "error" : item.type === "INCOME_TARGET" ? "success" : "primary"}
                      sx={{ mt: 1.2, height: 8, borderRadius: 999 }}
                    />
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.8 }}>
                      <Typography variant="caption" color="text.secondary">
                        Reja: {formatMoney(item.budgeted, item.currency)}
                      </Typography>
                      <Typography variant="caption" color={overBudget ? "error.main" : "text.secondary"}>
                        Delta: {formatMoney(item.delta, item.currency)}
                      </Typography>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <EmptyState
              title="Byudjet hali tuzilmagan"
              message="Budget sahifasida income target yoki category limit qo‘shib, reja va fakt monitoringini faollashtiring."
            />
          )}
        </SectionCard>

        <SectionCard title="Calendar stream" subtitle="So‘nggi activity timeline: tushum, xarajat va transferlar.">
          {dashboard.calendarItems.length ? (
            <Stack spacing={1.4} divider={<Divider flexItem />}>
              {dashboard.calendarItems.slice(0, 8).map((item) => (
                <Stack key={`${item.date}-${item.title}-${item.amount}`} direction="row" spacing={1.5} alignItems="flex-start">
                  <Box
                    sx={{
                      mt: 0.2,
                      width: 42,
                      height: 42,
                      borderRadius: 3,
                      display: "grid",
                      placeItems: "center",
                      backgroundColor: alpha(theme.palette.primary.main, 0.08)
                    }}
                  >
                    <CalendarMonth fontSize="small" color="primary" />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start">
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.meta}
                        </Typography>
                      </Box>
                      <Chip label={transactionTypeLabel(item.kind)} color={kindColor(item.kind)} size="small" />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.75 }}>
                      <Typography variant="caption" color="text.secondary">
                        {item.date}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {formatMoney(item.amount, item.currency)}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              ))}
            </Stack>
          ) : (
            <EmptyState
              title="Calendar view bo‘sh"
              message="Tanlangan oy uchun tranzaksiya yoki transferlar qo‘shilgach, kunlik oqim shu yerda chiqadi."
            />
          )}
        </SectionCard>
      </Box>

      {loading ? (
        <LinearProgress sx={{ mt: 3, borderRadius: 999, height: 6 }} />
      ) : null}
    </Box>
  );
}
