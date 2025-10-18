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

  const fetchUser = useCallback(
    async (userId: string) => {
      try {
        setIsLoading(true);
        const response = await UserApi.getUserById(userId);
        setCurrentUser(response.data.data);
        setRole(response.data.data.role);
      } catch (error) {
        console.error("Failed to fetch user profile", error);
        setCurrentUser(null);
        setRole(null);
        persistAuth(null);
      } finally {
        setIsLoading(false);
      }
    },
    [persistAuth],
  );

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

      if (parsed.userId) {
        await fetchUser(parsed.userId);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to hydrate auth storage", error);
      persistAuth(null);
      setIsLoading(false);
    }
  }, [fetchUser, persistAuth]);

  useEffect(() => {
    void hydrateFromStorage();
  }, [hydrateFromStorage]);

  const setAuth = useCallback(
    (user: TUser, userToken?: string | null) => {
      setCurrentUser(user);
      setRole(user.role);
      if (userToken !== undefined) {
        setToken(userToken ?? null);
      }
      const stored: StoredAuth = { userId: user._id, role: user.role };
      if (userToken) {
        stored.token = userToken;
      }
      persistAuth(stored);
    },
    [persistAuth],
  );

  const clearAuth = useCallback(() => {
    setCurrentUser(null);
    setToken(null);
    setRole(null);
    persistAuth(null);
  }, [persistAuth]);

  const refreshUser = useCallback(
    async (userId?: string) => {
      const id = userId ?? currentUser?._id;
      if (!id) {
        return;
      }
      await fetchUser(id);
    },
    [currentUser?._id, fetchUser],
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

