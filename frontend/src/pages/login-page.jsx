import { Alert, Box, Button, Divider, Link, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/auth-context";
import AuthShell from "../components/auth-shell";
import { useI18n } from "../i18n/i18n-context";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useI18n();
  const { login, googleEnabled, googleLoginUrl, busyAction } = useAuth();
  const [form, setForm] = useState({
    phoneNumber: "",
    password: ""
  });
  const [error, setError] = useState(searchParams.get("error") === "google_auth_failed" ? t("Google login yakunlanmadi") : "");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await login(form);
      navigate("/overview", { replace: true });
    } catch (submitError) {
      setError(submitError.message || t("Kirish amalga oshmadi"));
    }
  }

  return (
    <AuthShell
      eyebrow={t("Xavfsiz kirish")}
      title={t("Moliyaviy profilingizga xavfsiz kiring")}
      subtitle={t("Telefon raqam orqali login qiling yoki Google orqali session oching. Har bir foydalanuvchi faqat o‘zining ma’lumotlarini ko‘radi.")}
      footer={t("Hackathon demo uchun register oqimidan o‘tib yangi user yaratish yoki mavjud session bilan kirish mumkin.")}
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4">{t("Kirish")}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t("Davom etish uchun telefon raqam va parolni kiriting.")}
          </Typography>
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label={t("Telefon raqam")}
              placeholder="+998901234567"
              autoComplete="tel"
              value={form.phoneNumber}
              onChange={(event) => setForm((previous) => ({ ...previous, phoneNumber: event.target.value }))}
              required
              fullWidth
            />
            <TextField
              label={t("Parol")}
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => setForm((previous) => ({ ...previous, password: event.target.value }))}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" size="large" disabled={busyAction === "login"}>
              {busyAction === "login" ? t("Kirilmoqda") : t("Kirish")}
            </Button>
          </Stack>
        </Box>

        <Divider>{t("yoki")}</Divider>

        <Stack spacing={1.5}>
          <Button
            variant="outlined"
            size="large"
            disabled={!googleEnabled}
            onClick={() => {
              window.location.href = googleLoginUrl;
            }}
          >
            {googleEnabled ? t("Google orqali kirish") : t("Google login sozlanmagan")}
          </Button>
          {!googleEnabled ? (
            <Typography variant="caption" color="text.secondary">
              {t("Google login uchun backendda GOOGLE_CLIENT_ID va GOOGLE_CLIENT_SECRET o‘rnatilishi kerak.")}
            </Typography>
          ) : null}
        </Stack>

        <Typography variant="body2" color="text.secondary">
          {t("Hisobingiz yo‘qmi?")}{" "}
          <Link component={RouterLink} to="/auth/register" underline="hover" sx={{ fontWeight: 700 }}>
            {t("Ro‘yxatdan o‘tish")}
          </Link>
        </Typography>
      </Stack>
    </AuthShell>
  );
}
