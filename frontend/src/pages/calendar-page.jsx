import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek
} from "date-fns";
import { alpha, useTheme } from "@mui/material/styles";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { EmptyState, PageHeader, SectionCard } from "../components/ui-kit";
import { useFinance } from "../finance/finance-context";
import { useI18n } from "../i18n/i18n-context";
import { formatDateValue, formatMoney, formatMonthValue, getWeekdayLabels, transactionTypeLabel } from "../lib/finance-utils";

function kindColor(kind) {
  return {
    INCOME: "success",
    EXPENSE: "error",
    TRANSFER: "warning"
  }[kind] || "default";
}

export default function CalendarPage() {
  const theme = useTheme();
  const { t } = useI18n();
  const { selectedMonth, dashboard } = useFinance();

  const monthDate = parseISO(`${selectedMonth}-01`);
  const gridStart = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const itemsByDate = dashboard.calendarItems.reduce((accumulator, item) => {
    accumulator[item.date] = accumulator[item.date] ?? [];
    accumulator[item.date].push(item);
    return accumulator;
  }, {});

  return (
    <Box>
      <PageHeader
        eyebrow={t("Calendar")}
        title={t("Calendar view")}
        subtitle={t("Kunlik tushum, xarajat va transferlarni oy ko‘rinishida kuzatish uchun alohida board.")}
      />

      <SectionCard title={formatMonthValue(monthDate)} subtitle={t("Tanlangan oy bo‘yicha barcha activity bir kalendar gridda ko‘rsatiladi.")}>
        {dashboard.calendarItems.length ? (
          <Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                gap: 1,
                mb: 1.5
              }}
            >
              {getWeekdayLabels().map((label) => (
                <Box key={label} sx={{ px: 1, py: 0.75 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                gap: 1
              }}
            >
              {days.map((day) => {
                const dateKey = formatDateValue(day, "yyyy-MM-dd");
                const items = itemsByDate[dateKey] ?? [];
                const active = isSameMonth(day, monthDate);

                return (
                  <Box
                    key={dateKey}
                    sx={{
                      minHeight: { xs: 124, md: 160 },
                      p: 1.1,
                      borderRadius: 4,
                      border: "1px solid",
                      borderColor: active ? "divider" : alpha(theme.palette.text.primary, 0.05),
                      backgroundColor: active ? "#fff" : alpha(theme.palette.background.default, 0.6),
                      opacity: active ? 1 : 0.52
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      {format(day, "d")}
                    </Typography>
                    <Stack spacing={0.8}>
                      {items.slice(0, 3).map((item) => (
                        <Box
                          key={`${item.date}-${item.title}-${item.amount}`}
                          sx={{
                            p: 0.8,
                            borderRadius: 3,
                            backgroundColor: alpha(
                              item.kind === "INCOME"
                                ? theme.palette.success.main
                                : item.kind === "EXPENSE"
                                  ? theme.palette.error.main
                                  : theme.palette.warning.main,
                              0.1
                            )
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="center">
                            <Chip size="small" label={transactionTypeLabel(item.kind, t)} color={kindColor(item.kind)} />
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                              {formatMoney(item.amount, item.currency)}
                            </Typography>
                          </Stack>
                          <Typography variant="caption" sx={{ display: "block", mt: 0.7 }}>
                            {item.title}
                          </Typography>
                        </Box>
                      ))}
                      {items.length > 3 ? (
                        <Typography variant="caption" color="text.secondary">
                          +{t("{{count}} ta qo'shimcha yozuv", { count: items.length - 3 })}
                        </Typography>
                      ) : null}
                    </Stack>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : (
          <EmptyState
            title={t("Kalendar bo'sh")}
            message={t("Tanlangan oy uchun activity kiritilgach, shu joyda kunlik grid to‘ldiriladi.")}
          />
        )}
      </SectionCard>
    </Box>
  );
}
