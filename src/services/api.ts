import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: true, // IMPORTANT pour les cookies
});

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: any = null, token: string | null = null): void => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

// Intercepteur REQUEST : Ajoute l'access token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur RESPONSE : Gère le refresh automatique
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Token expiré (401) → tente un refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Mise en file d'attente si refresh en cours
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // ✅ Appelle le proxy refresh token
        const { data } = await axios.post(
          `/api/auth/refresh-token-proxy`,
          {},
          { withCredentials: true }
        );

        const newToken = data.token;

        // Sauvegarde le nouveau token
        sessionStorage.setItem('accessToken', newToken);
        
        // Met à jour l'authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Refresh token invalide → déconnexion
        sessionStorage.removeItem('accessToken');
        
        if (typeof window !== "undefined") {
          toast.error('Session expirée, veuillez vous reconnecter.', { id: "session-expired" });
          window.location.href = '/signIn';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 2. Timeout
    if (error.code === 'ECONNABORTED') {
      const errorMsg = "La connexion est trop lente ou le serveur ne répond pas.";
      if (typeof window !== "undefined") {
        toast.error(errorMsg, { id: "timeout" });
      }
    }
    // 3. Autres erreurs
    else if (error.response?.status !== 401) {
      const errorMsg = error.response?.data?.message || error.message || 'Erreur inconnue';
      if (typeof window !== "undefined") {
        toast.error(errorMsg, { id: "api-error" });
      }
    }

    return Promise.reject(error);
  }
);

export default api;