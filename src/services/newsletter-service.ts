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

  async getAllEntries(token?: string): Promise<NewsletterEntry[]> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<NewsletterEntry[]>('/newsletter', { headers });
    return response.data;
  }

  async unsubscribe(email: string, token?: string): Promise<void> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await api.post('/newsletter/unsubscribe', { email }, { headers });
  }

  async createCampaign(campaignData: CampaignFormData, token?: string): Promise<NewsletterCampaign> {
    const headers: any = { 'Content-Type': 'multipart/form-data' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const formData = new FormData();
    formData.append('subject', campaignData.subject);
    formData.append('content', campaignData.content);
    if (campaignData.htmlContent) formData.append('htmlContent', campaignData.htmlContent);
    if (campaignData.scheduledDate) formData.append('scheduledDate', campaignData.scheduledDate);
    if (campaignData.image) formData.append('image', campaignData.image);

    const response = await api.post<{ campaign: NewsletterCampaign }>('/newsletter/campaigns', formData, { headers });
    return response.data.campaign;
  }

  async getCampaigns(token?: string): Promise<NewsletterCampaign[]> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get<NewsletterCampaign[]>('/newsletter/campaigns', { headers });
    return response.data;
  }

  async sendCampaign(campaignId: number, token?: string): Promise<any> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post(`/newsletter/campaigns/${campaignId}/send`, {}, { headers });
    return response.data;
  }

  async deleteCampaign(campaignId: number, token?: string): Promise<void> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await api.delete(`/newsletter/campaigns/${campaignId}`, { headers });
  }

  async updateCampaign(campaignId: number, campaignData: CampaignFormData, token?: string): Promise<NewsletterCampaign> {
    const headers: any = { 'Content-Type': 'multipart/form-data' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const formData = new FormData();
    formData.append('subject', campaignData.subject);
    formData.append('content', campaignData.content);
    if (campaignData.htmlContent) formData.append('htmlContent', campaignData.htmlContent);
    if (campaignData.scheduledDate) formData.append('scheduledDate', campaignData.scheduledDate);
    if (campaignData.image) formData.append('image', campaignData.image);

    const response = await api.put<{ campaign: NewsletterCampaign }>(`/newsletter/campaigns/${campaignId}`, formData, { headers });
    return response.data.campaign;
  }
}

export default new NewsletterService();