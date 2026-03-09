import { alpha, createTheme } from "@mui/material/styles";

const baseTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2457f5",
      dark: "#1839ad",
      light: "#eff3ff"
    },
    secondary: {
      main: "#0f9d88",
      light: "#dff8f2"
    },
    success: {
      main: "#1f9d55",
      light: "#e3f6ea"
    },
    warning: {
      main: "#f08c00",
      light: "#fff3d6"
    },
    error: {
      main: "#d92d20",
      light: "#ffe9e7"
    },
    background: {
      default: "#eef3fb",
      paper: "#ffffff"
    },
    text: {
      primary: "#111827",
      secondary: "#64748b"
    },
    divider: "#dbe3f0"
  },
  shape: {
    borderRadius: 20
  },
  typography: {
    fontFamily: '"Manrope", "Segoe UI", sans-serif',
    h1: {
      fontFamily: '"Space Grotesk", "Manrope", sans-serif',
      fontWeight: 700,
      letterSpacing: "-0.03em"
    },
    h2: {
      fontFamily: '"Space Grotesk", "Manrope", sans-serif',
      fontWeight: 700,
      letterSpacing: "-0.03em"
    },
    h3: {
      fontFamily: '"Space Grotesk", "Manrope", sans-serif',
      fontWeight: 700,
      letterSpacing: "-0.03em"
    },
    h4: {
      fontFamily: '"Space Grotesk", "Manrope", sans-serif',
      fontWeight: 700,
      letterSpacing: "-0.03em"
    },
    h5: {
      fontFamily: '"Space Grotesk", "Manrope", sans-serif',
      fontWeight: 700,
      letterSpacing: "-0.02em"
    },
    h6: {
      fontFamily: '"Space Grotesk", "Manrope", sans-serif',
      fontWeight: 700,
      letterSpacing: "-0.02em"
    },
    button: {
      fontWeight: 700,
      textTransform: "none"
    }
  }
});

export const appTheme = createTheme(baseTheme, {
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: "radial-gradient(circle at top left, #ffffff 0%, #eef3fb 48%, #e8eef8 100%)",
          minHeight: "100vh"
        },
        "#root": {
          minHeight: "100vh"
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: `1px solid ${alpha("#0f172a", 0.05)}`
        },
        rounded: {
          borderRadius: 24
        }
      }
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          borderRadius: 16,
          paddingInline: 18
        },
        contained: {
          boxShadow: `0 16px 34px ${alpha("#2457f5", 0.18)}`
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          border: `1px solid ${alpha("#0f172a", 0.05)}`
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: alpha("#ffffff", 0.88)
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 28
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: "#475569",
          fontWeight: 700
        }
      }
    }
  }
});
