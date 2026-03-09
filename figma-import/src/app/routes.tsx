import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Accounts } from "./pages/Accounts";
import { Transactions } from "./pages/Transactions";
import { Transfers } from "./pages/Transfers";
import { Debts } from "./pages/Debts";
import { Budget } from "./pages/Budget";
import { Analytics } from "./pages/Analytics";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "accounts", Component: Accounts },
      { path: "transactions", Component: Transactions },
      { path: "transfers", Component: Transfers },
      { path: "debts", Component: Debts },
      { path: "budget", Component: Budget },
      { path: "analytics", Component: Analytics },
    ],
  },
]);
