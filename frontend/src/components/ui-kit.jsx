import { alpha } from "@mui/material/styles";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { useI18n } from "../i18n/i18n-context";
import { formatMoney } from "../lib/finance-utils";

export function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <Stack
      direction={{ xs: "column", lg: "row" }}
      spacing={2.5}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", lg: "flex-end" }}
      sx={{ mb: 3 }}
    >
      <Box sx={{ position: "relative", pl: 2 }}>
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 4,
            bottom: 6,
            width: 4,
            borderRadius: "999px",
            background: "linear-gradient(180deg, #2457f5 0%, #0f9d88 100%)"
          }}
        />
        {eyebrow ? (
          <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 800, letterSpacing: "0.14em" }}>
            {eyebrow}
          </Typography>
        ) : null}
        <Typography variant="h4" sx={{ mt: 0.5, fontSize: { xs: "1.9rem", lg: "2.45rem" }, lineHeight: 1.05 }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.9, maxWidth: 760 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {action}
    </Stack>
  );
}

export function MetricCard({ title, value, caption, icon, accent = "#2457f5", footer }) {
  return (
    <Card
      sx={{
        minHeight: 208,
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#fff",
        borderRadius: "24px",
        boxShadow: `0 24px 56px ${alpha(accent, 0.12)}`,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at top right, ${alpha(accent, 0.18)} 0%, transparent 36%)`
        },
        "&::after": {
          content: '""',
          position: "absolute",
          insetInline: 0,
          top: 0,
          height: 4,
          background: accent
        }
      }}
    >
      <CardContent sx={{ p: 3, position: "relative", display: "flex", flexDirection: "column", height: "100%" }}>
        <Stack spacing={2.25} sx={{ flexGrow: 1 }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
                {title}
              </Typography>
              <Typography variant="h4" sx={{ mt: 1.1, lineHeight: 1 }}>
                {value}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: "18px",
                display: "grid",
                placeItems: "center",
                color: accent,
                backgroundColor: alpha(accent, 0.12),
                border: `1px solid ${alpha(accent, 0.14)}`
              }}
            >
              {icon}
            </Box>
          </Stack>
          {caption ? (
            <Typography variant="body2" color="text.secondary">
              {caption}
            </Typography>
          ) : null}
          <Box sx={{ mt: "auto", pt: 2, borderTop: "1px solid", borderColor: alpha(accent, 0.12) }}>{footer}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function SectionCard({ title, subtitle, action, children, padded = true }) {
  return (
    <Paper sx={{ overflow: "hidden", borderRadius: "24px", boxShadow: `0 18px 48px ${alpha("#0f172a", 0.06)}` }}>
      {(title || subtitle || action) ? (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{
            px: 3,
            py: 2.4,
            borderBottom: "1px solid",
            borderColor: "divider",
            backgroundColor: alpha("#0f172a", 0.015)
          }}
        >
          <Box>
            {title ? <Typography variant="h6">{title}</Typography> : null}
            {subtitle ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          {action}
        </Stack>
      ) : null}
      <Box sx={padded ? { p: 3 } : undefined}>{children}</Box>
    </Paper>
  );
}

export function EmptyState({ title, message, action }) {
  const { t } = useI18n();

  return (
    <Box
      sx={{
        py: 3.5,
        px: { xs: 0, sm: 0.5 }
      }}
    >
      <Stack
        spacing={1.25}
        alignItems="flex-start"
        sx={{
          p: 2.5,
          borderRadius: "20px",
          border: "1px dashed",
          borderColor: alpha("#0f172a", 0.14),
          backgroundColor: alpha("#f8fafc", 0.7)
        }}
      >
        <Chip label={t("MVP state")} color="primary" variant="outlined" />
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520 }}>
          {message}
        </Typography>
        {action}
      </Stack>
    </Box>
  );
}

export function CurrencyStack({ items, tone = "default", emptyLabel = "Ma'lumot yo'q" }) {
  const { t } = useI18n();

  if (!items?.length) {
    return <Typography color="text.secondary">{t(emptyLabel)}</Typography>;
  }

  return (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
      {items.map((item) => (
        <Chip
          key={`${item.currency}-${item.amount}`}
          label={`${formatMoney(item.amount, item.currency)}`}
          color={tone === "success" ? "success" : tone === "error" ? "error" : "default"}
          variant={tone === "default" ? "outlined" : "filled"}
        />
      ))}
    </Stack>
  );
}
