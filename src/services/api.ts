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

// NE LIS PLUS LE TOKEN DANS LOCALSTORAGE
// Tu passeras le token dans le header "Authorization" à chaque requête axios

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Toast global pour toutes les erreurs
    const errorMsg = error.response?.data?.message || error.message || 'Erreur inconnue';
    if (typeof window !== "undefined") {
      toast.error(errorMsg);
    }

    // Déconnexion globale sur 401 (redirige vers signIn)
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        toast.error('Session expirée, veuillez vous reconnecter.');
       // window.location.href = '/signIn';
      }
    }

    return Promise.reject(error);
  }
);

export default api;