import api from './api';

interface Commande {
  idCommande: number;
  dateCommande: string;
  statut: string;
}

export interface User {
  idUtilisateur: number;
  prenom: string;
  nom: string;
  email?: string;
  motDePasse?: string;
  telephone: string;
  adresseRue?: string;
  adresseVille?: string;
  adresseCodePostal?: string;
  adressePays?: string;
  role: 'admin' | 'client' | null;
}

export interface FormData {
  idUtilisateur: number | null;
  prenom: string;
  nom: string;
  email?: string | null;
  motDePasse?: string;
  telephone: string  | null;
  adresseRue?: string | null;
  adresseVille?: string | null;
  adresseCodePostal?: string  | null;
  adressePays?: string  | null;
  role: 'admin' | 'client' | null;
}

interface UserResponse extends User {
  commandes?: Commande[];
}

class UsersService {
  async createUser(userData: FormData, token?: string): Promise<UserResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post<{ data: UserResponse }>('/utilisateurs', userData, { headers });
    return response.data.data;
  }

  async getAllUsers(token?: string): Promise<UserResponse[]> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<UserResponse[]>('/utilisateurs', { headers });
    return response.data;
  }

  async getUserById(id: number, token?: string): Promise<UserResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<UserResponse>(`/utilisateurs/${id}`, { headers });
    return response.data;
  }

  async updateUser(id: number, userData: FormData, token?: string): Promise<UserResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.put<{ data: UserResponse }>(`/utilisateurs/${id}`, userData, { headers });
    return response.data.data;
  }

  async deleteUser(id: number, token?: string): Promise<void> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await api.delete(`/utilisateurs/${id}`, { headers });
  }
}

export default new UsersService();