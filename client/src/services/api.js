import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export const loginUser = (data) => api.post("/auth/login", data);
export const getMe = () => api.get("/auth/me");

export const getUsers = (params) => api.get("/users", { params });
export const getEmployees = () => api.get("/users/employees");
export const createUser = (data) => api.post("/users", data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

export const getDashboard = () => api.get("/dashboard");

export const createVisitor = (data) => api.post("/visitors", data);
export const getAllVisitors = () => api.get("/visitors");
export const getMyRequests = () => api.get("/visitors/my-requests");
export const searchVisitors = (params) => api.get("/visitors/search", { params });
export const getVisitorReports = (params) => api.get("/visitors/reports", { params });
export const getVisitorActivity = (id) => api.get(`/visitors/${id}/activity`);
export const approveVisitor = (id, remarks) => api.put(`/visitors/${id}/approve`, { remarks });
export const rejectVisitor = (id, remarks) => api.put(`/visitors/${id}/reject`, { remarks });
export const checkInVisitor = (id) => api.put(`/visitors/${id}/checkin`);
export const checkOutVisitor = (id) => api.put(`/visitors/${id}/checkout`);
export const cancelVisitor = (id) => api.put(`/visitors/${id}/cancel`);

export default api;
