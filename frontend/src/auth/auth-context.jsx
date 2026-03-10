import { createContext, startTransition, useContext, useEffect, useState } from "react";
import { apiUrl, fetchJson, sendJson } from "../lib/finance-utils";

const AuthContext = createContext(null);

const anonymousSession = {
  authenticated: false,
  googleEnabled: false,
  user: null
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(anonymousSession);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");

  useEffect(() => {
    refreshSession()
      .catch(() => {
        setSession(anonymousSession);
      })
      .finally(() => setLoading(false));
  }, []);

  async function refreshSession() {
    const payload = await fetchJson("/api/auth/session");
    startTransition(() => {
      setSession({
        authenticated: Boolean(payload?.authenticated),
        googleEnabled: Boolean(payload?.googleEnabled),
        user: payload?.user ?? null
      });
    });
    return payload;
  }

  async function login(payload) {
    setBusyAction("login");
    try {
      const nextSession = await sendJson("/api/auth/login", {
        method: "POST",
        body: {
          phoneNumber: payload.phoneNumber.trim(),
          password: payload.password
        }
      });
      setSession(nextSession ?? anonymousSession);
      return nextSession;
    } finally {
      setBusyAction("");
    }
  }

  async function register(payload) {
    setBusyAction("register");
    try {
      const nextSession = await sendJson("/api/auth/register", {
        method: "POST",
        body: {
          fullName: payload.fullName?.trim() || null,
          phoneNumber: payload.phoneNumber.trim(),
          password: payload.password,
          confirmPassword: payload.confirmPassword
        }
      });
      setSession(nextSession ?? anonymousSession);
      return nextSession;
    } finally {
      setBusyAction("");
    }
  }

  async function logout() {
    setBusyAction("logout");
    try {
      await sendJson("/api/auth/logout", {
        method: "POST"
      });
    } catch {
      // Local session cleanup should still happen even if the server session is already gone.
    } finally {
      setSession((previous) => ({
        authenticated: false,
        googleEnabled: previous.googleEnabled,
        user: null
      }));
      setBusyAction("");
    }
  }

  function clearSession() {
    setSession((previous) => ({
      authenticated: false,
      googleEnabled: previous.googleEnabled,
      user: null
    }));
  }

  return (
    <AuthContext.Provider
      value={{
        ...session,
        loading,
        busyAction,
        googleLoginUrl: apiUrl("/oauth2/authorization/google"),
        refreshSession,
        login,
        register,
        logout,
        clearSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
