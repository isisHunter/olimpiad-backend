import axios from 'axios';

const API = axios.create({
  baseURL: '/api/users/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && error.response.data.code === 'token_not_valid' && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh');
        const response = await axios.post('/api/users/token/refresh/', {refresh: refreshToken});
        localStorage.setItem('token', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return API(originalRequest);
      } catch (refreshError) {
        localStorage.clear()
        window.location.href = '/enter';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default API;