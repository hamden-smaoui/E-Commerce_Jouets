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
  async createUser(userData: FormData): Promise<UserResponse> {
    const response = await api.post<{ data: UserResponse }>('/utilisateurs', userData);
    return response.data.data;
  }

  async getAllUsers(): Promise<UserResponse[]> {
    const response = await api.get<UserResponse[]>('/utilisateurs');
    return response.data;
  }

  async getUserById(id: number): Promise<UserResponse> {
    const response = await api.get<UserResponse>(`/utilisateurs/${id}`);
    return response.data;
  }

  async updateUser(id: number, userData: FormData): Promise<UserResponse> {
    const response = await api.put<{ data: UserResponse }>(`/utilisateurs/${id}`, userData);
    return response.data.data;
  }

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/utilisateurs/${id}`);
  }
}

export default new UsersService();