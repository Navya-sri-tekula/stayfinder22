import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stayfinder_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on optional auth endpoints
      const isAuthPath = error.config.url.includes('/auth/profile');
      if (isAuthPath) {
        localStorage.removeItem('stayfinder_token');
        localStorage.removeItem('stayfinder_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
