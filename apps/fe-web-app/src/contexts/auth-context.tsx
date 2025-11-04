import type { PropsWithChildren } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { UserApi } from "@/apis/user.api";
import type { TUser } from "@/schema/user.schema";

type StoredAuth = {
  userId: string;
  token?: string;
  role?: TUser["role"];
};

type AuthContextValue = {
  currentUser: TUser | null;
  token: string | null;
  role: TUser["role"] | null;
  isLoading: boolean;
  isVerified: boolean;
  setAuth: (user: TUser, token?: string) => void;
  refreshUser: (userId?: string) => Promise<void>;
  clearAuth: () => void;
};

const AUTH_STORAGE_KEY = "evrental.auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [currentUser, setCurrentUser] = useState<TUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<TUser["role"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistAuth = useCallback((value: StoredAuth | null) => {
    if (value) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(value));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await UserApi.getCurrentUser();
      setCurrentUser(response.data.data);
      setRole(response.data.data.role);
    } catch (error) {
      console.error("Failed to fetch current user profile", error);
      setCurrentUser(null);
      setRole(null);
      persistAuth(null);
    } finally {
      setIsLoading(false);
    }
  }, [persistAuth]);

  const hydrateFromStorage = useCallback(async () => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsLoading(false);
        return;
      }

      const parsed = JSON.parse(raw) as StoredAuth;
      setToken(parsed.token ?? null);
      setRole(parsed.role ?? null);

      if (parsed.token) {
        await fetchCurrentUser();
      } else if (parsed.userId) {
        try {
          setIsLoading(true);
          const response = await UserApi.getUserById(parsed.userId);
          setCurrentUser(response.data.data);
          setRole(response.data.data.role);
        } catch (error) {
          console.error("Failed to fetch user profile from storage", error);
          setCurrentUser(null);
          setRole(null);
          persistAuth(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to hydrate auth storage", error);
      persistAuth(null);
      setIsLoading(false);
    }
  }, [fetchCurrentUser, persistAuth]);

  useEffect(() => {
    void hydrateFromStorage();
  }, [hydrateFromStorage]);

  const setAuth = useCallback(
    (user: TUser, userToken?: string | null) => {
      setCurrentUser(user);
      setRole(user.role);
      const effectiveToken = userToken !== undefined ? userToken : token;
      if (userToken !== undefined) {
        setToken(userToken ?? null);
      }
      const stored: StoredAuth = { userId: user._id, role: user.role };
      if (effectiveToken) {
        stored.token = effectiveToken;
      }
      persistAuth(stored);
      if (effectiveToken) {
        void fetchCurrentUser();
      }
    },
    [fetchCurrentUser, persistAuth, token],
  );

  const clearAuth = useCallback(() => {
    setCurrentUser(null);
    setToken(null);
    setRole(null);
    persistAuth(null);
  }, [persistAuth]);

  const refreshUser = useCallback(
    async (userId?: string) => {
      if (userId && userId !== currentUser?._id) {
        try {
          setIsLoading(true);
          const response = await UserApi.getUserById(userId);
          setCurrentUser(response.data.data);
          setRole(response.data.data.role);
        } catch (error) {
          console.error("Failed to refresh user by id", error);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      const parsed = stored ? (JSON.parse(stored) as StoredAuth) : null;
      if (!(parsed?.token ?? token)) {
        return;
      }

      await fetchCurrentUser();
    },
    [currentUser?._id, fetchCurrentUser, token],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      token,
      role,
      isLoading,
      isVerified: currentUser?.status === "verified",
      setAuth,
      refreshUser,
      clearAuth,
    }),
    [clearAuth, currentUser, isLoading, refreshUser, role, setAuth, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};

