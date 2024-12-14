import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/users/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;