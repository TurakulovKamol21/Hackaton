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

    const verifySession = async () => {
      try {
        for (let attempt = 0; attempt < 5; attempt += 1) {
          const payload = await refreshSession();

          if (!active) {
            return;
          }

          if (payload?.authenticated) {
            navigate("/overview", { replace: true });
            return;
          }

          await new Promise((resolve) => {
            window.setTimeout(resolve, 350);
          });
        }

        if (active) {
          navigate("/auth/login", { replace: true });
        }
      } catch (callbackError) {
        if (!active) {
          return;
        }
        setError(callbackError.message || t("Google loginni yakunlab bo‘lmadi"));
      }
    };

    verifySession();

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
