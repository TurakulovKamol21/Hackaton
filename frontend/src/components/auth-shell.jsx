import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

export default function AuthShell({ eyebrow, title, subtitle, children, footer }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        py: 4,
        background:
          "radial-gradient(circle at top left, rgba(36, 87, 245, 0.16) 0%, rgba(255,255,255,0.95) 38%, rgba(232,238,248,1) 100%)"
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 1080, display: "grid", gap: 3, gridTemplateColumns: { md: "1.08fr 0.92fr" } }}>
        <Card
          sx={{
            minHeight: 620,
            p: { xs: 1, sm: 2 },
            background: "linear-gradient(160deg, #0f172a 0%, #111827 48%, #16213f 100%)",
            color: "#f8fafc",
            display: "flex",
            alignItems: "stretch"
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4.5 }, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <Stack spacing={2.5}>
              <Chip
                label={eyebrow}
                sx={{
                  alignSelf: "flex-start",
                  color: "#fff",
                  backgroundColor: alpha("#ffffff", 0.08),
                  border: `1px solid ${alpha("#ffffff", 0.12)}`
                }}
              />
              <Box>
                <Typography variant="h3" sx={{ maxWidth: 420, lineHeight: 1.1 }}>
                  {title}
                </Typography>
                <Typography variant="body1" sx={{ mt: 2, maxWidth: 460, color: alpha("#f8fafc", 0.74) }}>
                  {subtitle}
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={2.5}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 5,
                  background: `linear-gradient(145deg, ${alpha("#2457f5", 0.2)} 0%, ${alpha("#0f9d88", 0.16)} 100%)`,
                  border: `1px solid ${alpha("#ffffff", 0.08)}`
                }}
              >
                <Typography variant="overline" sx={{ color: alpha("#f8fafc", 0.72) }}>
                  Himoyalangan workspace
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  Har bir foydalanuvchining moliyaviy ma’lumotlari alohida scope’da saqlanadi.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1.25, color: alpha("#f8fafc", 0.68) }}>
                  Session-based security, PostgreSQL persistence va Google sign-in endi platforma oqimining bir qismi.
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: alpha("#f8fafc", 0.62) }}>
                {footer}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ p: { xs: 1, sm: 2 }, display: "flex", alignItems: "center", boxShadow: `0 24px 64px ${alpha("#0f172a", 0.08)}` }}>
          <CardContent sx={{ width: "100%", p: { xs: 3, sm: 4 } }}>{children}</CardContent>
        </Card>
      </Box>
    </Box>
  );
}
