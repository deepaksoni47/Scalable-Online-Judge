import {
  createContext,
  useContext,
  useEffect,
  useState,
  useEffectEvent,
} from "react";
import { loginUser, getUserProfile } from "../services/authService.js";

const AuthContext = createContext(null);

const getStoredUser = () => {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(getStoredUser);
  const [isAuthLoading, setIsAuthLoading] = useState(Boolean(token));

  const clearAuth = useEffectEvent(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setIsAuthLoading(false);
  });

  useEffect(() => {
    const syncProfile = async () => {
      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const response = await getUserProfile();
        const profile = response.data;

        setUser(profile);
        localStorage.setItem("user", JSON.stringify(profile));
      } catch {
        clearAuth();
      } finally {
        setIsAuthLoading(false);
      }
    };

    syncProfile();
  }, [token, clearAuth]);

  useEffect(() => {
    window.addEventListener("auth:unauthorized", clearAuth);

    return () => {
      window.removeEventListener("auth:unauthorized", clearAuth);
    };
  }, [clearAuth]);

  const login = async ({ email, password }) => {
    const response = await loginUser({ email, password });
    const authToken = response.data.token;
    const authUser = response.data.user;

    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);

    return authUser;
  };

  const logout = () => {
    clearAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isAuthLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }

  return context;
};
