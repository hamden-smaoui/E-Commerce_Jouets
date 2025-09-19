const API_BASE_URL = 'http://localhost:3001/api/store-info';

interface Image {
  idImage: number;
  url: string;
  rang: number;
}

export interface StoreInfo {
  idStoreInfo: number;
  nom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  pays: string;
  emailPrincipal: string;
  emailSecondaire?: string;
  telephonePrincipal: string;
  telephoneSecondaire?: string;
  heuresOuverture?: string;
  latitude?: number;
  longitude?: number;
  logo1?: string;
  logo2?: string;
  descriptionHero?: string;
  urlFacebook?: string;
  urlInstagram?: string;
  urlTiktok?: string;
  urlYoutube?: string;
  topDescription?: string;
  heroImages?: Image[];
  tauxTVA?: number;
  entrepriseSiret?: string;
}

export interface StoreInfoFormData {
  nom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  pays: string;
  emailPrincipal: string;
  emailSecondaire?: string;
  telephonePrincipal: string;
  telephoneSecondaire?: string;
  heuresOuverture?: string;
  latitude?: number;
  longitude?: number;
  logo1?: string;
  logo2?: string;
  logo1File?: File; // Nouveau champ pour le fichier logo1
  logo2File?: File; // Nouveau champ pour le fichier logo2
  descriptionHero?: string;
  urlFacebook?: string;
  urlInstagram?: string;
  urlTiktok?: string;
  urlYoutube?: string;
    topDescription?: string;
  heroImages?: File[];
  imagesToDelete?: number[];
  imageRangs?: { [imageId: string]: number };
  tauxTVA?: number;
  entrepriseSiret?: string;
}

class StoreInfoService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }

 

  async getStoreInfo(): Promise<StoreInfo> {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la récupération des informations du magasin');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue s\'est produite';
      throw new Error(`Erreur lors de la récupération des informations du magasin : ${message}`);
    }
  }

async createStoreInfo(formData: StoreInfoFormData): Promise<StoreInfo> {
    try {
      const form = new FormData();
      
      // Append all fields except special ones
      Object.entries(formData).forEach(([key, value]) => {
        if (!['heroImages', 'imagesToDelete', 'imageRangs', 'logo1File', 'logo2File'].includes(key) && value !== undefined) {
          form.append(key, value.toString());
        }
      });

      // Append logo files
      if (formData.logo1File) {
        form.append('logo1', formData.logo1File);
      }

      if (formData.logo2File) {
        form.append('logo2', formData.logo2File);
      }

      // Append heroImages (files)
      if (formData.heroImages && Array.isArray(formData.heroImages)) {
        formData.heroImages.forEach((file) => {
          form.append('heroImages', file);
        });
      }

      // Append imagesToDelete as JSON string
      if (formData.imagesToDelete && Array.isArray(formData.imagesToDelete)) {
        form.append('imagesToDelete', JSON.stringify(formData.imagesToDelete));
      }

      // Append imageRangs as JSON string
      if (formData.imageRangs && typeof formData.imageRangs === 'object') {
        form.append('imageRangs', JSON.stringify(formData.imageRangs));
      }

      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: form,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la création des informations du magasin');
      }

      const data = await response.json();
      return data.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue s\'est produite';
      throw new Error(`Erreur lors de la création des informations du magasin : ${message}`);
    }
  }

  // Dans storeInfo-service.ts, dans la méthode updateStoreInfo
async updateStoreInfo(id: number, formData: StoreInfoFormData): Promise<StoreInfo> {
  try {
    const form = new FormData();
    
    // Append all fields except special ones
    Object.entries(formData).forEach(([key, value]) => {
      if (!['heroImages', 'imagesToDelete', 'imageRangs', 'logo1File', 'logo2File'].includes(key) && value !== undefined) {
        form.append(key, value.toString());
      }
    });

    // Append logo files
    if (formData.logo1File) {
      form.append('logo1', formData.logo1File);
    }

    if (formData.logo2File) {
      form.append('logo2', formData.logo2File);
    }

    // Append heroImages (files)
    if (formData.heroImages && Array.isArray(formData.heroImages)) {
      formData.heroImages.forEach((file) => {
        form.append('heroImages', file);
      });
    }

    // CORRECTION : S'assurer que les données sont correctement formatées
    if (formData.imagesToDelete && Array.isArray(formData.imagesToDelete)) {
      console.log('Sending imagesToDelete:', formData.imagesToDelete); // Debug log
      form.append('imagesToDelete', JSON.stringify(formData.imagesToDelete));
    }

    if (formData.imageRangs && typeof formData.imageRangs === 'object') {
      form.append('imageRangs', JSON.stringify(formData.imageRangs));
    }

    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: form,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Échec de la mise à jour des informations du magasin');
    }

    const data = await response.json();
    return data.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Une erreur inconnue s\'est produite';
    throw new Error(`Erreur lors de la mise à jour des informations du magasin : ${message}`);
  }
}

  async deleteStoreInfo(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la suppression des informations du magasin');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue s\'est produite';
      throw new Error(`Erreur lors de la suppression des informations du magasin : ${message}`);
    }
  }
}

export default new StoreInfoService();