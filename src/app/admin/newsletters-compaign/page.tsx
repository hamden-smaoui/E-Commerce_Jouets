'use client';

import React, { useEffect, useState } from 'react';
import NewsletterService, { NewsletterCampaign, CampaignFormData } from '@/services/newsletter-service';
import TableComponent from '@/components/layout/TableComponent';
import HeaderCardComponent from '@/components/layout/HeaderCardComponent';
import Notification from '@/components/layout/Notification';
import FormModal from '@/components/layout/FormModal';
import ConfirmDeleteModal from '@/components/layout/ConfirmDeleteModal';
import { useSession } from "next-auth/react";
interface Field<T> {
  name: keyof T;
  label: string;
  type?: string;
  placeholder?: string;
  className?: string;
  hint?: string;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    title?: string;
    validate?: (value: any, allData: any) => string;
    step?: number;
  };
  render?: (props: { value: any; onChange: (value: any) => void }) => React.ReactElement;
  hidden?: boolean;
  disabled?: boolean;
}

// Modal de confirmation d'envoi
interface ConfirmSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  campaignSubject: string;
  recipientCount: number;
}

const ConfirmSendModal: React.FC<ConfirmSendModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  campaignSubject,
  recipientCount,
}) => {
  if (!isOpen) return null;

  return (
    <dialog open className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg">Confirmer l'envoi</h3>
        <p className="py-4">
          Êtes-vous sûr de vouloir envoyer la campagne "<strong>{campaignSubject}</strong>" à {recipientCount} abonnés ?
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Cette action est irréversible.
        </p>
        <div className="modal-action">
          <button className="btn btn-primary" onClick={onConfirm}>
            Envoyer maintenant
          </button>
          <button className="btn" onClick={onClose}>
            Annuler
          </button>
        </div>
      </div>
    </dialog>
  );
};

const NewsletterCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [campaignToSend, setCampaignToSend] = useState<NewsletterCampaign | null>(null);
  const [formData, setFormData] = useState<CampaignFormData>({
    subject: '',
    content: '',
    htmlContent: '',
    scheduledDate: '',
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [campaignToEdit, setCampaignToEdit] = useState<NewsletterCampaign | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
const { data: session, status } = useSession();
  const token = session?.customToken;
  const handleImageChange = (file: File | null) => {
    if (file) {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
    } else {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(null);
      
      setFormData(prev => ({
        ...prev,
        image: undefined
      }));
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const campaignFields: Field<CampaignFormData>[] = [
    {
      name: 'subject',
      label: 'Sujet de l\'email',
      type: 'text',
      placeholder: 'Entrez le sujet de votre newsletter',
      validation: {
        required: true,
        minLength: 5,
        maxLength: 100,
      }
    },
    {
      name: 'content',
      label: 'Contenu (texte)',
      type: 'textarea',
      placeholder: 'Rédigez le contenu de votre newsletter...',
      className: 'h-32',
      validation: {
        required: true,
        minLength: 10,
      }
    },
    {
      name: 'htmlContent',
      label: 'Contenu HTML (optionnel)',
      type: 'textarea',
      placeholder: '<p>Contenu HTML personnalisé...</p>',
      className: 'h-24',
      hint: 'Laissez vide pour utiliser le contenu texte'
    },
    {
      name: 'image',
      label: 'Image (optionnel)',
      type: 'custom',
      hint: 'JPG, PNG, GIF - Max 5MB',
      render: ({ value, onChange }) => {
        return (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                handleImageChange(file);
                onChange(file);
              }}
              className="file-input file-input-bordered w-full"
            />
            
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Aperçu"
                  className="w-32 h-32 object-cover border rounded"
                />
              </div>
            )}
          </div>
        );
      },
      validation: {
        validate: (value: any) => {
          if (value && value instanceof File) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(value.type)) {
              return 'Seuls les fichiers JPEG, PNG ou GIF sont autorisés';
            }
            if (value.size > 5 * 1024 * 1024) {
              return 'Le fichier ne doit pas dépasser 5MB';
            }
          }
          return '';
        },
      }
    },
    {
      name: 'scheduledDate',
      label: 'Programmer l\'envoi (optionnel)',
      type: 'datetime-local',
      hint: 'Laissez vide pour sauvegarder comme brouillon'
    }
  ];

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const data = await NewsletterService.getCampaigns(token);
      setCampaigns(data);
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const filtered = campaigns.filter(campaign =>
    campaign.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
// Fonction pour ouvrir le modal d'édition
const handleEdit = (campaign: NewsletterCampaign) => {
  if (campaign.status === 'sent') {
    setNotification({
      type: 'error',
      message: 'Impossible de modifier une campagne déjà envoyée'
    });
    return;
  }

  setCampaignToEdit(campaign);
  setFormData({
    subject: campaign.subject,
    content: campaign.content,
    htmlContent: campaign.htmlContent || '',
    scheduledDate: campaign.scheduledDate ? 
      campaign.scheduledDate.split('T')[0] + 'T' + campaign.scheduledDate.split('T')[1].substring(0, 5) : '',
  });
  
  // ✅ Charger l'image existante si elle existe
  if (imagePreview) {
    URL.revokeObjectURL(imagePreview);
  }
  
  if (campaign.imageUrl) {
    // Utiliser l'URL complète de l'image existante
    setImagePreview(`${campaign.imageUrl}`);
  } else {
    setImagePreview(null);
  }
  
  setIsEditModalOpen(true);
};

// Fonction pour soumettre les modifications
const handleEditSubmit = async (data: CampaignFormData) => {
  if (!campaignToEdit) return;
  
  try {
    
    await NewsletterService.updateCampaign(campaignToEdit.idCampaign, data,token);
    await fetchCampaigns();
    setIsEditModalOpen(false);
    setCampaignToEdit(null);
    
    setFormData({ subject: '', content: '', htmlContent: '', scheduledDate: '' });
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    
    setNotification({ type: 'success', message: 'Campagne modifiée avec succès !' });
  } catch (error: any) {
    setNotification({ type: 'error', message: error.message });
  }
};

// Fonction pour fermer le modal d'édition
const handleCloseEditModal = () => {
  setIsEditModalOpen(false);
  setCampaignToEdit(null);
  if (imagePreview) {
    URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  }
  setFormData({ subject: '', content: '', htmlContent: '', scheduledDate: '' });
};
  const handleSendCampaign = (campaign: NewsletterCampaign) => {
    setCampaignToSend(campaign);
    setIsSendModalOpen(true);
  };

  const confirmSendCampaign = async () => {
    if (!campaignToSend) return;
    
    try {
      setSendingId(campaignToSend.idCampaign);
      setIsSendModalOpen(false);
      
      const result = await NewsletterService.sendCampaign(campaignToSend.idCampaign,token);
      await fetchCampaigns();
      
      setNotification({ 
        type: 'success', 
        message: `Campagne envoyée avec succès à ${result.successCount} abonnés !` 
      });
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message });
    } finally {
      setSendingId(null);
      setCampaignToSend(null);
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      for (const id of selected) {
        await NewsletterService.deleteCampaign(id,token);
      }
      setCampaigns(campaigns.filter(c => !selected.includes(c.idCampaign)));
      setSelected([]);
      setIsDeleteModalOpen(false);
      setNotification({ type: 'success', message: 'Campagne(s) supprimée(s) avec succès.' });
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message });
    }
  };

  const handleAddSubmit = async (data: CampaignFormData) => {
    try {
     
      
      await NewsletterService.createCampaign(data,token);
      await fetchCampaigns();
      setIsAddModalOpen(false);
      
      setFormData({ subject: '', content: '', htmlContent: '', scheduledDate: '' });
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
      
      setNotification({ type: 'success', message: 'Campagne créée avec succès !' });
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message });
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    setFormData({ subject: '', content: '', htmlContent: '', scheduledDate: '' });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800'
    };
    const labels = {
      draft: 'Brouillon',
      sent: 'Envoyée',
      scheduled: 'Programmée'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const columns = [
    { 
      header: 'Sujet', 
      render: (item: NewsletterCampaign) => (
        <div>
          <div className="font-medium">{item.subject}</div>
          <div className="text-sm text-gray-500 truncate">{item.content.substring(0, 50)}...</div>
        </div>
      )
    },
    { 
      header: 'Statut', 
      render: (item: NewsletterCampaign) => getStatusBadge(item.status)
    },
    { 
      header: 'Destinataires', 
      render: (item: NewsletterCampaign) => <span>{item.recipientCount || 0}</span>
    },
    { 
      header: 'Date création', 
      render: (item: NewsletterCampaign) => 
        <span>{new Date(item.createdAt).toLocaleString('fr-FR')}</span>
    },
    { 
      header: 'Actions', 
      render: (item: NewsletterCampaign) => (
        <div className="flex space-x-2">
          {item.status !== 'sent' && (
            <button
              onClick={() => handleSendCampaign(item)}
              disabled={sendingId === item.idCampaign}
              className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {sendingId === item.idCampaign ? (
                <>
                  <span className="loading loading-spinner loading-xs mr-1"></span>
                  Envoi...
                </>
              ) : (
                'Envoyer'
              )}
            </button>
          )}
          {item.imageUrl && (
            <a  
              href={`${item.imageUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-500 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
            >
              Image
            </a>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="p-6 w-full h-screen flex flex-col relative">
      <Notification notification={notification} onClose={() => setNotification(null)} />
      
      <HeaderCardComponent
        title="Campagnes Newsletter"
        searchTerm={searchTerm}
        onSearchChange={e => setSearchTerm(e.target.value)}
        selectedItems={selected}
        onDelete={handleDelete}
        onAdd={() => setIsAddModalOpen(true)}
      />
      
      <TableComponent
        data={filtered}
        columns={columns}
        loading={loading}
        error={notification?.type === 'error' ? notification.message : null}
        selectedItems={selected}
        handleCheckboxChange={(e, id) => {
          if (e.target.checked) setSelected([...selected, id]);
          else setSelected(selected.filter(x => x !== id));
        }}
        handleSelectAll={e => {
          if (e.target.checked) setSelected(filtered.map(c => c.idCampaign));
          else setSelected([]);
        }}
         onEdit={handleEdit}
        onDelete={id => {
          setSelected([id]);
          handleDelete();
        }}
        idField="idCampaign"
      />

      {/* Modal de confirmation de suppression */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemCount={selected.length}
        entityName="campagne(s)"
      />

      {/* Modal de confirmation d'envoi */}
      <ConfirmSendModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        onConfirm={confirmSendCampaign}
        campaignSubject={campaignToSend?.subject || ''}
        recipientCount={campaignToSend?.recipientCount || 0}
      />
      
      <FormModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        title="Créer une campagne Newsletter"
        fields={campaignFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddSubmit}
        submitButtonText="Créer la campagne"
      />
      <FormModal
  isOpen={isEditModalOpen}
  onClose={handleCloseEditModal}
  title="Modifier la campagne Newsletter"
  fields={campaignFields}
  formData={formData}
  setFormData={setFormData}
  onSubmit={handleEditSubmit}
  submitButtonText="Modifier la campagne"
/>
    </div>
  );
};

export default NewsletterCampaigns;