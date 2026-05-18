import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  logout: () => apiClient.post('/auth/logout'),
  getCurrentUser: () => apiClient.get('/auth/user'),
};

export const queueService = {
  getWaiting: () => apiClient.get('/queue/waiting'),
  getServing: () => apiClient.get('/queue/serving'),
  callNext: (counterId: number) => apiClient.post(`/queue/call-next/${counterId}`),
  completeService: (ticketId: number) => apiClient.post(`/queue/complete/${ticketId}`),
  getTickets: () => apiClient.get('/queue/tickets'),
  addTicket: (data: any) => apiClient.post('/queue/tickets', data),
};

export const counterService = {
  getCounters: () => apiClient.get('/counters'),
  updateCounter: (id: number, data: any) => apiClient.put(`/counters/${id}`, data),
};

export default apiClient;
