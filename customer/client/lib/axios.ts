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

export default axiosInstance;

