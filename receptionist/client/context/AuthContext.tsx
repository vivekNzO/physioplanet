// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";

type Role = {
  id: string;
  name: string;
  displayName: string;
  isSystem: boolean;
};

type User = {
  id: string;
  email?: string;
  name?: string;
  role?: Role;
  image?: string;
  currentTenantId?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  tenantId: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    refreshSession();
  }, []);

  const refreshSession = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/auth/session");
      setUser(res.data?.user ?? null);
      setTenantId(res.data?.user?.currentTenantId ?? "cmi7glb2m0071fpeapl4d0y9j"); //TODO
    } catch {
      setUser(null);
      setTenantId(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      // Get CSRF token
        const csrfRes = await axiosInstance.get('/auth/csrf');
        const { csrfToken } = csrfRes.data;

      // Login with credentials - tell NextAuth NOT to redirect
      const res = await axiosInstance.post('/auth/callback/credentials',
        new URLSearchParams({
          csrfToken,
          username,
          password,
          redirect: 'false', // Tell NextAuth not to redirect
          json: 'true', // Request JSON response
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          maxRedirects: 0,
          validateStatus: status => status < 400 // allow 302
        }
      );

      // Check if login was successful (NextAuth returns 200 for JSON, 302 for redirect)
      if (res.status === 401 || res.status === 403) {
        throw new Error('Invalid credentials');
      }

      // After successful login, fetch the session
      await refreshSession();

      // Set the current tenant ID (hardcoded for now, can be dynamic later)
      const tenantId = "cmi7glb2m0071fpeapl4d0y9j";
      await axiosInstance.post('/tenant/current', { tenantId });
    } catch (err: any) {
      const msg = err?.message || 'Login failed';
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      // Get CSRF token for signout
      const csrfRes = await axiosInstance.get('/auth/csrf');
      const { csrfToken } = csrfRes.data;

      // Call signout endpoint with CSRF token and prevent redirect
      await axiosInstance.post('/auth/signout',
        new URLSearchParams({
          csrfToken,
          json: 'true', // Request JSON response
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Always clear local state
      setUser(null);
      setTenantId(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, tenantId, login, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}