import api from './api';

export interface RegisterData {
  prenom: string;
  nom: string;
  email: string;
  motDePasse: string;
  telephone: string;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
}

class AuthService {
  // ✅ Inscription
  async register(userData: RegisterData): Promise<{ message: string; token: string; user: any }> {
    const response = await api.post('/auth/register', userData);
    
    // Sauvegarde l'access token
    if (response.data.token) {
      sessionStorage.setItem('accessToken', response.data.token);
    }
    
    return response.data;
  }

 async login(emailOrPhone: string, motDePasse: string): Promise<{ token: string; user: any }> {
  const response = await api.post('/auth/login', { emailOrPhone, motDePasse });
  
  if (response.data.token) {
    sessionStorage.setItem('accessToken', response.data.token);
  }
  
  return response.data;
}

  // ✅ Déconnexion
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      sessionStorage.removeItem('accessToken');
      localStorage.removeItem('accessToken');
    }
  }

  // ✅ Refresh token (géré automatiquement par l'intercepteur)
  async refreshToken(): Promise<string> {
    const response = await api.post('/auth/refresh-token');
    const newToken = response.data.token;
    sessionStorage.setItem('accessToken', newToken);
    return newToken;
  }

  // Mot de passe oublié
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  }

  // Réinitialisation du mot de passe
  async resetPassword(resetData: ResetPasswordData): Promise<{ message: string }> {
    const response = await api.post('/auth/reset-password', resetData);
    return response.data;
  }

  // ✅ Profil (plus besoin de passer le token manuellement)
  async getProfile(): Promise<any> {
    const response = await api.get('/auth/profile');
    return response.data;
  }

  // ✅ Update profil
  async updateProfile(userData: any): Promise<any> {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  }

  // ✅ Changer mot de passe
  async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    const response = await api.put('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  }
}

export default new AuthService();