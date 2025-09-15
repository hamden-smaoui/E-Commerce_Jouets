"use client";
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import authService, { UpdateUserData } from '../services/auth-service';

interface User {
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
}

interface RegisterUserData {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  motDePasse: string;
   adresseRue?: string;
  adresseVille?: string;
  adresseCodePostal?: string;
  adressePays?: string;
  role?: 'admin' | 'client' | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, motDePasse: string) => Promise<void>;
  register: (userData: RegisterUserData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: UpdateUserData) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser && authService.isAuthenticated()) {
        setUser(currentUser);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, motDePasse: string) => {
    const response = await authService.login({ email, motDePasse });
    setUser(response.user);
  };

  const register = async (userData: RegisterUserData) => {
    const response = await authService.register(userData);
    setUser(response.user);
  };

  const updateUser = async (userData: UpdateUserData) => {
    const updatedUser = await authService.updateProfile(userData);
    setUser(updatedUser);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    updateUser,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};