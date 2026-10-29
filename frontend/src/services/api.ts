import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('certiflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle Unauthorized/Expired Token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url?.replace(/\/+$/, '') || '';
    const isLoginRequest = requestUrl.endsWith('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('certiflow_token');
      localStorage.removeItem('certiflow_user');
      if (window.location.pathname !== '/login' && !window.location.pathname.startsWith('/verify')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
