import axios from 'axios';
import { toast } from 'react-hot-toast';
import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: true,
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

// Intercepteur REQUEST
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

// Intercepteur RESPONSE avec refresh intelligent
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
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
        console.log("🔄 Token expiré, tentative de refresh...");
        
        // ✅ ÉTAPE 1: Essaie d'abord avec le refreshToken cookie (email/password)
        try {
          const { data } = await axios.post(
            `/api/auth/refresh-token-proxy`,
            {},
            { withCredentials: true }
          );

          const newToken = data.token;
          console.log("✅ Refresh réussi via refreshToken cookie");

          sessionStorage.setItem('accessToken', newToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          processQueue(null, newToken);
          return api(originalRequest);

        } catch (refreshError: any) {
          console.log("⚠️ Refresh via cookie échoué, tentative via session NextAuth...");
          
          // ✅ ÉTAPE 2: Si échec, essaie avec la session NextAuth (Google/Facebook)
          try {
            const session = await getSession();
            
            // ✅ Debug: Affiche les infos de session
            console.log("🔍 Session NextAuth:", session);
            console.log("🔍 Session expires:", session?.expires);
            console.log("🔍 Maintenant:", new Date().toISOString());
            
            // ✅ Vérifie que la session existe et est valide
            if (!session || !session.userId) {
              console.error("❌ Session NextAuth invalide ou expirée");
              throw new Error('Session NextAuth expirée');
            }

            console.log("✅ Session NextAuth valide, demande nouveau token...");
            
            const { data } = await axios.post(
              `/api/auth/refresh-token-from-session-proxy`,
              { userId: session.userId }
            );

            const newToken = data.token;
            console.log("✅ Refresh réussi via session NextAuth");

            sessionStorage.setItem('accessToken', newToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            processQueue(null, newToken);
            return api(originalRequest);
            
          } catch (sessionError) {
            console.error("❌ Erreur session NextAuth:", sessionError);
            throw sessionError; // Propage l'erreur pour déconnecter
          }
        }

      } catch (finalError) {
        console.error("❌ Échec complet du refresh:", finalError);
        processQueue(finalError, null);
        
        sessionStorage.removeItem('accessToken');
        
        if (typeof window !== "undefined") {
          toast.error('Session expirée, veuillez vous reconnecter.', { id: "session-expired" });
          window.location.href = '/signIn';
        }
        
        return Promise.reject(finalError);
      } finally {
        isRefreshing = false;
      }
    }

    // Gestion des autres erreurs
    if (error.code === 'ECONNABORTED') {
      const errorMsg = "La connexion est trop lente ou le serveur ne répond pas.";
      if (typeof window !== "undefined") {
        toast.error(errorMsg, { id: "timeout" });
      }
    } else if (error.response?.status !== 401) {
      const errorMsg = error.response?.data?.message || error.message || 'Erreur inconnue';
      if (typeof window !== "undefined") {
        toast.error(errorMsg, { id: "api-error" });
      }
    }

    return Promise.reject(error);
  }
);

export default api;