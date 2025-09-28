import api from './api';

export interface RegisterData {
  prenom: string;
  nom: string;
  email: string;
  motDePasse: string;
  telephone: string;
}
export interface ForgotPasswordData {
  email: string;
}
export interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
}

class AuthService {
  // Inscription (utilisée par NextAuth CredentialsProvider)
  async register(userData: RegisterData): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/register', userData);
    return response.data;
  }

  // Mot de passe oublié (public)
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  }

  // Réinitialisation du mot de passe (public)
  async resetPassword(resetData: ResetPasswordData): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/reset-password', resetData);
    return response.data;
  }

  // Pour update le profil, utilise le token NextAuth
  async updateProfile(userData: any, token: string): Promise<any> {
    const response = await api.put('/auth/profile', userData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Pour obtenir le profil utilisateur, utilise le token NextAuth
  async getProfile(token: string): Promise<any> {
    const response = await api.get('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
}

export default new AuthService();