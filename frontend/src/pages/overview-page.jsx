import { useEffect, useState } from "react";
import {
  alpha,
  useTheme
} from "@mui/material/styles";
import {
  Box,
  Button,
  Chip,
  Divider,
  LinearProgress,
  MenuItem,
  Paper,
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
import { useNavigate } from "react-router-dom";
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
import { useI18n } from "../i18n/i18n-context";
import {
  accountTypeLabel,
  categoryLabel,
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
  const navigate = useNavigate();
  const { t } = useI18n();
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
  const emptyWorkspace = !accounts.length && !dashboard.calendarItems.length && !dashboard.balanceTotals.length;

  useEffect(() => {
    if (!trendCurrency && trendCurrencies[0]) {
      setTrendCurrency(trendCurrencies[0]);
    }
  }, [trendCurrencies, trendCurrency]);

  return (
    <Box>
      <PageHeader
        eyebrow={t("Fintech workspace")}
        title={t("Moliyaviy boshqaruv paneli")}
        subtitle={t("Bir oydagi balans, tushum, xarajat, budget va qarz holatini bitta app-screen ichida kuzating.")}
        action={!emptyWorkspace ? (
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Button variant="contained" onClick={() => navigate("/accounts")}>
              {t("Hisob qo'shish")}
            </Button>
            <Button variant="outlined" onClick={() => navigate("/transactions")}>
              {t("Tranzaksiya qo'shish")}
            </Button>
          </Stack>
        ) : null}
      />

      {emptyWorkspace ? (
        <Paper
          sx={{
            mb: 3,
            p: 3,
            borderRadius: "24px",
            boxShadow: `0 18px 48px ${alpha("#0f172a", 0.06)}`
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            spacing={2.5}
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Typography variant="h6">{t("Boshlash uchun qisqa yo‘l")}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.7, maxWidth: 720 }}>
                {t("Empty holatda dashboard sizni keyingi to‘g‘ri qadamga yo‘naltiradi: avval account, keyin tranzaksiya, so‘ng reja.")}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Button variant="contained" onClick={() => navigate("/accounts")}>
                {t("Hisob qo'shish")}
              </Button>
              <Button variant="outlined" onClick={() => navigate("/transactions")}>
                {t("Tranzaksiya qo'shish")}
              </Button>
            </Stack>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
              gap: 2
            }}
          >
            {[
              {
                title: t("1. Hisob yarating"),
                message: t("Avval karta, naqd pul yoki bank account qo‘shing. Barcha keyingi yozuvlar shu yerga bog‘lanadi."),
                action: () => navigate("/accounts")
              },
              {
                title: t("2. Birinchi yozuvni kiriting"),
                message: t("Income yoki expense qo‘shilgach, dashboard avtomatik ravishda trend va statistikani to‘ldiradi."),
                action: () => navigate("/transactions")
              },
              {
                title: t("3. Reja qo‘ying"),
                message: t("Byudjet yoki limit qo‘ysangiz, bu panel reja va faktni ko‘rsatib bera boshlaydi."),
                action: () => navigate("/budget")
              }
            ].map((item, index) => (
              <Box
                key={item.title}
                sx={{
                  p: 2.25,
                  borderRadius: "20px",
                  border: "1px solid",
                  borderColor: "divider",
                  background: `linear-gradient(160deg, ${alpha(
                    [theme.palette.primary.main, theme.palette.success.main, theme.palette.warning.main][index],
                    0.08
                  )} 0%, rgba(255,255,255,0.98) 62%)`
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, minHeight: 76 }}>
                  {item.message}
                </Typography>
                <Button variant="text" sx={{ mt: 1.25, px: 0 }} onClick={item.action}>
                  {t("Ochish")}
                </Button>
              </Box>
            ))}
          </Box>
        </Paper>
      ) : null}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" },
          gap: 2,
          mb: 3
        }}
      >
        <MetricCard
          title={t("Umumiy balans")}
          value={netBalances[0] ? compactMoney(netBalances[0].amount, netBalances[0].currency) : "0"}
          caption={t("Bir nechta valyuta bo‘lsa, ular alohida ko‘rsatiladi.")}
          accent="#2457f5"
          icon={<AccountBalanceWallet />}
          footer={<CurrencyStack items={netBalances} emptyLabel={t("Balans topilmadi")} />}
        />
        <MetricCard
          title={t("Oylik tushum")}
          value={
            dashboard.incomeTotals[0]
              ? compactMoney(dashboard.incomeTotals[0].amount, dashboard.incomeTotals[0].currency)
              : "0"
          }
          caption={t("Tanlangan oy bo‘yicha barcha income yozuvlari.")}
          accent="#1f9d55"
          icon={<NorthEast />}
          footer={<CurrencyStack items={dashboard.incomeTotals} tone="success" emptyLabel={t("Bu oy tushum yo'q")} />}
        />
        <MetricCard
          title={t("Oylik xarajat")}
          value={
            dashboard.expenseTotals[0]
              ? compactMoney(dashboard.expenseTotals[0].amount, dashboard.expenseTotals[0].currency)
              : "0"
          }
          caption={t("Asosiy chiqimlar tanlangan oy kesimida hisoblandi.")}
          accent="#d92d20"
          icon={<SouthWest />}
          footer={<CurrencyStack items={dashboard.expenseTotals} tone="error" emptyLabel={t("Bu oy xarajat yo'q")} />}
        />
        <MetricCard
          title={t("Qarz bosimi")}
          value={debtPressure[0] ? compactMoney(debtPressure[0].debt, debtPressure[0].currency) : "0"}
          caption={t("Ochiq qarz va haqdorliklar valyuta bo‘yicha ajratilgan.")}
          accent="#f08c00"
          icon={<Insights />}
          footer={
            <Stack spacing={1}>
              {debtPressure.length ? (
                debtPressure.map((item) => (
                  <Stack key={item.currency} direction="row" spacing={1} flexWrap="wrap">
                    <Chip label={t("Qarz: {{value}}", { value: formatMoney(item.debt, item.currency) })} color="warning" />
                    <Chip label={t("Haqdorlik: {{value}}", { value: formatMoney(item.receivable, item.currency) })} color="success" />
                  </Stack>
                ))
              ) : (
                <Typography color="text.secondary">{t("Ochiq qarz yozuvlari yo‘q")}</Typography>
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
          title={t("Trend monitor")}
          subtitle={t("Daromad va xarajatlarning vaqt bo‘yicha dinamikasi.")}
          action={
            trendCurrencies.length > 1 ? (
              <TextField
                select
                size="small"
                label={t("Valyuta")}
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
                    name={t("Tushum")}
                    strokeWidth={2.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke={theme.palette.error.main}
                    fillOpacity={1}
                    fill="url(#expenseGradient)"
                    name={t("Xarajat")}
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <EmptyState
              title={t("Trend uchun ma'lumot yetarli emas")}
              message={t("Tanlangan oy yoki granularlik bo‘yicha tranzaksiyalar qo‘shilgach, grafik shu yerda ko‘rinadi.")}
            />
          )}
        </SectionCard>

        <SectionCard title={t("Hisoblar snapshot")} subtitle={t("Har bir account bo‘yicha joriy balans holati.")}>
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
                        {accountTypeLabel(account.type, t)}
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
              title={t("Hisoblar topilmadi")}
              message={t("Birinchi karta yoki account qo‘shilgach, bu yerda balans kartalari ko‘rinadi.")}
            />
          )}
        </SectionCard>
      </Box>

      <SectionCard
        title={t("AI / rule-based insights")}
        subtitle={t("MVP uchun backend tomonda oddiy qoida asosida ishlab chiqilgan ogohlantirish va tavsiyalar.")}
      >
        {dashboard.insights?.length ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" },
              gap: 2
            }}
          >
            {dashboard.insights.map((insight) => (
              <Box
                key={`${insight.level}-${insight.title}`}
                sx={{
                  p: 2.25,
                  borderRadius: 5,
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor: alpha(
                    insight.level === "WARNING"
                      ? theme.palette.warning.main
                      : insight.level === "SUCCESS"
                        ? theme.palette.success.main
                        : theme.palette.primary.main,
                    0.08
                  )
                }}
              >
                <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="flex-start">
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {insight.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                      {insight.message}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={t(insight.level)}
                    color={
                      insight.level === "WARNING"
                        ? "warning"
                        : insight.level === "SUCCESS"
                          ? "success"
                          : "primary"
                    }
                  />
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <EmptyState
            title={t("Insight topilmadi")}
            message={t("Backend hozircha muhim anomaliya yoki tavsiya topmadi. Yangi activity bilan bu bo‘lim dinamik to‘ldiriladi.")}
          />
        )}
      </SectionCard>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "1fr 1fr" },
          gap: 2
        }}
      >
        <SectionCard title={t("Budget pulse")} subtitle={t("Reja va fakt o‘rtasidagi farqni tez ko‘rish uchun.")}>
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
                          {item.label === "Monthly income target" ? t("Monthly income target") : categoryLabel(item.label, t)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.type === "INCOME_TARGET" ? t("Daromad rejasi") : t("Kategoriya limiti")}
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
                        {t("Reja: {{value}}", { value: formatMoney(item.budgeted, item.currency) })}
                      </Typography>
                      <Typography variant="caption" color={overBudget ? "error.main" : "text.secondary"}>
                        {t("Delta: {{value}}", { value: formatMoney(item.delta, item.currency) })}
                      </Typography>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <EmptyState
              title={t("Byudjet hali tuzilmagan")}
              message={t("Budget sahifasida income target yoki category limit qo‘shib, reja va fakt monitoringini faollashtiring.")}
            />
          )}
        </SectionCard>

        <SectionCard title={t("Calendar stream")} subtitle={t("So‘nggi activity timeline: tushum, xarajat va transferlar.")}>
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
                      <Chip label={transactionTypeLabel(item.kind, t)} color={kindColor(item.kind)} size="small" />
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
              title={t("Calendar view bo‘sh")}
              message={t("Tanlangan oy uchun tranzaksiya yoki transferlar qo‘shilgach, kunlik oqim shu yerda chiqadi.")}
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
