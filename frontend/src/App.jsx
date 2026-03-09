import { CssBaseline, ThemeProvider } from "@mui/material";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/app-layout";
import { FinanceProvider } from "./finance/finance-context";
import OverviewPage from "./pages/overview-page";
import TransactionsPage from "./pages/transactions-page";
import AccountsPage from "./pages/accounts-page";
import TransfersPage from "./pages/transfers-page";
import DebtsPage from "./pages/debts-page";
import BudgetPage from "./pages/budget-page";
import AnalyticsPage from "./pages/analytics-page";
import { appTheme } from "./theme";

export default function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <FinanceProvider>
        <HashRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate replace to="/overview" />} />
              <Route path="/overview" element={<OverviewPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/accounts" element={<AccountsPage />} />
              <Route path="/transfers" element={<TransfersPage />} />
              <Route path="/debts" element={<DebtsPage />} />
              <Route path="/budget" element={<BudgetPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="*" element={<Navigate replace to="/overview" />} />
            </Route>
          </Routes>
        </HashRouter>
      </FinanceProvider>
    </ThemeProvider>
  );
}
