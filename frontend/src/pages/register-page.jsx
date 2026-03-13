import { Alert, Box, Button, Divider, Link, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/auth-context";
import AuthShell from "../components/auth-shell";
import { useI18n } from "../i18n/i18n-context";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { register, googleEnabled, googleLoginUrl, busyAction } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError(t("Parol va tasdiqlash paroli bir xil bo‘lishi kerak"));
      return;
    }

    try {
      await register(form);
      navigate("/overview", { replace: true });
    } catch (submitError) {
      setError(submitError.message || t("Ro‘yxatdan o‘tish amalga oshmadi"));
    }
  }

  return (
    <AuthShell
      eyebrow={t("Profil yaratish")}
      title={t("Yangi foydalanuvchi profili bilan boshlang")}
      subtitle={t("Telefon raqam va parol bilan ro‘yxatdan o‘ting yoki Google bilan bir bosishda davom eting. Google birinchi kirishda profilingizni avtomatik yaratadi.")}
      footer={t("Telefon raqamli register alohida qoladi, Google auth esa login va register’ni bitta oqimda bajaradi.")}
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4">{t("Ro‘yxatdan o‘tish")}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t("Asosiy ma’lumotlarni kiriting va shaxsiy workspace yarating.")}
          </Typography>
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label={t("To‘liq ism")}
              autoComplete="name"
              value={form.fullName}
              onChange={(event) => setForm((previous) => ({ ...previous, fullName: event.target.value }))}
              fullWidth
            />
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
              autoComplete="new-password"
              helperText={t("Kamida 8 ta belgi tavsiya etiladi")}
              value={form.password}
              onChange={(event) => setForm((previous) => ({ ...previous, password: event.target.value }))}
              required
              fullWidth
            />
            <TextField
              label={t("Parolni tasdiqlang")}
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(event) => setForm((previous) => ({ ...previous, confirmPassword: event.target.value }))}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" size="large" disabled={busyAction === "register"}>
              {busyAction === "register" ? t("Yaratilmoqda") : t("Ro‘yxatdan o‘tish")}
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
          {t("Akkauntingiz bormi?")}{" "}
          <Link component={RouterLink} to="/auth/login" underline="hover" sx={{ fontWeight: 700 }}>
            {t("Kirish")}
          </Link>
        </Typography>
      </Stack>
    </AuthShell>
  );
}
