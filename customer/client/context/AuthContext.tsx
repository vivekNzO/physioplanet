// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";

type AuthContextType = {
  loading: boolean;
  tenantId: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setLoading(true);
    try {
      // Fetch tenant ID based on current domain
      await fetchTenantByDomain();
    } catch (error) {
      console.error('Auth initialization error:', error);
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
        // Store in localStorage for future use
        localStorage.setItem('tenantId', res.data.tenantId);
        return res.data.tenantId;
      }
    } catch (error) {
      console.error('Error fetching tenant by domain:', error);
      const storedTenantId = localStorage.getItem('tenantId');
      if (storedTenantId) {
        setTenantId(storedTenantId);
        return storedTenantId;
      }
    }
    // Fallback to default tenant ID
    const fallbackTenantId = 'cmi7et46x0000pj2zmdsp82rm';
    setTenantId(fallbackTenantId);
    localStorage.setItem('tenantId', fallbackTenantId);
    return fallbackTenantId;
  };

  return (
    <AuthContext.Provider value={{ loading, tenantId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}