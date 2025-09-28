import api from './api';

interface Image {
  idImage: number;
  url: string;
  rang: number;
  type?: 'hero' | 'promotion';
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
  promotionImages?: Image[];
  tauxTVA?: number;
  fraisLivraison?: number;
  seuilLivraisonGratuite?: number;
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
  logo1File?: File; 
  logo2File?: File; 
  descriptionHero?: string;
  urlFacebook?: string;
  urlInstagram?: string;
  urlTiktok?: string;
  urlYoutube?: string;
  topDescription?: string;
  heroImages?: File[];
  promotionImages?: File[];
  imagesToDelete?: number[];
  promotionImagesToDelete?: number[];
  imageRangs?: { [imageId: string]: number };
  promotionImageRangs?: { [imageId: string]: number };
  tauxTVA?: number;
  fraisLivraison?: number;
  seuilLivraisonGratuite?: number;
  entrepriseSiret?: string;
}

class StoreInfoService {
  async getStoreInfo(): Promise<StoreInfo> {
    const response = await api.get<StoreInfo>('/store-info');
    return response.data;
  }

  async createStoreInfo(formData: StoreInfoFormData, token?: string): Promise<StoreInfo> {
    if (!token) throw new Error('Utilisateur non authentifié');
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (!['heroImages', 'promotionImages', 'imagesToDelete', 'promotionImagesToDelete', 'imageRangs', 'promotionImageRangs', 'logo1File', 'logo2File'].includes(key) && value !== undefined) {
        form.append(key, value.toString());
      }
    });
    if (formData.logo1File) form.append('logo1', formData.logo1File);
    if (formData.logo2File) form.append('logo2', formData.logo2File);
    if (formData.heroImages) formData.heroImages.forEach(file => form.append('heroImages', file));
    if (formData.promotionImages) formData.promotionImages.forEach(file => form.append('promotionImages', file));
    if (formData.imagesToDelete) form.append('imagesToDelete', JSON.stringify(formData.imagesToDelete));
    if (formData.promotionImagesToDelete) form.append('promotionImagesToDelete', JSON.stringify(formData.promotionImagesToDelete));
    if (formData.imageRangs) form.append('imageRangs', JSON.stringify(formData.imageRangs));
    if (formData.promotionImageRangs) form.append('promotionImageRangs', JSON.stringify(formData.promotionImageRangs));

    const response = await api.post<{ data: StoreInfo }>('/store-info', form, {
      headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  }

  async updateStoreInfo(id: number, formData: StoreInfoFormData, token?: string): Promise<StoreInfo> {
    if (!token) throw new Error('Utilisateur non authentifié');
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (!['heroImages', 'promotionImages', 'imagesToDelete', 'promotionImagesToDelete', 'imageRangs', 'promotionImageRangs', 'logo1File', 'logo2File'].includes(key) && value !== undefined) {
        form.append(key, value.toString());
      }
    });
    if (formData.logo1File) form.append('logo1', formData.logo1File);
    if (formData.logo2File) form.append('logo2', formData.logo2File);
    if (formData.heroImages) formData.heroImages.forEach(file => form.append('heroImages', file));
    if (formData.promotionImages) formData.promotionImages.forEach(file => form.append('promotionImages', file));
    if (formData.imagesToDelete) form.append('imagesToDelete', JSON.stringify(formData.imagesToDelete));
    if (formData.promotionImagesToDelete) form.append('promotionImagesToDelete', JSON.stringify(formData.promotionImagesToDelete));
    if (formData.imageRangs) form.append('imageRangs', JSON.stringify(formData.imageRangs));
    if (formData.promotionImageRangs) form.append('promotionImageRangs', JSON.stringify(formData.promotionImageRangs));

    const response = await api.put<{ data: StoreInfo }>(`/store-info/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  }

  async deleteStoreInfo(id: number, token?: string): Promise<void> {
    if (!token) throw new Error('Utilisateur non authentifié');
    await api.delete(`/store-info/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}

export default new StoreInfoService();