import axios from 'axios';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { syncBiometricRefreshToken } from '@/features/auth/hooks/useBiometric';

const normalizeBaseURL = (url: string) => url.replace(/\/+$/, '');

const resolveApiBaseURL = () => {
  const explicit = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (explicit) {
    return normalizeBaseURL(explicit);
  }

  const target = (process.env.EXPO_PUBLIC_API_TARGET ?? 'production').toLowerCase();
  const devURL = process.env.EXPO_PUBLIC_API_URL_DEV?.trim();
  const prodURL = process.env.EXPO_PUBLIC_API_URL_PROD?.trim();

  if (target === 'development' && devURL) {
    return normalizeBaseURL(devURL);
  }

  if (prodURL) {
    return normalizeBaseURL(prodURL);
  }

  return 'https://napi.cris.ac/api/v1';
};

const BASE_URL = resolveApiBaseURL();

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

type RequestWithRetry = {
  _retry?: boolean;
  headers?: Record<string, string>;
  url?: string;
};

let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

const subscribeTokenRefresh = (callback: (token: string | null) => void) => {
  refreshSubscribers.push(callback);
};

const notifyTokenRefreshed = (token: string | null) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Interceptor para inyectar el Token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = useAuth.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores globales (ej: token expirado 401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = (error.config ?? {}) as RequestWithRetry;
    const requestURL = originalRequest.url ?? '';

    const isAuthEndpoint =
      requestURL.includes('/auth/login') ||
      requestURL.includes('/auth/refresh');

    if (status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      const { refreshToken, logout, updateSession } = useAuth.getState();

      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            if (!newToken) {
              reject(error);
              return;
            }

            originalRequest.headers = {
              ...(originalRequest.headers ?? {}),
              Authorization: `Bearer ${newToken}`,
            };
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await api.post('/auth/refresh', {
          refresh_token: refreshToken,
        });

        const refreshed = refreshResponse.data;

        if (!refreshed?.token || !refreshed?.refresh_token) {
          throw new Error('Refresh token response inválida');
        }

        updateSession({
          token: refreshed.token,
          refreshToken: refreshed.refresh_token,
          userId: refreshed.user_id,
          email: refreshed.email,
          role: refreshed.role,
          isAdmin: refreshed.is_admin,
        });

        // Keep biometric SecureStore token in sync (fire-and-forget)
        syncBiometricRefreshToken(refreshed.refresh_token).catch(() => {});

        notifyTokenRefreshed(refreshed.token);

        originalRequest.headers = {
          ...(originalRequest.headers ?? {}),
          Authorization: `Bearer ${refreshed.token}`,
        };

        return api(originalRequest);
      } catch (refreshError) {
        notifyTokenRefreshed(null);
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
