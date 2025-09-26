import api from './api';

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
    const response = await api.post<NewsletterEntry>('/newsletter/subscribe', newsletterData);
    return response.data;
  }

  async getAllEntries(): Promise<NewsletterEntry[]> {
    const response = await api.get<NewsletterEntry[]>('/newsletter');
    return response.data;
  }

  async unsubscribe(email: string): Promise<void> {
    await api.post('/newsletter/unsubscribe', { email });
  }

  async createCampaign(campaignData: CampaignFormData): Promise<NewsletterCampaign> {
    const formData = new FormData();
    formData.append('subject', campaignData.subject);
    formData.append('content', campaignData.content);
    if (campaignData.htmlContent) formData.append('htmlContent', campaignData.htmlContent);
    if (campaignData.scheduledDate) formData.append('scheduledDate', campaignData.scheduledDate);
    if (campaignData.image) formData.append('image', campaignData.image);

    const response = await api.post<{ campaign: NewsletterCampaign }>('/newsletter/campaigns', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.campaign;
  }

  async getCampaigns(): Promise<NewsletterCampaign[]> {
    const response = await api.get<NewsletterCampaign[]>('/newsletter/campaigns');
    return response.data;
  }

  async sendCampaign(campaignId: number): Promise<any> {
    const response = await api.post(`/newsletter/campaigns/${campaignId}/send`);
    return response.data;
  }

  async deleteCampaign(campaignId: number): Promise<void> {
    await api.delete(`/newsletter/campaigns/${campaignId}`);
  }

  async updateCampaign(campaignId: number, campaignData: CampaignFormData): Promise<NewsletterCampaign> {
    const formData = new FormData();
    formData.append('subject', campaignData.subject);
    formData.append('content', campaignData.content);
    if (campaignData.htmlContent) formData.append('htmlContent', campaignData.htmlContent);
    if (campaignData.scheduledDate) formData.append('scheduledDate', campaignData.scheduledDate);
    if (campaignData.image) formData.append('image', campaignData.image);

    const response = await api.put<{ campaign: NewsletterCampaign }>(`/newsletter/campaigns/${campaignId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.campaign;
  }
}

export default new NewsletterService();