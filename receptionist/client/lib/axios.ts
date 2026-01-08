import axios from "axios";

// Central axios client so all requests share base URL and credentials
const baseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: `${baseUrl.replace(/\/$/, "")}/api`,
  withCredentials: true, // required so NextAuth cookies are sent
  headers: {
    "Content-Type": "application/json",
  },
});

// Module-level variable to store tenantId (updated from AuthContext)
let currentTenantId: string | null = null;

// Function to set tenantId (called from AuthContext)
export function setTenantIdForAxios(tenantId: string | null) {
  currentTenantId = tenantId;
}

// Add tenant ID to all requests via interceptor
axiosInstance.interceptors.request.use((config) => {
  if (currentTenantId) {
    config.headers['x-tenant-id'] = currentTenantId;
  }
  return config;
});

export default axiosInstance;

