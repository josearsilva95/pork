import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

function createApiClient(): AxiosInstance {
  const client = axios.create({ baseURL: BASE_URL, timeout: 15_000 });

  client.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config;
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;
        try {
          const refreshToken = localStorage.getItem("refresh_token");
          if (!refreshToken) throw new Error("No refresh token");
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken });
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return client(original);
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
}

export const api = createApiClient();

// Auth
export const authApi = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),
  register: (email: string, password: string, full_name: string) =>
    api.post("/auth/register", { email, password, full_name }),
  me: () => api.get("/auth/me"),
  refresh: (refresh_token: string) => api.post("/auth/refresh", { refresh_token }),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
};

// Dashboard
export const dashboardApi = {
  getSummary: () => api.get("/dashboard/summary"),
};

// Accounts
export const accountsApi = {
  list: () => api.get("/accounts"),
  create: (data: any) => api.post("/accounts", data),
  update: (id: string, data: any) => api.patch(`/accounts/${id}`, data),
  delete: (id: string) => api.delete(`/accounts/${id}`),
};

// Transactions
export const transactionsApi = {
  list: (params?: any) => api.get("/transactions", { params }),
  create: (data: any) => api.post("/transactions", data),
  update: (id: string, data: any) => api.patch(`/transactions/${id}`, data),
  delete: (id: string) => api.delete(`/transactions/${id}`),
};

// Investments
export const investmentsApi = {
  list: () => api.get("/investments"),
  create: (data: any) => api.post("/investments", data),
  update: (id: string, data: any) => api.patch(`/investments/${id}`, data),
  delete: (id: string) => api.delete(`/investments/${id}`),
};