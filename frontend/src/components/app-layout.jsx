import { NavLink, Outlet, useLocation } from "react-router-dom";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Alert,
  AppBar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
  useMediaQuery
} from "@mui/material";
import {
  AccountBalanceWallet,
  AutoGraph,
  CalendarMonth,
  Dashboard,
  Menu,
  Refresh,
  ReceiptLong,
  Savings,
  SwapHoriz,
  TrendingUp
} from "@mui/icons-material";
import { useState } from "react";
import { useFinance } from "../finance/finance-context";

const drawerWidth = 292;

const navigation = [
  {
    path: "/overview",
    label: "Boshqaruv paneli",
    helper: "Balans, trend va kalendar oqimi",
    icon: <Dashboard fontSize="small" />
  },
  {
    path: "/transactions",
    label: "Tranzaksiyalar",
    helper: "Tushum va xarajat oqimlari",
    icon: <ReceiptLong fontSize="small" />
  },
  {
    path: "/accounts",
    label: "Hisoblar",
    helper: "Kartalar va hamyonlar",
    icon: <Savings fontSize="small" />
  },
  {
    path: "/transfers",
    label: "Transferlar",
    helper: "Ichki o'tkazmalar va kurs",
    icon: <SwapHoriz fontSize="small" />
  },
  {
    path: "/debts",
    label: "Qarzlar",
    helper: "Qarz va haqdorlik nazorati",
    icon: <AccountBalanceWallet fontSize="small" />
  },
  {
    path: "/budget",
    label: "Byudjet",
    helper: "Reja va fakt solishtiruvi",
    icon: <TrendingUp fontSize="small" />
  },
  {
    path: "/analytics",
    label: "Tahlil",
    helper: "Vizual statistika va insight",
    icon: <AutoGraph fontSize="small" />
  }
];

const granularityOptions = [
  { value: "DAILY", label: "Kun" },
  { value: "WEEKLY", label: "Hafta" },
  { value: "MONTHLY", label: "Oy" },
  { value: "YEARLY", label: "Yil" }
];

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const location = useLocation();
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

  const currentItem = navigation.find((item) => item.path === location.pathname) ?? navigation[0];

  function handleDrawerToggle() {
    setMobileOpen((previous) => !previous);
  }

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
        color: "#f8fafc"
      }}
    >
      <Box sx={{ px: 3, pt: 3, pb: 2.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              background: "linear-gradient(135deg, #2457f5 0%, #0f9d88 100%)",
              boxShadow: `0 18px 40px ${alpha("#2457f5", 0.35)}`
            }}
          >
            <AccountBalanceWallet />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              FinFlow OS
            </Typography>
            <Typography variant="body2" sx={{ color: alpha("#f8fafc", 0.7) }}>
              Personal finance cockpit
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ px: 3, pb: 2 }}>
        <Box
          sx={{
            p: 2.25,
            borderRadius: 4,
            background: `linear-gradient(145deg, ${alpha("#2457f5", 0.3)} 0%, ${alpha("#0f9d88", 0.14)} 100%)`,
            border: `1px solid ${alpha("#ffffff", 0.08)}`
          }}
        >
          <Typography variant="body2" sx={{ color: alpha("#f8fafc", 0.7) }}>
            Aktiv hisoblar
          </Typography>
          <Typography variant="h5" sx={{ mt: 1 }}>
            {accounts.length}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: alpha("#f8fafc", 0.72) }}>
            Asosiy moliyaviy oqimlaringiz bitta panelga jamlandi.
          </Typography>
        </Box>
      </Box>

      <List sx={{ px: 2, py: 0, flexGrow: 1 }}>
        {navigation.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            sx={{
              mb: 0.75,
              alignItems: "flex-start",
              borderRadius: 4,
              px: 2,
              py: 1.4,
              color: alpha("#f8fafc", 0.76),
              "&.active": {
                backgroundColor: alpha("#ffffff", 0.1),
                color: "#ffffff"
              },
              "&.active .nav-helper": {
                color: alpha("#ffffff", 0.76)
              },
              "&:hover": {
                backgroundColor: alpha("#ffffff", 0.08)
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "inherit", mt: 0.25 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              secondary={item.helper}
              primaryTypographyProps={{ fontWeight: 700, fontSize: 14.5 }}
              secondaryTypographyProps={{
                className: "nav-helper",
                sx: {
                  mt: 0.35,
                  color: alpha("#f8fafc", 0.48),
                  lineHeight: 1.45
                }
              }}
            />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ p: 3, pt: 1.5 }}>
        <Divider sx={{ borderColor: alpha("#ffffff", 0.08), mb: 2 }} />
        <Typography variant="body2" sx={{ color: alpha("#f8fafc", 0.6) }}>
          MVP ready for hackathon demo
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", p: { xs: 1, sm: 1.5, lg: 2 } }}>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          width: { lg: `calc(100% - ${drawerWidth + 32}px)` },
          ml: { lg: `${drawerWidth + 16}px` },
          px: { xs: 1, sm: 1.5, lg: 0 }
        }}
      >
        <Toolbar
          sx={{
            minHeight: "84px !important",
            alignItems: "center",
            gap: 2,
            mx: { lg: 2 },
            mt: { xs: 1, lg: 0 },
            borderRadius: 6,
            border: "1px solid",
            borderColor: alpha("#0f172a", 0.06),
            backgroundColor: alpha("#ffffff", 0.8),
            backdropFilter: "blur(18px)"
          }}
        >
          {!isDesktop ? (
            <IconButton onClick={handleDrawerToggle}>
              <Menu />
            </IconButton>
          ) : null}

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary">
              Workspace
            </Typography>
            <Typography variant="h6" sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {currentItem.label}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
            <TextField
              type="month"
              size="small"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              InputProps={{
                startAdornment: <CalendarMonth sx={{ color: "text.secondary", mr: 1 }} />
              }}
              sx={{ minWidth: 158 }}
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
                backgroundColor: alpha("#0f172a", 0.03),
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
            <Chip
              label={loading ? "Yuklanmoqda" : busyAction ? "Saqlanmoqda" : "Live"}
              color={loading || busyAction ? "warning" : "success"}
              variant={loading || busyAction ? "filled" : "outlined"}
            />
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { lg: drawerWidth },
          flexShrink: { lg: 0 }
        }}
      >
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
              boxShadow: "none"
            }
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          open
          variant="permanent"
          sx={{
            display: { xs: "none", lg: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              border: "none",
              backgroundColor: "transparent",
              boxShadow: "none"
            }
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Toolbar sx={{ minHeight: "100px !important" }} />
        <Box sx={{ px: { xs: 1, sm: 1.5, lg: 2 }, pb: 3 }}>
          {error ? (
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {error}
            </Alert>
          ) : null}
          <Outlet />
        </Box>
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
