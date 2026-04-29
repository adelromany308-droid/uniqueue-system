import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updatePassword: (data) => api.put('/auth/updatepassword', data),
};

// Services API calls
export const servicesAPI = {
  getAll: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
  toggleQueue: (id) => api.patch(`/services/${id}/toggle-queue`),
  getQueueStatus: (id) => api.get(`/services/${id}/queue-status`),
};

// Tokens API calls
export const tokensAPI = {
  book: (data) => api.post('/tokens', data),
  getAll: (params) => api.get('/tokens', { params }),
  getById: (id) => api.get(`/tokens/${id}`),
  cancel: (id, data) => api.delete(`/tokens/${id}`, { data }),
  callNext: (data) => api.post('/tokens/call-next', data),
  startService: (id) => api.post(`/tokens/${id}/start-service`),
  complete: (id) => api.post(`/tokens/${id}/complete`),
  getStats: (params) => api.get('/tokens/stats/overview', { params }),
};

// Users API calls (Admin only)
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
  getDashboardStats: () => api.get('/users/dashboard-stats'),
};

// Feedback API calls
export const feedbackAPI = {
  submit: (data) => api.post('/feedback', data),
  getAll: (params) => api.get('/feedback', { params }),
  getById: (id) => api.get(`/feedback/${id}`),
  respond: (id, data) => api.put(`/feedback/${id}/respond`, data),
  toggleVisibility: (id) => api.patch(`/feedback/${id}/toggle-visibility`),
  getServiceStats: (serviceId) => api.get(`/feedback/stats/${serviceId}`),
  getDashboardStats: () => api.get('/feedback/dashboard/stats'),
};

export default api;
