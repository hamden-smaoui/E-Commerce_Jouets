import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Déconnexion globale sur 401
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Session expirée, veuillez vous reconnecter.');
        window.location.href = '/signIn';
      }
    }

    // 2. Toast global pour toutes les autres erreurs
    const errorMsg = error.response?.data?.message || error.message || 'Erreur inconnue';
    if (typeof window !== "undefined") {
      toast.error(errorMsg);
    }

    return Promise.reject(error);
  }
);

export default api;