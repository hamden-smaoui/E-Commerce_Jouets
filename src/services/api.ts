// services/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Créer une instance axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Intercepteur pour ajouter automatiquement le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      // Rediriger vers la page de connexion si nécessaire
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default api;