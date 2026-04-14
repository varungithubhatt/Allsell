import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("allsell_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong"
  );
};

const toProductFormData = (payload) => {
  const formData = new FormData();

  if (payload.title !== undefined) {
    formData.append("title", payload.title);
  }
  if (payload.price !== undefined) {
    formData.append("price", String(payload.price));
  }
  if (Array.isArray(payload.imageFiles)) {
    payload.imageFiles.slice(0, 3).forEach((file) => {
      formData.append("images", file);
    });
  }

  return formData;
};

export const authApi = {
  getAdminStatus: async () => {
    try {
      const { data } = await api.get("/auth/admin-status");
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
  register: async (payload) => {
    try {
      const { data } = await api.post("/auth/register", payload);
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
  login: async (payload) => {
    try {
      const { data } = await api.post("/auth/login", payload);
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

export const shopsApi = {
  create: async (payload) => {
    try {
      const { data } = await api.post("/shops", payload);
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
  getAll: async () => {
    try {
      const { data } = await api.get("/shops");
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
  getById: async (id) => {
    try {
      const { data } = await api.get(`/shops/${id}`);
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
  update: async (id, payload) => {
    try {
      const { data } = await api.put(`/shops/${id}`, payload);
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
  remove: async (id) => {
    try {
      const { data } = await api.delete(`/shops/${id}`);
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

export const productsApi = {
  create: async (payload) => {
    try {
      const { data } = await api.post("/products", toProductFormData(payload));
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
  getAll: async (params = {}) => {
    try {
      const { data } = await api.get("/products", { params });
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
  update: async (id, payload) => {
    try {
      const { data } = await api.put(`/products/${id}`, toProductFormData(payload));
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
  remove: async (id) => {
    try {
      const { data } = await api.delete(`/products/${id}`);
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

export default api;
