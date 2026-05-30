import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

export const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';

// Request Interceptor: Attach JWT Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Handle Errors consistently
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response) {
    // Server responded with a status code outside the 2xx range
    const status = error.response.status;
    const data = error.response.data;

    if (status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // Attach a friendly message to the error object for components to use
    error.message = data?.message || data?.error || `Error ${status}: ${error.response.statusText}`;
  } else if (error.request) {
    // Request was made but no response received
    error.message = "No response from server. Please check your connection.";
  } else {
    // Something else happened in setting up the request
    error.message = error.message || "An unexpected error occurred.";
  }
  
  return Promise.reject(error);
});

export default api;
