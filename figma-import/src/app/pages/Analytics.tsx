import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Grid,
} from '@mui/material';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/categories';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  format,
  isSameDay,
  isSameWeek,
  isSameMonth,
} from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];

export const Analytics = () => {
  const { transactions } = useFinance();
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const getDateRange = () => {
    const date = new Date(selectedDate);
    switch (period) {
      case 'day':
        return { start: date, end: date };
      case 'week':
        return { start: startOfWeek(date, { weekStartsOn: 1 }), end: endOfWeek(date, { weekStartsOn: 1 }) };
      case 'month':
        return { start: startOfMonth(date), end: endOfMonth(date) };
      case 'year':
        return { start: startOfYear(date), end: endOfYear(date) };
    }
  };

  const { start, end } = getDateRange();

  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= start && transactionDate <= end;
  });

  const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
  const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const netIncome = totalIncome - totalExpense;

  // Category breakdown
  const categoryData = (type: 'income' | 'expense') => {
    const filtered = filteredTransactions.filter(t => t.type === type);
    const grouped = filtered.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Time series data
  const getTimeSeriesData = () => {
    let intervals: Date[] = [];
    let groupingFn: (date: Date, interval: Date) => boolean;

    switch (period) {
      case 'day':
        intervals = [start];
        groupingFn = isSameDay;
        break;
      case 'week':
        intervals = eachDayOfInterval({ start, end });
        groupingFn = isSameDay;
        break;
      case 'month':
        intervals = eachDayOfInterval({ start, end });
        groupingFn = isSameDay;
        break;
      case 'year':
        intervals = eachMonthOfInterval({ start, end });
        groupingFn = isSameMonth;
        break;
    }

    return intervals.map(interval => {
      const income = incomeTransactions
        .filter(t => groupingFn(new Date(t.date), interval))
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = expenseTransactions
        .filter(t => groupingFn(new Date(t.date), interval))
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        date: period === 'year' ? format(interval, 'MMM') : format(interval, 'dd MMM'),
        income,
        expense,
      };
    });
  };

  const timeSeriesData = getTimeSeriesData();
  const expenseCategoryData = categoryData('expense');
  const incomeCategoryData = categoryData('income');

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Tahlil</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            type="date"
            size="small"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={(_, value) => value && setPeriod(value)}
            size="small"
          >
            <ToggleButton value="day">Kun</ToggleButton>
            <ToggleButton value="week">Hafta</ToggleButton>
            <ToggleButton value="month">Oy</ToggleButton>
            <ToggleButton value="year">Yil</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Tushumlar
              </Typography>
              <Typography variant="h4" color="success.main">
                {formatCurrency(totalIncome)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ bgcolor: '#ffebee' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Xarajatlar
              </Typography>
              <Typography variant="h4" color="error.main">
                {formatCurrency(totalExpense)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ bgcolor: netIncome >= 0 ? '#e3f2fd' : '#fff3e0' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Sof daromad
              </Typography>
              <Typography variant="h4" color={netIncome >= 0 ? 'primary.main' : 'warning.main'}>
                {formatCurrency(netIncome)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Vaqt bo'yicha dinamika
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#4caf50" name="Tushumlar" strokeWidth={2} />
                <Line type="monotone" dataKey="expense" stroke="#f44336" name="Xarajatlar" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Xarajatlar kategoriyalar bo'yicha
            </Typography>
            {expenseCategoryData.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
                Ma'lumot yo'q
              </Typography>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${((entry.value / totalExpense) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseCategoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tushumlar kategoriyalar bo'yicha
            </Typography>
            {incomeCategoryData.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
                Ma'lumot yo'q
              </Typography>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incomeCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${((entry.value / totalIncome) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incomeCategoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Kategoriyalar taqqoslash
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[...expenseCategoryData.slice(0, 5)]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="value" fill="#f44336" name="Xarajat" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};