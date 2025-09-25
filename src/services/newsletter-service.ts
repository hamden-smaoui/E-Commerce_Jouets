const API_BASE_URL = 'http://localhost:3001/api/jouets/newsletter';

export interface NewsletterEntry {
  idNewsletter: number;
  email: string;
  dateInscription: string;
}

export interface NewsletterFormData {
  email: string;
}
export interface NewsletterCampaign {
  idCampaign: number;
  subject: string;
  content: string;
  htmlContent?: string;
  imageUrl?: string;
  status: 'draft' | 'sent' | 'scheduled';
  scheduledDate?: string;
  sentDate?: string;
  recipientCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignFormData {
  subject: string;
  content: string;
  htmlContent?: string;
  scheduledDate?: string;
  image?: File;
}

class NewsletterService {
  async subscribe(newsletterData: NewsletterFormData): Promise<NewsletterEntry> {
    try {
      const response = await fetch(`${API_BASE_URL}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newsletterData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de l\'inscription à la newsletter');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Erreur inscription newsletter: ${message}`);
    }
  }

  async getAllEntries(): Promise<NewsletterEntry[]> {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur récupération newsletter');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Erreur récupération newsletter: ${message}`);
    }
  }

  async unsubscribe(email: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur désinscription newsletter');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Erreur désinscription newsletter: ${message}`);
    }
  }
 async createCampaign(campaignData: CampaignFormData): Promise<NewsletterCampaign> {
    try {
      console.log('Données de campagne reçues:', campaignData); // Debug

      const formData = new FormData();
      formData.append('subject', campaignData.subject);
      formData.append('content', campaignData.content);
      
      if (campaignData.htmlContent) {
        formData.append('htmlContent', campaignData.htmlContent);
      }
      
      if (campaignData.scheduledDate) {
        formData.append('scheduledDate', campaignData.scheduledDate);
      }
      
      // ✅ CORRECTION : Vérifier que l'image existe et l'ajouter
      if (campaignData.image && campaignData.image instanceof File) {
        formData.append('image', campaignData.image); // Le nom 'image' doit correspondre au backend
        console.log('Image ajoutée au FormData:', campaignData.image); // Debug
      } else {
        console.log('Aucune image à envoyer:', campaignData.image); 
      }

      // Debug : Afficher le contenu du FormData
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/campaigns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // ✅ Ne pas définir Content-Type, laisse le navigateur gérer multipart/form-data
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur création campagne');
      }

      const data = await response.json();
      return data.campaign;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Erreur création campagne: ${message}`);
    }
  }

  async getCampaigns(): Promise<NewsletterCampaign[]> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/campaigns`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur récupération campagnes');
      }

      return await response.json();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Erreur récupération campagnes: ${message}`);
    }
  }

  async sendCampaign(campaignId: number): Promise<any> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur envoi campagne');
      }

      return await response.json();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Erreur envoi campagne: ${message}`);
    }
  }

  async deleteCampaign(campaignId: number): Promise<void> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur suppression campagne');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Erreur suppression campagne: ${message}`);
    }
  }
  async updateCampaign(campaignId: number, campaignData: CampaignFormData): Promise<NewsletterCampaign> {
  try {
    console.log('Données de mise à jour de campagne:', campaignData);

    const formData = new FormData();
    formData.append('subject', campaignData.subject);
    formData.append('content', campaignData.content);
    
    if (campaignData.htmlContent) {
      formData.append('htmlContent', campaignData.htmlContent);
    }
    
    if (campaignData.scheduledDate) {
      formData.append('scheduledDate', campaignData.scheduledDate);
    }
    
    if (campaignData.image && campaignData.image instanceof File) {
      formData.append('image', campaignData.image);
      console.log('Image mise à jour:', campaignData.image);
    }

    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur mise à jour campagne');
    }

    const data = await response.json();
    return data.campaign;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    throw new Error(`Erreur mise à jour campagne: ${message}`);
  }
}
}

export default new NewsletterService();