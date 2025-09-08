const API_BASE_URL = 'http://localhost:3001/api';

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
  role?: 'admin' | 'client' | null; // Align with FormData
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
    role: 'admin' | 'client' | null; // Align with FormData
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
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la connexion');
      }

      const data = await response.json();
      
      // Stocker le token et les données utilisateur
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Erreur lors de la connexion: ${message}`);
    }
  }

  // Inscription
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'inscription');
      }

      const data = await response.json();
      
      // Stocker le token et les données utilisateur
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Erreur lors de l'inscription: ${message}`);
    }
  }

  // Mise à jour du profil
  async updateProfile(userData: UpdateUserData): Promise<AuthResponse['user']> {
        console.log('userData:', userData);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });
     
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour du profil');
      }

      const data = await response.json();
      console.log('Data:', data);

      // Mettre à jour les données utilisateur dans localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return data.user;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Erreur lors de la mise à jour du profil: ${message}`);
    }
  }

  // Déconnexion
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Obtenir le token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Obtenir les données utilisateur
  getCurrentUser(): AuthResponse['user'] | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  // Obtenir les en-têtes avec le token
  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    console.log('Token:', token);
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  // Obtenir le profil utilisateur
  async getProfile(): Promise<AuthResponse['user']> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération du profil');
      }

      const data = await response.json();
      return data.user;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Erreur lors de la récupération du profil: ${message}`);
    }
  }
async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la demande de réinitialisation');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Erreur: ${message}`);
    }
  }

  // Réinitialisation du mot de passe
  async resetPassword(resetData: ResetPasswordData): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resetData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la réinitialisation du mot de passe');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Erreur: ${message}`);
    }
  }

  // services/auth-service.ts - Ajouter cette méthode
async googleSignIn(userData: any): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/google-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la connexion Google');
    }

    const data = await response.json();
    
    // Stocker le token et les données utilisateur
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    throw new Error(`Erreur Google: ${message}`);
  }
}
}

export default new AuthService();