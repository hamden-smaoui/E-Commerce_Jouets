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

   async loginWithBackend(emailOrPhone: string, motDePasse: string): Promise<{ token: string; user: any }> {
    const response = await fetch('/api/auth/login-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // ✅ Important pour recevoir les cookies
      body: JSON.stringify({
        emailOrPhone,
        motDePasse
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur de connexion');
    }

    if (data.token) {
      sessionStorage.setItem('accessToken', data.token);
    }

    return data;
  }
  // ============ REGISTER ============
  async register(userData: RegisterData): Promise<{ message: string; user: any }> {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }

  // ============ LOGIN ============
  async login(emailOrPhone: string, motDePasse: string): Promise<{ token: string; user: any }> {
    const response = await api.post('/auth/login', { emailOrPhone, motDePasse });
    
    if (response.data.token) {
      sessionStorage.setItem('accessToken', response.data.token);
    }
    
    return response.data;
  }

  // ============ LOGOUT ============
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      sessionStorage.removeItem('accessToken');
    }
  }

  // ============ REFRESH TOKEN ============
  async refreshToken(): Promise<string> {
    const response = await api.post('/auth/refresh-token');
    const newToken = response.data.token;
    sessionStorage.setItem('accessToken', newToken);
    return newToken;
  }

  // ============ FORGOT PASSWORD ============
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  }

  // ============ RESET PASSWORD ============
  async resetPassword(resetData: ResetPasswordData): Promise<{ message: string }> {
    const response = await api.post('/auth/reset-password', resetData);
    return response.data;
  }

  // ============ GET PROFILE ============
  async getProfile(): Promise<any> {
    const response = await api.get('/auth/profile');
    return response.data;
  }

  // ============ UPDATE PROFILE ============
  async updateProfile(userData: any): Promise<any> {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  }

  // ============ CHANGE PASSWORD ============
  async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    const response = await api.put('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  }
}

export default new AuthService();