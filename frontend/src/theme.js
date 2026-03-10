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
      default: "#f3f5fb",
      paper: "#ffffff"
    },
    text: {
      primary: "#111827",
      secondary: "#64748b"
    },
    divider: "#dbe3f0"
  },
  shape: {
    borderRadius: 6
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
          background:
            "radial-gradient(circle at top left, rgba(255,255,255,1) 0%, rgba(243,245,251,1) 46%, rgba(233,238,248,1) 100%)",
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
          border: `1px solid ${alpha("#0f172a", 0.06)}`,
          boxShadow: `0 16px 40px ${alpha("#0f172a", 0.05)}`
        },
        rounded: {
          borderRadius: 20
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
          boxShadow: `0 14px 30px ${alpha("#2457f5", 0.16)}`
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
          borderRadius: 20,
          border: `1px solid ${alpha("#0f172a", 0.05)}`
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: alpha("#ffffff", 0.92)
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20
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
