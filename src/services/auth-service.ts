import api from './api';

export interface LoginData {
  email: string;
  motDePasse: string;
}

export interface RegisterData {
  prenom: string;
  nom: string;
  email: string;
  motDePasse: string;
  telephone: string;
}

export interface UpdateUserData {
  prenom?: string;
  nom?: string;
  email?: string;
  telephone?: string;
  adresseRue?: string;
  adresseVille?: string;
  adresseCodePostal?: string;
  adressePays?: string;
  role?: 'admin' | 'client' | null;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    idUtilisateur: number;
    prenom: string;
    nom: string;
    email?: string;
    telephone: string;
    adresseRue?: string;
    adresseVille?: string;
    adresseCodePostal?: string;
    adressePays?: string;
    role: 'admin' | 'client' | null;
  };
}
export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
}
export interface GoogleSignInData {
  email: string;
  name?: string;
  googleId: string;
  image?: string;
}

class AuthService {
  // Connexion
  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      const data = response.data;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la connexion');
    }
  }

  // Inscription
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      const data = response.data;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erreur lors de l'inscription");
    }
  }

  // Mise à jour du profil
  async updateProfile(userData: UpdateUserData): Promise<AuthResponse['user']> {
    try {
      const response = await api.put<{ user: AuthResponse['user'] }>('/auth/profile', userData);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    }
  }

  // Déconnexion
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): AuthResponse['user'] | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  // Plus besoin de getAuthHeaders (axios s'en charge)

  // Obtenir le profil utilisateur
  async getProfile(): Promise<AuthResponse['user']> {
    try {
      const response = await api.get<{ user: AuthResponse['user'] }>('/auth/profile');
      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du profil');
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la demande de réinitialisation');
    }
  }

  async resetPassword(resetData: ResetPasswordData): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/auth/reset-password', resetData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe');
    }
  }

  async googleSignIn(userData: GoogleSignInData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/google-auth', userData);
      const data = response.data;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la connexion Google');
    }
  }
}

export default new AuthService();