import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/users/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response.status === 401 &&
      error.response.data.code === "token_not_valid" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh");
      if (refreshToken) {
        try {
          const response = await API.post("token/refresh/", { refresh: refreshToken });
          localStorage.setItem("token", response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return API(originalRequest);
        } catch (err) {
          console.error("Ошибка при обновлении токена:", err);
          localStorage.clear();
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

API.interceptors.request.use((config) => {
  if (config.url.endsWith('/register/')) {
    return config;
  }

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;