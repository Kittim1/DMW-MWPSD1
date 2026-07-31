import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000/api"
    : `${window.location.origin}/api`);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401 Unauthorized responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error && error.response && error.response.status === 401) {
      // remove invalid token and redirect to login page
      localStorage.removeItem("auth_token");
      // set full path so Vite/React Router handles it correctly
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const authService = {
  login: (email: string, password: string) =>
    apiClient.post("/auth/login", { email, password }),
  logout: () => apiClient.post("/auth/logout"),
  getCurrentUser: () => apiClient.get("/auth/user"),
  updateProfile: (data: any) => apiClient.put("/auth/profile", data),
};

export const queueService = {
  getStatus: () => apiClient.get(`/queue/status?t=${Date.now()}`),
  getWaiting: () => apiClient.get(`/queue/waiting?t=${Date.now()}`),
  getServing: () => apiClient.get(`/queue/serving?t=${Date.now()}`),
  callNext: (counterId: number) =>
    apiClient.post(`/queue/call-next/${counterId}`),
  completeService: (ticketId: number) =>
    apiClient.post(`/queue/complete/${ticketId}`),
  skipTicket: (ticketId: number) => apiClient.post(`/queue/skip/${ticketId}`),
  cancelTicket: (ticketId: number) =>
    apiClient.post(`/queue/cancel/${ticketId}`),
  caterTicket: (ticketId: number, counterId: number) =>
    apiClient.post(`/queue/cater/${ticketId}/${counterId}`),
  resetQueue: () => apiClient.post("/queue/reset"),
  forwardTicket: (ticketId: number, targetCounterId: number) =>
    apiClient.post(`/queue/forward/${ticketId}`, { target_counter_id: targetCounterId }),
  getReports: (type: string, counterId?: number) => {
    let url = `/queue/reports?type=${type}`;
    if (counterId) {
      url += `&counter_id=${counterId}`;
    }
    return apiClient.get(url);
  },
  getLogs: () => apiClient.get("/queue/logs"),
  getTickets: () => apiClient.get("/queue/tickets"),
  addTicket: (data: any) =>
    apiClient.post("/queue/tickets", data),
};

export const counterService = {
  getCounters: () => apiClient.get("/counters"),
  updateCounter: (id: number, data: any) =>
    apiClient.put(`/counters/${id}`, data),
};

export const serviceService = {
  getServices: () => apiClient.get("/services"),
  addService: (name: string) => apiClient.post("/services", { name }),
  updateService: (id: number, name: string) => apiClient.put(`/services/${id}`, { name }),
  deleteService: (id: number) => apiClient.delete(`/services/${id}`),
};

export default apiClient;
