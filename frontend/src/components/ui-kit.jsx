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
import { formatMoney } from "../lib/finance-utils";

export function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <Stack
      direction={{ xs: "column", lg: "row" }}
      spacing={2}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", lg: "center" }}
      sx={{ mb: 3 }}
    >
      <Box>
        {eyebrow ? (
          <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 800, letterSpacing: "0.12em" }}>
            {eyebrow}
          </Typography>
        ) : null}
        <Typography variant="h4" sx={{ mt: 0.5 }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75, maxWidth: 720 }}>
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
        minHeight: 180,
        background: `linear-gradient(155deg, ${alpha(accent, 0.18)} 0%, rgba(255,255,255,0.92) 56%)`,
        boxShadow: `0 28px 60px ${alpha(accent, 0.12)}`
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {title}
              </Typography>
              <Typography variant="h5" sx={{ mt: 1 }}>
                {value}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                color: accent,
                backgroundColor: alpha(accent, 0.12)
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
          {footer}
        </Stack>
      </CardContent>
    </Card>
  );
}

export function SectionCard({ title, subtitle, action, children, padded = true }) {
  return (
    <Paper sx={{ overflow: "hidden" }}>
      {(title || subtitle || action) ? (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{ px: 3, py: 2.5, borderBottom: "1px solid", borderColor: "divider" }}
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
  return (
    <Stack spacing={1.25} alignItems="flex-start" sx={{ py: 4 }}>
      <Chip label="MVP state" color="primary" variant="outlined" />
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520 }}>
        {message}
      </Typography>
      {action}
    </Stack>
  );
}

export function CurrencyStack({ items, tone = "default", emptyLabel = "Ma'lumot yo'q" }) {
  if (!items?.length) {
    return <Typography color="text.secondary">{emptyLabel}</Typography>;
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
