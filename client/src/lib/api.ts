import axios from 'axios';
import toast from 'react-hot-toast';

export const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true, // Crucial for sending HTTP-only JWT cookies
});

// Track refreshing state to prevent multiple concurrent refresh calls
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Response Interceptor for Error Handling and Token Refreshing
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 occurs and this request hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh if the request was to the auth routes themselves
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register') ||
        originalRequest.url?.includes('/auth/refresh')
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        isRefreshing = false;
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);
        // If refresh fails, clear authenticated page state and redirect to login
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    // If the server returns a specific error message, use it
    const errorMessage = error.response?.data?.error?.message || 'An unexpected error occurred';
    
    // Don't toast 401 Unauthorized errors automatically (handled by AuthGuard/Refresh)
    if (error.response?.status !== 401) {
      toast.error(errorMessage);
    }
    
    return Promise.reject(error);
  }
);
