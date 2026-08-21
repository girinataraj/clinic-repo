import { Preferences } from '@capacitor/preferences';
import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ─── In-memory token store ─────────────────────────────────────────────────────
let _accessToken: string | null = null;
let _refreshToken: string | null = null;
let _cachedRefreshToken: string | null = null;

// Capacitor Preferences is the single persistent store for the refresh token:
// native-backed on Android, and the plugin supplies its own web implementation.
// The token is deliberately NOT mirrored into localStorage — see CLAUDE.md.
export const initTokenStorage = async (): Promise<string | null> => {
  try {
    const { value } = await Preferences.get({ key: 'refreshToken' });
    _cachedRefreshToken = value;
    return value;
  } catch {
    _cachedRefreshToken = null;
    return null;
  }
};

export const setAccessToken = (token: string | null): void => {
  _accessToken = token;
};

export const setRefreshToken = (token: string | null): void => {
  _refreshToken = token;
  _cachedRefreshToken = token;
  if (token) {
    Preferences.set({ key: 'refreshToken', value: token }).catch(() => {});
  } else {
    Preferences.remove({ key: 'refreshToken' }).catch(() => {});
  }
};

export const getAccessToken = (): string | null => _accessToken;

// Synchronous by contract; reads the in-memory cache that initTokenStorage()
// primes on startup and that setRefreshToken() keeps current.
export const getRefreshToken = (): string | null => {
  return _refreshToken || _cachedRefreshToken;
};

// ─── Axios instance ────────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends refresh-token cookie automatically
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ─── Request interceptor — attach Bearer token ────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (_accessToken) {
      config.headers.Authorization = `Bearer ${_accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor — silent token refresh on 401 ──────────────────────
let _isRefreshing = false;
type QueueItem = { resolve: (token: string) => void; reject: (err: unknown) => void };
let _failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  for (const item of _failedQueue) {
    if (error) item.reject(error);
    else item.resolve(token!);
  }
  _failedQueue = [];
};

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only attempt refresh once per request; ignore auth endpoints to avoid loops
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/')
    ) {
      if (_isRefreshing) {
        // Queue the request until refresh completes
        return new Promise<AxiosResponse>((resolve, reject) => {
          _failedQueue.push({
            resolve: (token) => {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(api(original));
            },
            reject,
          });
        });
      }

      original._retry = true;
      _isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        const { data } = await axios.post<{ success: boolean; data: { accessToken: string; refreshToken?: string } }>(
          `${BASE_URL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );
        const newToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;

        setAccessToken(newToken);
        if (newRefreshToken) {
          setRefreshToken(newRefreshToken);
        }

        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        setAccessToken(null);
        // Only clear refresh token if explicitly rejected (401).
        // Network errors or 500s shouldn't wipe the user's session from storage.
        if (refreshError.response?.status === 401) {
          setRefreshToken(null);
        }
        // Let AuthContext handle the redirect — don't force window.location here
        return Promise.reject(refreshError);
      } finally {
        _isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
