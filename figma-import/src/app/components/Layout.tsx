import { Outlet, Link, useLocation } from 'react-router';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, Box, CssBaseline } from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  AccountBalance, 
  Receipt, 
  SwapHoriz, 
  AccountBalanceWallet,
  TrendingUp,
  BarChart
} from '@mui/icons-material';

const drawerWidth = 260;

const menuItems = [
  { path: '/', label: 'Bosh sahifa', icon: <DashboardIcon /> },
  { path: '/accounts', label: 'Hisoblar va kartalar', icon: <AccountBalance /> },
  { path: '/transactions', label: 'Tranzaksiyalar', icon: <Receipt /> },
  { path: '/transfers', label: 'Transferlar', icon: <SwapHoriz /> },
  { path: '/debts', label: 'Qarzlar', icon: <AccountBalanceWallet /> },
  { path: '/budget', label: 'Byudjet', icon: <TrendingUp /> },
  { path: '/analytics', label: 'Tahlil', icon: <BarChart /> },
];

export const Layout = () => {
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Moliyaviy Boshqaruv Tizimi
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};
