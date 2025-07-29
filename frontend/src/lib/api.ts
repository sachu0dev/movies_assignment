import axios from "axios";

const API_URL =
  (import.meta as any).env.VITE_API_URL || "http://localhost:5000";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
};

// Entries API
export const entriesAPI = {
  create: (data: any) => api.post("/entries", data),

  getMy: (params?: { page?: number; limit?: number }) =>
    api.get("/entries/my", { params }),

  getCommunity: (params?: { page?: number; limit?: number }) =>
    api.get("/entries/community", { params }),

  getById: (id: number) => api.get(`/entries/${id}`),

  search: (params: {
    query?: string;
    type?: "Movie" | "TV";
    year?: string;
    director?: string;
    page?: number;
    limit?: number;
  }) => api.get("/entries/search", { params }),

  update: (id: number, data: any) => api.put(`/entries/${id}`, data),

  delete: (id: number) => api.delete(`/entries/${id}`),

  release: (id: number) => api.post(`/entries/${id}/release`),

  like: (id: number) => api.post(`/entries/${id}/like`),

  dislike: (id: number) => api.post(`/entries/${id}/dislike`),
};

// Upload API
export const uploadAPI = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  delete: (publicId: string) => api.delete(`/upload/${publicId}`),
};

export default api;
