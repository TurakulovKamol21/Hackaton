import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Alert,
  Avatar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery
} from "@mui/material";
import {
  AccountBalanceWallet,
  AutoGraph,
  CalendarMonth,
  Dashboard,
  Logout,
  Menu,
  Refresh,
  ReceiptLong,
  Savings,
  SwapHoriz,
  TrendingUp
} from "@mui/icons-material";
import { useState } from "react";
import { useAuth } from "../auth/auth-context";
import { useFinance } from "../finance/finance-context";
import { useI18n } from "../i18n/i18n-context";

const drawerWidth = 284;

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, setLanguage, languages } = useI18n();
  const { user, logout } = useAuth();
  const {
    accounts,
    selectedMonth,
    setSelectedMonth,
    granularity,
    setGranularity,
    loading,
    busyAction,
    error,
    toast,
    closeToast,
    refresh
  } = useFinance();

  const navigation = [
    {
      path: "/overview",
      label: t("Boshqaruv paneli"),
      helper: t("Balans, trend va kalendar oqimi"),
      icon: <Dashboard fontSize="small" />
    },
    {
      path: "/transactions",
      label: t("Tranzaksiyalar"),
      helper: t("Tushum va xarajat oqimlari"),
      icon: <ReceiptLong fontSize="small" />
    },
    {
      path: "/accounts",
      label: t("Hisoblar"),
      helper: t("Kartalar va hamyonlar"),
      icon: <Savings fontSize="small" />
    },
    {
      path: "/transfers",
      label: t("Transferlar"),
      helper: t("Ichki o'tkazmalar va kurs"),
      icon: <SwapHoriz fontSize="small" />
    },
    {
      path: "/debts",
      label: t("Qarzlar"),
      helper: t("Qarz va haqdorlik nazorati"),
      icon: <AccountBalanceWallet fontSize="small" />
    },
    {
      path: "/budget",
      label: t("Byudjet"),
      helper: t("Reja va fakt solishtiruvi"),
      icon: <TrendingUp fontSize="small" />
    },
    {
      path: "/analytics",
      label: t("Tahlil"),
      helper: t("Vizual statistika va insight"),
      icon: <AutoGraph fontSize="small" />
    },
    {
      path: "/calendar",
      label: t("Kalendar"),
      helper: t("Kunlik activity grid view"),
      icon: <CalendarMonth fontSize="small" />
    }
  ];

  const granularityOptions = [
    { value: "DAILY", label: t("Kun") },
    { value: "WEEKLY", label: t("Hafta") },
    { value: "MONTHLY", label: t("Oy") },
    { value: "YEARLY", label: t("Yil") }
  ];

  const currentItem = navigation.find((item) => item.path === location.pathname) ?? navigation[0];

  function handleDrawerToggle() {
    setMobileOpen((previous) => !previous);
  }

  async function handleLogout() {
    await logout();
    navigate("/auth/login", { replace: true });
  }

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 2,
        borderRadius: { xs: 0, lg: "28px" },
        background: "linear-gradient(180deg, #081224 0%, #0c1b35 38%, #07111f 100%)",
        color: "#f8fafc",
        boxShadow: { lg: `0 26px 70px ${alpha("#020617", 0.35)}` }
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 1, pt: 1, pb: 2.5 }}>
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: 3.5,
            display: "grid",
            placeItems: "center",
            background: "linear-gradient(135deg, #2457f5 0%, #0f9d88 100%)",
            boxShadow: `0 18px 36px ${alpha("#2457f5", 0.28)}`
          }}
        >
          <AccountBalanceWallet />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            FinFlow OS
          </Typography>
          <Typography variant="body2" sx={{ color: alpha("#f8fafc", 0.68) }}>
            {t("Personal finance cockpit")}
          </Typography>
        </Box>
      </Stack>

      <Box
        sx={{
          p: 2.5,
          mb: 2.25,
          borderRadius: "22px",
          background: `linear-gradient(145deg, ${alpha("#2457f5", 0.34)} 0%, ${alpha("#0f9d88", 0.16)} 100%)`,
          border: `1px solid ${alpha("#ffffff", 0.1)}`
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Typography variant="body2" sx={{ color: alpha("#f8fafc", 0.72) }}>
              {t("Aktiv hisoblar")}
            </Typography>
            <Typography variant="h4" sx={{ mt: 0.75, fontWeight: 800 }}>
              {accounts.length}
            </Typography>
          </Box>
          <Chip
            size="small"
            label={selectedMonth}
            sx={{
              color: "#fff",
              backgroundColor: alpha("#ffffff", 0.08),
              border: `1px solid ${alpha("#ffffff", 0.08)}`
            }}
          />
        </Stack>
        <Typography variant="body2" sx={{ mt: 1.5, color: alpha("#f8fafc", 0.7), lineHeight: 1.55 }}>
          {t("Asosiy moliyaviy oqimlaringiz bitta panelga jamlandi.")}
        </Typography>
      </Box>

      <List sx={{ p: 0, flexGrow: 1 }}>
        {navigation.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            sx={{
              mb: 0.75,
              px: 1.5,
              py: 1.35,
              borderRadius: "18px",
              alignItems: "flex-start",
              color: alpha("#f8fafc", 0.72),
              transition: "all 180ms ease",
              "&.active": {
                backgroundColor: alpha("#ffffff", 0.1),
                color: "#fff",
                transform: "translateX(4px)",
                boxShadow: `inset 3px 0 0 ${alpha("#60a5fa", 0.9)}`
              },
              "&:hover": {
                backgroundColor: alpha("#ffffff", 0.075),
                color: "#fff"
              },
              "& .nav-helper": {
                color: alpha("#f8fafc", 0.46)
              },
              "&.active .nav-helper": {
                color: alpha("#f8fafc", 0.74)
              }
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 38,
                color: "inherit",
                mt: 0.2
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              secondary={item.helper}
              primaryTypographyProps={{ fontWeight: 700, fontSize: 15 }}
              secondaryTypographyProps={{
                className: "nav-helper",
                sx: {
                  mt: 0.35,
                  lineHeight: 1.45
                }
              }}
            />
          </ListItemButton>
        ))}
      </List>

      <Typography variant="caption" sx={{ px: 1, pt: 1.5, color: alpha("#f8fafc", 0.5) }}>
        {t("MVP ready for hackathon demo")}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: `${drawerWidth}px minmax(0, 1fr)` },
        gap: { xs: 1.25, lg: 2 },
        p: { xs: 1.25, sm: 1.5, lg: 2 }
      }}
    >
      <Box component="nav" sx={{ minWidth: 0 }}>
        <Drawer
          open={mobileOpen}
          onClose={handleDrawerToggle}
          variant="temporary"
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", lg: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              border: "none",
              backgroundColor: "transparent",
              boxShadow: "none",
              p: 1.25
            }
          }}
        >
          {drawerContent}
        </Drawer>

        <Box sx={{ display: { xs: "none", lg: "block" }, position: "sticky", top: 16, height: "calc(100vh - 32px)" }}>
          {drawerContent}
        </Box>
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Paper
          sx={{
            position: "sticky",
            top: { xs: 10, lg: 16 },
            zIndex: 20,
            mb: 2.5,
            p: { xs: 1.5, sm: 2, lg: 2.25 },
            borderRadius: "24px",
            backgroundColor: alpha("#ffffff", 0.82),
            backdropFilter: "blur(18px)",
            boxShadow: `0 18px 50px ${alpha("#0f172a", 0.08)}`
          }}
        >
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", lg: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", lg: "center" }}
              spacing={2}
            >
              <Stack direction="row" spacing={1.25} alignItems={{ xs: "center", lg: "flex-start" }} sx={{ minWidth: 0 }}>
                {!isDesktop ? (
                  <IconButton onClick={handleDrawerToggle} sx={{ alignSelf: "flex-start" }}>
                    <Menu />
                  </IconButton>
                ) : null}
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                    <Chip
                      size="small"
                      label={t("Workspace")}
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        color: "primary.main",
                        fontWeight: 700
                      }}
                    />
                    <Chip size="small" variant="outlined" label={currentItem.label} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 620 }}>
                    {currentItem.helper}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, maxWidth: "100%" }}>
                <Avatar src={user?.avatarUrl || undefined} sx={{ width: 40, height: 40 }}>
                  {(user?.fullName || user?.phoneNumber || "U").slice(0, 1).toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0, display: { xs: "none", sm: "block" } }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                    {user?.fullName || t("Foydalanuvchi")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {user?.phoneNumber || user?.email || ""}
                  </Typography>
                </Box>
                <Tooltip title={t("Chiqish")}>
                  <IconButton onClick={handleLogout}>
                    <Logout fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            <Divider />

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                <TextField
                  select
                  size="small"
                  label={t("Language")}
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  sx={{ minWidth: 132 }}
                >
                  {languages.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  type="month"
                  size="small"
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                  InputProps={{
                    startAdornment: <CalendarMonth sx={{ color: "text.secondary", mr: 1 }} />
                  }}
                  sx={{ minWidth: 166 }}
                />
                <ToggleButtonGroup
                  exclusive
                  value={granularity}
                  size="small"
                  onChange={(_, value) => {
                    if (value) {
                      setGranularity(value);
                    }
                  }}
                  sx={{
                    backgroundColor: alpha("#0f172a", 0.04),
                    borderRadius: 4,
                    "& .MuiToggleButton-root": {
                      border: "none",
                      px: 1.6
                    }
                  }}
                >
                  {granularityOptions.map((option) => (
                    <ToggleButton key={option.value} value={option.value}>
                      {option.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title={t("Yangilash")}>
                  <span>
                    <IconButton
                      color="primary"
                      onClick={refresh}
                      disabled={loading || Boolean(busyAction)}
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        "&:hover": {
                          backgroundColor: alpha(theme.palette.primary.main, 0.14)
                        }
                      }}
                    >
                      <Refresh />
                    </IconButton>
                  </span>
                </Tooltip>
                <Chip
                  label={loading ? t("Yuklanmoqda") : busyAction ? t("Saqlanmoqda") : t("Live")}
                  color={loading || busyAction ? "warning" : "success"}
                  variant={loading || busyAction ? "filled" : "outlined"}
                />
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        {error ? (
          <Alert severity="error" sx={{ mb: 2.5 }}>
            {error}
          </Alert>
        ) : null}

        <Outlet />
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={3800}
        onClose={closeToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={closeToast} severity={toast.severity} variant="filled" sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
