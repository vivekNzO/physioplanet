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

// Add tenant ID to all requests from localStorage
axiosInstance.interceptors.request.use((config) => {
  const tenantId = localStorage.getItem('tenantId');
  if (tenantId) {
    config.headers['x-tenant-id'] = tenantId;
  }
  return config;
});

export default axiosInstance;

