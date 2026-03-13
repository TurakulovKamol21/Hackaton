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
  const [error, setError] = useState(searchParams.get("error") === "google_auth_failed" ? t("Google orqali davom etish yakunlanmadi") : "");

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
      subtitle={t("Telefon raqam orqali kiring yoki Google bilan davom eting. Google birinchi kirishda profilingizni avtomatik yaratadi, keyin esa to‘g‘ridan-to‘g‘ri login qiladi.")}
      footer={t("Google auth bu yerda login va register’ni bitta oqimga birlashtiradi. Telefon raqam va parol orqali esa alohida register qilish mumkin.")}
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
            {googleEnabled ? t("Google bilan davom etish") : t("Google auth sozlanmagan")}
          </Button>
          {!googleEnabled ? (
            <Typography variant="caption" color="text.secondary">
              {t("Google auth uchun backendda GOOGLE_CLIENT_ID va GOOGLE_CLIENT_SECRET o‘rnatilishi kerak.")}
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
