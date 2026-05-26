// axiosSetup.ts
import axios, { AxiosInstance, AxiosRequestHeaders, InternalAxiosRequestConfig } from "axios";
import { getTokenFromCookies } from "./cookies";

let cachedToken: string | null = null;

// Clear cached token (call after login/logout to force re-read from cookies)
export const clearCachedToken = () => {
  cachedToken = null;
};

// Fetch token from cookies or cache
const fetchToken = async (): Promise<string | null> => {
  if (cachedToken) return cachedToken;

  const tokenData = await getTokenFromCookies(); // { token, email, role } | null
  cachedToken = tokenData?.token ?? null;
  return cachedToken;
};

// Create Axios instances
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL + "/api",
  headers: { "Content-Type": "application/json" },
});

export const axiosMultipartInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL + "/api",
  headers: { "Content-Type": "multipart/form-data" },
});

export const axiosAuthInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL + "/api",
  headers: { "Content-Type": "application/json" },
});

// Generic function to add interceptor to any instance
const addAuthInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await fetchToken();

      // Ensure headers exist and are mutable
      if (!config.headers) {
        config.headers = new axios.AxiosHeaders();
      }

      if (token) {
        config.headers.set("Authorization", `Token ${token}`);
      }

      // DEBUG: log headers before request is sent
      // console.log(`[Axios Interceptor] Request headers:`, config.headers);

      return config;
    },
    error => Promise.reject(error),
  );
};

// Attach interceptor to all instances
addAuthInterceptor(axiosInstance);
addAuthInterceptor(axiosAuthInstance);
addAuthInterceptor(axiosMultipartInstance);

export default axiosAuthInstance;

