import { Box, CircularProgress, CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { HashRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/auth-context";
import AppLayout from "./components/app-layout";
import { FinanceProvider } from "./finance/finance-context";
import { I18nProvider } from "./i18n/i18n-context";
import CalendarPage from "./pages/calendar-page";
import OverviewPage from "./pages/overview-page";
import TransactionsPage from "./pages/transactions-page";
import AccountsPage from "./pages/accounts-page";
import TransfersPage from "./pages/transfers-page";
import DebtsPage from "./pages/debts-page";
import BudgetPage from "./pages/budget-page";
import AnalyticsPage from "./pages/analytics-page";
import LoginPage from "./pages/login-page";
import RegisterPage from "./pages/register-page";
import OAuthCallbackPage from "./pages/oauth-callback-page";
import { appTheme } from "./theme";

function FullscreenLoader() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center"
      }}
    >
      <CircularProgress />
    </Box>
  );
}

function RequireAuth() {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return <FullscreenLoader />;
  }

  if (!authenticated) {
    return <Navigate replace to="/auth/login" />;
  }

  return <Outlet />;
}

function GuestOnly() {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return <FullscreenLoader />;
  }

  if (authenticated) {
    return <Navigate replace to="/overview" />;
  }

  return <Outlet />;
}

function ProtectedWorkspace() {
  return (
    <FinanceProvider>
      <AppLayout />
    </FinanceProvider>
  );
}

function SessionAwareIndex() {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return <FullscreenLoader />;
  }

  return <Navigate replace to={authenticated ? "/overview" : "/auth/login"} />;
}

export default function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <I18nProvider>
        <AuthProvider>
          <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/" element={<SessionAwareIndex />} />
              <Route element={<GuestOnly />}>
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
              </Route>
              <Route path="/auth/callback" element={<OAuthCallbackPage />} />
              <Route element={<RequireAuth />}>
                <Route element={<ProtectedWorkspace />}>
                  <Route path="/overview" element={<OverviewPage />} />
                  <Route path="/transactions" element={<TransactionsPage />} />
                  <Route path="/accounts" element={<AccountsPage />} />
                  <Route path="/transfers" element={<TransfersPage />} />
                  <Route path="/debts" element={<DebtsPage />} />
                  <Route path="/budget" element={<BudgetPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                </Route>
              </Route>
              <Route path="*" element={<SessionAwareIndex />} />
            </Routes>
          </HashRouter>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
