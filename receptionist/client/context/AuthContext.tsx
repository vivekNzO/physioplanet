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
  sendPhoneOtp: (phone: string) => Promise<void>;
  loginWithPhone: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setLoading(true);
    try {
      // First, fetch tenant ID based on current domain
      const fetchedTenantId = await fetchTenantByDomain();
      // Then fetch the session
      await refreshSession();
    } catch (error) {
      console.error('Auth initialization error:', error);
      setUser(null);
      // Don't set tenantId to null here, let fetchTenantByDomain handle the fallback
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantByDomain = async () => {
    try {
      const currentDomain = window.location.port 
        ? `${window.location.hostname}:${window.location.port}` 
        : window.location.hostname;
      const res = await axiosInstance.get(`/tenant/by-domain?domain=${currentDomain}`);
      
      if (res.data?.success && res.data?.tenantId) {
        setTenantId(res.data.tenantId);
        localStorage.setItem('tenantId', res.data.tenantId);
        return res.data.tenantId;
      }
    } catch (error) {
      console.error('Error fetching tenant by domain:', error);
      // Fallback to localStorage if available
      const storedTenantId = localStorage.getItem('tenantId');
      if (storedTenantId) {
        setTenantId(storedTenantId);
        return storedTenantId;
      }
    }
    const fallbackTenantId = 'cmi7et46x0000pj2zmdsp82rm';
    setTenantId(fallbackTenantId);
    localStorage.setItem('tenantId', fallbackTenantId);
    return fallbackTenantId;
  };

  const refreshSession = async () => {
    try {
      const res = await axiosInstance.get("/auth/session");
      setUser(res.data?.user ?? null);
      
      // If tenant ID is not set yet, try to get it from session or fetch by domain
      if (!tenantId) {
        const sessionTenantId = res.data?.user?.currentTenantId;
        if (sessionTenantId) {
          setTenantId(sessionTenantId);
        } else {
          await fetchTenantByDomain();
        }
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      setUser(null);
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

      // Fetch tenant ID by domain instead of hardcoding
      const fetchedTenantId = await fetchTenantByDomain();
      
      if (fetchedTenantId) {
        // Set the current tenant ID
        await axiosInstance.post('/tenant/current', { tenantId: fetchedTenantId });
      }
    } catch (err: any) {
      const msg = err?.message || 'Login failed';
      throw new Error(msg);
    }
  };

  const sendPhoneOtp = async (phone: string) => {
    try {
      const res = await axiosInstance.post('/auth/phone/send-otp', { phone });
      if (!res.data?.success) {
        throw new Error(res.data?.error || 'Failed to send OTP');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to send OTP';
      throw new Error(msg);
    }
  };

  const loginWithPhone = async (phone: string, otp: string) => {
    try {
      // Get CSRF token
      const csrfRes = await axiosInstance.get('/auth/csrf');
      const { csrfToken } = csrfRes.data;

      // Login with phone OTP - use phone-otp provider
      const res = await axiosInstance.post('/auth/callback/phone-otp',
        new URLSearchParams({
          csrfToken,
          phone,
          otp,
          redirect: 'false',
          json: 'true',
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          maxRedirects: 0,
          validateStatus: status => status < 400
        }
      );

      // Check if login was successful
      if (res.status === 401 || res.status === 403) {
        throw new Error('Invalid OTP or phone number');
      }

      // After successful login, fetch the session
      await refreshSession();

      // Fetch tenant ID by domain
      const fetchedTenantId = await fetchTenantByDomain();
      
      if (fetchedTenantId) {
        // Set the current tenant ID
        await axiosInstance.post('/tenant/current', { tenantId: fetchedTenantId });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Login failed';
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
      // Always clear local state and localStorage
      setUser(null);
      setTenantId(null);
      localStorage.removeItem('tenantId');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, tenantId, login, sendPhoneOtp, loginWithPhone, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
} 