// pages/Commandes.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import TableComponent from '@/components/layout/TableComponent';
import HeaderCardComponent from '@/components/layout/HeaderCardComponent';
import FormModal from '@/components/layout/FormModal';
import Notification from '@/components/layout/Notification';
import ConfirmDeleteModal from '@/components/layout/ConfirmDeleteModal';
import CommandeDetailsModal from '@/components/layout/CommandeDetailsModal';
import CommandeStatsCards from '@/components/layout/CommandeStatsCards';
import CommandesService, { 
  CommandeResponse, 
  CommandeFormData, 
  CommandeStats 
} from '@/services/commandes-service';
import FactureService from '@/services/facture-service';

// Status options for select
const statutOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'en attente', label: 'En attente' },
  { value: 'en traitement', label: 'En traitement' },
  { value: 'expédiée', label: 'Expédiée' },
  { value: 'livrée', label: 'Livrée' },
  { value: 'annulée', label: 'Annulée' },
];

interface FormData {
  idCommande: number | null;
  clientPrenom: string;
  clientNom: string;
  clientEmail: string;
  clientTelephone: string;
  clientAdresseRue: string;
  clientAdresseVille: string;
  clientAdresseCodePostal: string;
  clientAdressePays: string;
  statut: 'en attente' | 'en traitement' | 'expédiée' | 'livrée' | 'annulée';
  montantTotal: number;
  montantOriginal?: number;
  montantReduction?: number;
  fraisLivraison?: number;
  codePromoGlobal?: string;
  notesLivraison: string;
}

// Define Field interface for FormModal
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

const Commandes: React.FC = () => {
  const [commandes, setCommandes] = useState<CommandeResponse[]>([]);
  const [stats, setStats] = useState<CommandeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    idCommande: null,
    clientPrenom: '',
    clientNom: '',
    clientEmail: '',
    clientTelephone: '',
    clientAdresseRue: '',
    clientAdresseVille: '',
    clientAdresseCodePostal: '',
    clientAdressePays: 'Tunisie',
    statut: 'en attente',
    montantTotal: 0,
    notesLivraison: '',
  });
  const [selectedCommandes, setSelectedCommandes] = useState<number[]>([]);
  const [selectedCommandeDetail, setSelectedCommandeDetail] = useState<CommandeResponse | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, [currentPage, statutFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(statutFilter && { statut: statutFilter }),
      };

      const response = await CommandesService.getAllCommandes(params);
      setCommandes(response.data);
      setTotalPages(response.pagination.totalPages);
      setLoading(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(message);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const statsData = await CommandesService.getCommandeStats();
      setStats(statsData);
      setStatsLoading(false);
    } catch (error: unknown) {
      console.error('Error fetching stats:', error);
      setStatsLoading(false);
    }
  };
const formatVariation = (ligne: any) => {
  if (!ligne.variation) return '';
  const { couleur, taille, age } = ligne.variation;
  const parts = [];
  if (couleur) parts.push(couleur.nom);
  if (taille) parts.push(taille.nom);
  if (age) parts.push(age.label);
  return parts.length > 0 ? parts.join(' / ') : '';
};
  const formatPrice = (prix: any): string => {
    if (prix === null || prix === undefined || prix === '' || isNaN(Number(prix))) {
      return '0.00 TND';
    }
    return `${Number(prix).toFixed(2)} TND`;
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (statut: string): string => {
    const badges = {
      'en attente': 'badge-warning',
      'en traitement': 'badge-info',
      'expédiée': 'badge-primary',
      'livrée': 'badge-success',
      'annulée': 'badge-error',
    };
    return badges[statut as keyof typeof badges] || 'badge-neutral';
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatutFilterChange = (selectedOption: any) => {
    setStatutFilter(selectedOption?.value || '');
    setCurrentPage(1);
  };

  const filteredCommandes = commandes.filter(
    (commande) =>
      commande &&
      ((commande.clientPrenom && commande.clientPrenom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (commande.clientNom && commande.clientNom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (commande.clientEmail && commande.clientEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (commande.clientTelephone && commande.clientTelephone.includes(searchTerm)) ||
        (commande.idCommande && commande.idCommande.toString().includes(searchTerm)))
  );
const handleCreateFacture = async (idCommande: number) => {
  try {
    const response = await FactureService.createFactureForCommande(idCommande);
    setNotification({
      type: 'success',
      message: 'Facture créée avec succès !'
    });
    // Optionnel : refresh les données commande/facture si besoin
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    setNotification({
      type: 'error',
      message: `Erreur lors de la création de la facture : ${message}`
    });
  }
};
  // Table columns configuration - Responsive
  const columns = [
    {
      header: 'N° Commande',
      render: (item: CommandeResponse) => (
        <div className="font-mono text-sm font-bold">#{item.idCommande}</div>
      ),
      className: 'w-20 lg:w-auto',
    },
    {
      header: 'Client',
      render: (item: CommandeResponse) => (
        <div className="min-w-0">
          <div className="font-bold truncate">{`${item.clientPrenom} ${item.clientNom}`}</div>
          <div className="text-sm opacity-50 truncate hidden sm:block">{item.clientEmail || 'N/A'}</div>
          <div className="text-sm opacity-50">{item.clientTelephone}</div>
        </div>
      ),
      className: 'min-w-[150px]',
    },
    {
      header: 'Date',
      render: (item: CommandeResponse) => (
        <div className="text-xs lg:text-sm">
          {formatDate(item.dateCommande)}
        </div>
      ),
      className: 'hidden md:table-cell min-w-[100px]',
    },
    {
      header: 'Statut',
      render: (item: CommandeResponse) => (
        <span className={`badge ${getStatusBadge(item.statut)} badge-sm text-xs`}>
          {item.statut}
        </span>
      ),
      className: 'w-24 lg:w-auto',
    },
    {
      header: 'Montant',
      render: (item: CommandeResponse) => (
        <div>
          <div className="font-bold text-primary text-sm lg:text-base">
            {formatPrice(item.montantTotal)}
          </div>
          {item.montantOriginal && item.montantOriginal !== item.montantTotal && (
            <div className="text-xs hidden lg:block">
              <span className="line-through text-gray-500">
                {formatPrice(item.montantOriginal)}
              </span>
            </div>
          )}
        </div>
      ),
      className: 'text-right min-w-[80px]',
    },
    {
      header: 'Articles',
      render: (item: CommandeResponse) => (
        <div className="text-sm text-center">
          <span className="badge badge-outline badge-sm">
            {item.lignesCommandes?.length || 0}
          </span>
        </div>
      ),
      className: 'hidden lg:table-cell w-20',
    },
    
    {
      header: 'Ville',
      render: (item: CommandeResponse) => (
        <div className="text-sm truncate max-w-[100px]">
          {item.clientAdresseVille}
        </div>
      ),
      className: 'hidden xl:table-cell',
    },
    {
  header: 'Facture',
  render: (item: CommandeResponse) => (
    <button
      className="btn btn-sm btn-primary"
      onClick={() => handleCreateFacture(item.idCommande)}
    >
      Créer la facture
    </button>
  ),
  className: 'text-center w-32',
}
  ];

  // Form fields configuration
  const commandeFields: Field<FormData>[] = [
    {
      name: 'clientPrenom',
      label: 'Prénom du client',
      type: 'text',
      placeholder: 'Prénom',
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50,
        title: 'Le prénom doit contenir entre 2 et 50 caractères',
      },
      hint: '2-50 caractères',
    },
    {
      name: 'clientNom',
      label: 'Nom du client',
      type: 'text',
      placeholder: 'Nom',
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50,
        title: 'Le nom doit contenir entre 2 et 50 caractères',
      },
      hint: '2-50 caractères',
    },
    {
      name: 'clientEmail',
      label: 'Email du client',
      type: 'email',
      placeholder: 'email@exemple.com',
      validation: {
        required: false,
        pattern: '^[^@]+@[^@]+\\.[^@]+',
        title: 'Veuillez saisir un email valide',
      },
      hint: 'Email valide (optionnel)',
    },
    {
      name: 'clientTelephone',
      label: 'Téléphone du client',
      type: 'tel',
      placeholder: '+216 XX XXX XXX',
      validation: {
        required: true,
        minLength: 8,
        maxLength: 15,
        title: 'Le téléphone doit contenir entre 8 et 15 caractères',
      },
      hint: '8-15 caractères',
    },
    {
      name: 'clientAdresseRue',
      label: 'Adresse (rue)',
      type: 'text',
      placeholder: 'Adresse complète',
      validation: {
        required: true,
        minLength: 5,
        maxLength: 200,
        title: 'L\'adresse doit contenir entre 5 et 200 caractères',
      },
      hint: '5-200 caractères',
    },
    {
      name: 'clientAdresseVille',
      label: 'Ville',
      type: 'text',
      placeholder: 'Ville',
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50,
        title: 'La ville doit contenir entre 2 et 50 caractères',
      },
      hint: '2-50 caractères',
    },
    {
      name: 'clientAdresseCodePostal',
      label: 'Code postal',
      type: 'text',
      placeholder: '1000',
      validation: {
        required: true,
        minLength: 4,
        maxLength: 10,
        title: 'Le code postal doit contenir entre 4 et 10 caractères',
      },
      hint: '4-10 caractères',
    },
    {
      name: 'clientAdressePays',
      label: 'Pays',
      type: 'text',
      placeholder: 'Tunisie',
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50,
        title: 'Le pays doit contenir entre 2 et 50 caractères',
      },
      hint: '2-50 caractères',
    },
    {
      name: 'statut',
      label: 'Statut de la commande',
      type: 'custom',
      render: ({ value, onChange }) => {
        const selectedOption = statutOptions.find(option => option.value === value);
        
        return (
          <Select
            options={statutOptions.filter(option => option.value !== '')}
            value={selectedOption || null}
            onChange={(selectedOption) => {
              const newValue = selectedOption?.value || 'en attente';
              onChange(newValue);
            }}
            placeholder="Sélectionnez un statut"
            className="w-full"
            isClearable={false}
          />
        );
      },
      validation: {
        required: true,
        title: 'Sélectionnez un statut',
      },
      hint: 'Statut actuel de la commande',
    },
    {
      name: 'montantTotal',
      label: 'Montant total (TND)',
      type: 'number',
      placeholder: '0.00',
      validation: {
        required: true,
        min: 0.01,
        step: 0.01,
        title: 'Le montant doit être supérieur à 0',
      },
      hint: 'Montant en dinars tunisiens',
      disabled: true,
    },
    {
      name: 'notesLivraison',
      label: 'Notes de livraison',
      type: 'textarea',
      placeholder: 'Instructions particulières...',
      validation: {
        required: false,
        maxLength: 500,
        title: 'Maximum 500 caractères',
      },
      hint: 'Instructions particulières pour la livraison (optionnel)',
    },
  ];

  // Event handlers
  const handleEditSubmit = async (data: FormData) => {
    try {
      if (!data.idCommande) {
        setNotification({
          type: 'error',
          message: 'Aucune commande sélectionnée pour modification.',
        });
        return;
      }

      const updatedCommande = await CommandesService.updateCommande(data.idCommande, data);
      setCommandes(
        commandes.map((commande) =>
          commande.idCommande === data.idCommande ? { ...commande, ...updatedCommande } : commande
        )
      );
      setIsEditModalOpen(false);
      fetchStats();
      setNotification({
        type: 'success',
        message: 'Commande modifiée avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de la modification de la commande: ${message}`,
      });
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      for (const id of selectedCommandes) {
        await CommandesService.deleteCommande(id);
      }
      setCommandes(commandes.filter((commande) => !selectedCommandes.includes(commande.idCommande)));
      setSelectedCommandes([]);
      setIsDeleteModalOpen(false);
      fetchStats();
      setNotification({
        type: 'success',
        message: 'Commande(s) supprimée(s) avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de la suppression de la commande: ${message}`,
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.checked) {
      setSelectedCommandes([...selectedCommandes, id]);
    } else {
      setSelectedCommandes(selectedCommandes.filter((commandeId) => commandeId !== id));
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCommandes(filteredCommandes.map((commande) => commande.idCommande));
    } else {
      setSelectedCommandes([]);
    }
  };

  const handleEdit = async (commande: CommandeResponse) => {
    try {
      const fetchedCommande = await CommandesService.getCommandeById(commande.idCommande);
      const newFormData = {
        idCommande: fetchedCommande.idCommande,
        clientPrenom: fetchedCommande.clientPrenom || '',
        clientNom: fetchedCommande.clientNom || '',
        clientEmail: fetchedCommande.clientEmail || '',
        clientTelephone: fetchedCommande.clientTelephone || '',
        clientAdresseRue: fetchedCommande.clientAdresseRue || '',
        clientAdresseVille: fetchedCommande.clientAdresseVille || '',
        clientAdresseCodePostal: fetchedCommande.clientAdresseCodePostal || '',
        clientAdressePays: fetchedCommande.clientAdressePays || 'Tunisie',
        statut: fetchedCommande.statut,
        montantTotal: fetchedCommande.montantTotal || 0,
        notesLivraison: fetchedCommande.notesLivraison || '',
      };
      setFormData(newFormData);
      setIsEditModalOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur lors du chargement des données de la commande: ${message}`,
      });
    }
  };

  const handleViewDetails = async (commande: CommandeResponse) => {
    try {
      const fetchedCommande = await CommandesService.getCommandeById(commande.idCommande);
      setSelectedCommandeDetail(fetchedCommande);
      setIsDetailModalOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur lors du chargement des détails de la commande: ${message}`,
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Loading state
  if (loading && commandes.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center p-6">
        <div className="text-error text-lg mb-4">{error}</div>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            setError(null);
            fetchData();
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 w-full h-screen flex  flex-col relative">
      <Notification notification={notification} onClose={() => setNotification(null)} />
      
      {/* Statistics Cards Component */}
      <CommandeStatsCards stats={stats} loading={statsLoading} />

      {/* Filters - Responsive */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        
        <div className="w-full sm:w-48">
          <Select
            options={statutOptions}
            value={statutOptions.find(option => option.value === statutFilter)}
            onChange={handleStatutFilterChange}
            placeholder="Filtrer par statut"
            className="w-full z-40"
            isClearable={false}
          />
        </div>
      </div>

      {/* Header Card Component */}
      <HeaderCardComponent
        title="Liste des Commandes"
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        selectedItems={selectedCommandes}
        onEdit={() => {
          const commande = commandes.find((c) => c.idCommande === selectedCommandes[0]);
          if (commande) handleEdit(commande);
        }}
        onDelete={handleDelete}
        showAddButton={false}
        showViewButton={true}
        onView={() => {
          const commande = commandes.find((c) => c.idCommande === selectedCommandes[0]);
          if (commande) handleViewDetails(commande);
        }}
      />

      
  <div className="flex-1 min-h-[50vh] sm:min-h-[60vh] overflow-auto">
  <TableComponent
    data={filteredCommandes}
    columns={columns}
    loading={loading}
    error={error}
    selectedItems={selectedCommandes}
    handleCheckboxChange={handleCheckboxChange}
    handleSelectAll={handleSelectAll}
    onEdit={handleEdit}
    onDelete={(id: number) => {
      setSelectedCommandes([id]);
      handleDelete();
    }}
    onView={handleViewDetails}
    idField="idCommande"
  />
</div>
      

      {/* Pagination - Responsive */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="join">
            <button
              className="join-item btn btn-sm sm:btn-md"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              «
            </button>
            {/* Show fewer pages on mobile */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                if (window.innerWidth < 640) {
                  // Mobile: show current, prev, next
                  return Math.abs(page - currentPage) <= 1;
                }
                // Desktop: show all or reasonable range
                return totalPages <= 7 || Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages;
              })
              .map((page) => (
                <button
                  key={page}
                  className={`join-item btn btn-sm sm:btn-md ${currentPage === page ? 'btn-active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
            <button
              className="join-item btn btn-sm sm:btn-md"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemCount={selectedCommandes.length}
        entityName="commande(s)"
      />

      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier une Commande"
        fields={commandeFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditSubmit}
        submitButtonText="Modifier"
      />

      <CommandeDetailsModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        commande={selectedCommandeDetail}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default Commandes;