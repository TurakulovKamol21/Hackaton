import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { useFinance } from "../context/FinanceContext";
import { formatCurrency } from "../utils/categories";
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  AccountBalanceWallet,
} from "@mui/icons-material";
import { format, startOfMonth, endOfMonth } from "date-fns";

export const Dashboard = () => {
  const { accounts, transactions, debts, getTotalBalance } =
    useFinance();

  const totalBalance = getTotalBalance();

  // Calculate current month's income and expenses
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const currentMonthTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return (
      transactionDate >= monthStart &&
      transactionDate <= monthEnd
    );
  });

  const monthlyIncome = currentMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const openDebtsGiven = debts.filter(
    (d) => d.type === "given" && d.status === "OPEN",
  );
  const openDebtsReceived = debts.filter(
    (d) => d.type === "received" && d.status === "OPEN",
  );

  const totalDebtsGiven = openDebtsGiven.reduce(
    (sum, d) => sum + d.amount,
    0,
  );
  const totalDebtsReceived = openDebtsReceived.reduce(
    (sum, d) => sum + d.amount,
    0,
  );

  const stats = [
    {
      title: "Umumiy balans",
      value: formatCurrency(totalBalance),
      icon: (
        <AccountBalance
          sx={{ fontSize: 40, color: "#1976d2" }}
        />
      ),
      color: "#e3f2fd",
    },
    {
      title: "Oylik tushumlar",
      value: formatCurrency(monthlyIncome),
      subtitle: format(now, "MMMM yyyy"),
      icon: (
        <TrendingUp sx={{ fontSize: 40, color: "#4caf50" }} />
      ),
      color: "#e8f5e9",
    },
    {
      title: "Oylik xarajatlar",
      value: formatCurrency(monthlyExpenses),
      subtitle: format(now, "MMMM yyyy"),
      icon: (
        <TrendingDown sx={{ fontSize: 40, color: "#f44336" }} />
      ),
      color: "#ffebee",
    },
    {
      title: "Berilgan qarzlar",
      value: formatCurrency(totalDebtsGiven),
      subtitle: `${openDebtsGiven.length} ta ochiq`,
      icon: (
        <AccountBalanceWallet
          sx={{ fontSize: 40, color: "#ff9800" }}
        />
      ),
      color: "#fff3e0",
    },
  ];

  const recentTransactions = [...transactions]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    .slice(0, 5);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bosh sahifa
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card sx={{ height: "100%", bgcolor: stat.color }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box>
                    <Typography
                      color="text.secondary"
                      gutterBottom
                      variant="body2"
                    >
                      {stat.title}
                    </Typography>
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{ mb: 1 }}
                    >
                      {stat.value}
                    </Typography>
                    {stat.subtitle && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {stat.subtitle}
                      </Typography>
                    )}
                  </Box>
                  {stat.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hisoblar
            </Typography>
            {accounts.length === 0 ? (
              <Typography color="text.secondary">
                Hozircha hisoblar yo'q
              </Typography>
            ) : (
              <Box>
                {accounts.map((account) => (
                  <Box
                    key={account.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 1.5,
                      borderBottom: "1px solid #f0f0f0",
                      "&:last-child": { borderBottom: "none" },
                    }}
                  >
                    <Box>
                      <Typography variant="body1">
                        {account.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {account.type === "bank_account"
                          ? "Bank hisobraqami"
                          : account.type === "card"
                            ? "Karta"
                            : "Naqd pul"}
                      </Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      color={
                        account.balance >= 0
                          ? "success.main"
                          : "error.main"
                      }
                    >
                      {formatCurrency(
                        account.balance,
                        account.currency,
                      )}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              So'nggi tranzaksiyalar
            </Typography>
            {recentTransactions.length === 0 ? (
              <Typography color="text.secondary">
                Hozircha tranzaksiyalar yo'q
              </Typography>
            ) : (
              <Box>
                {recentTransactions.map((transaction) => {
                  const account = accounts.find(
                    (a) => a.id === transaction.accountId,
                  );
                  return (
                    <Box
                      key={transaction.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 1.5,
                        borderBottom: "1px solid #f0f0f0",
                        "&:last-child": {
                          borderBottom: "none",
                        },
                      }}
                    >
                      <Box>
                        <Typography variant="body1">
                          {transaction.description}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {transaction.category} •{" "}
                          {format(
                            new Date(transaction.date),
                            "dd.MM.yyyy",
                          )}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body1"
                        color={
                          transaction.type === "income"
                            ? "success.main"
                            : "error.main"
                        }
                        sx={{ fontWeight: 600 }}
                      >
                        {transaction.type === "income"
                          ? "+"
                          : "-"}
                        {formatCurrency(
                          transaction.amount,
                          account?.currency,
                        )}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};