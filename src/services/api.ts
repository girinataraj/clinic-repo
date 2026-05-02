import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ─── In-memory token store ─────────────────────────────────────────────────────
let _accessToken: string | null = null; 

export const setAccessToken = (token: string | null): void => {
  _accessToken = token;
};

export const getAccessToken = (): string | null => _accessToken;

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
        const { data } = await axios.post<{ success: boolean; data: { accessToken: string } }>(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.data.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
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
