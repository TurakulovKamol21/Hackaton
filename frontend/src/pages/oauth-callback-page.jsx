import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/auth-context";
import { useI18n } from "../i18n/i18n-context";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { refreshSession } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    refreshSession()
      .then((payload) => {
        if (!active) {
          return;
        }

        if (payload?.authenticated) {
          navigate("/overview", { replace: true });
          return;
        }

        navigate("/auth/login", { replace: true });
      })
      .catch((callbackError) => {
        if (!active) {
          return;
        }
        setError(callbackError.message || t("Google loginni yakunlab bo‘lmadi"));
      });

    return () => {
      active = false;
    };
  }, [navigate, refreshSession, t]);

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", px: 2 }}>
      <Stack spacing={2} alignItems="center" sx={{ maxWidth: 420, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h5">{t("Google session tekshirilmoqda")}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t("Brauzer session yaratib bo‘lgach, sizni workspace ichiga yo‘naltiramiz.")}
        </Typography>
        {error ? <Alert severity="error">{error}</Alert> : null}
      </Stack>
    </Box>
  );
}
