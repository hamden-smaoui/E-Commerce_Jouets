// pages/Commandes.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import TableComponent from '@/components/layout/TableComponent';
import HeaderCardComponent from '@/components/layout/HeaderCardComponent';
import FormModal from '@/components/layout/FormModal';
import Notification from '@/components/layout/Notification';
import ConfirmDeleteModal from '@/components/layout/ConfirmDeleteModal';
import CommandesService, { 
  CommandeResponse, 
  CommandeFormData, 
  CommandeStats 
} from '@/services/commandes-service';

// Status options for select
const statutOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'en attente', label: 'En attente' },
  { value: 'en traitement', label: 'En traitement' },
  { value: 'expédiée', label: 'Expédiée' },
  { value: 'livrée', label: 'Livrée' },
  { value: 'annulée', label: 'Annulée' },
];

// Interface for form handling
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
      console.log(response.data);
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
      const statsData = await CommandesService.getCommandeStats();
      setStats(statsData);
    } catch (error: unknown) {
      console.error('Error fetching stats:', error);
    }
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

  const columns = [
    {
      header: 'N° Commande',
      render: (item: CommandeResponse) => (
        <div className="font-mono text-sm">#{item.idCommande}</div>
      ),
    },
    {
      header: 'Client',
      render: (item: CommandeResponse) => (
        <div>
          <div className="font-bold">{`${item.clientPrenom} ${item.clientNom}`}</div>
          <div className="text-sm opacity-50">{item.clientEmail || 'N/A'}</div>
          <div className="text-sm opacity-50">{item.clientTelephone}</div>
        </div>
      ),
    },
    {
      header: 'Date',
      render: (item: CommandeResponse) => formatDate(item.dateCommande),
    },
    {
      header: 'Statut',
      render: (item: CommandeResponse) => (
        <span className={`badge ${getStatusBadge(item.statut)} badge-sm`}>
          {item.statut}
        </span>
      ),
    },
    {
      header: 'Montant',
      render: (item: CommandeResponse) => (
        <div className="font-bold text-primary">{formatPrice(item.montantTotal)}</div>
      ),
    },
    {
      header: 'Articles',
      render: (item: CommandeResponse) => (
        <div className="text-sm">
          {item.lignesCommandes?.length || 0} article(s)
        </div>
      ),
    },
    {
      header: 'Ville',
      render: (item: CommandeResponse) => item.clientAdresseVille,
    },
  ];

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
        pattern: '^[^@]+@[^@]+\.[^@]+$',
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
    console.log('Statut render - Current value:', value);
    
    const selectedOption = statutOptions.find(option => option.value === value);
    console.log('Selected option:', selectedOption);
    
    return (
      <Select
        options={statutOptions.filter(option => option.value !== '')}
        value={selectedOption || null}
        onChange={(selectedOption) => {
          const newValue = selectedOption?.value || 'en attente';
          console.log('New status selected:', newValue);
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
     disabled: true, // Le montant est calculé automatiquement
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
     fetchStats(); // Refresh stats
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
     fetchStats(); // Refresh stats
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
     console.log(fetchedCommande);
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

 if (loading && commandes.length === 0) {
   return (
     <div className="flex justify-center items-center h-screen">
       <span className="loading loading-spinner loading-lg"></span>
     </div>
   );
 }

 if (error) {
   return <div className="text-center p-6 text-error">{error}</div>;
 }

 return (
   <div className="p-6 w-full h-screen flex flex-col relative">
     <Notification notification={notification} onClose={() => setNotification(null)} />
     
     {/* Statistics Cards */}
     <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
       {stats.map((stat, index) => (
         <div key={index} className="stat bg-base-100 shadow rounded-lg">
           <div className={`stat-title text-xs ${getStatusBadge(stat.statut).replace('badge-', 'text-')}`}>
             {stat.statut.charAt(0).toUpperCase() + stat.statut.slice(1)}
           </div>
           <div className="stat-value text-lg">{stat.count}</div>
           <div className="stat-desc text-xs">{formatPrice(stat.total)}</div>
         </div>
       ))}
     </div>

     {/* Filters */}
     <div className="flex flex-wrap gap-4 mb-4">
       <div className="flex-1 min-w-64">
         <input
           type="text"
           placeholder="Rechercher par client, email, téléphone, n° commande..."
           className="input input-bordered w-full"
           value={searchTerm}
           onChange={handleSearch}
         />
       </div>
       <div className="w-48">
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

     {/* Pagination */}
     {totalPages > 1 && (
       <div className="flex justify-center mt-6">
         <div className="join">
           <button
             className="join-item btn"
             disabled={currentPage === 1}
             onClick={() => handlePageChange(currentPage - 1)}
           >
             «
           </button>
           {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
             <button
               key={page}
               className={`join-item btn ${currentPage === page ? 'btn-active' : ''}`}
               onClick={() => handlePageChange(page)}
             >
               {page}
             </button>
           ))}
           <button
             className="join-item btn"
             disabled={currentPage === totalPages}
             onClick={() => handlePageChange(currentPage + 1)}
           >
             »
           </button>
         </div>
       </div>
     )}

     {/* Delete Confirmation Modal */}
     <ConfirmDeleteModal
       isOpen={isDeleteModalOpen}
       onClose={() => setIsDeleteModalOpen(false)}
       onConfirm={confirmDelete}
       itemCount={selectedCommandes.length}
       entityName="commande(s)"
     />

     {/* Edit Modal */}
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

     {/* Details Modal */}
     {selectedCommandeDetail && (
       <div className={`modal ${isDetailModalOpen ? 'modal-open' : ''}`}>
         <div className="modal-box w-11/12 max-w-4xl">
           <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-lg">
               Détails de la Commande #{selectedCommandeDetail.idCommande}
             </h3>
             <button
               className="btn btn-sm btn-circle btn-ghost"
               onClick={() => setIsDetailModalOpen(false)}
             >
               ✕
             </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Client Information */}
             <div className="card bg-base-200">
               <div className="card-body">
                 <h4 className="card-title text-base">Informations Client</h4>
                 <div className="space-y-2 text-sm">
                   <p><strong>Nom:</strong> {selectedCommandeDetail.clientPrenom} {selectedCommandeDetail.clientNom}</p>
                   <p><strong>Email:</strong> {selectedCommandeDetail.clientEmail || 'N/A'}</p>
                   <p><strong>Téléphone:</strong> {selectedCommandeDetail.clientTelephone}</p>
                   <p><strong>Adresse:</strong></p>
                   <div className="ml-4 text-xs opacity-70">
                     {selectedCommandeDetail.clientAdresseRue}<br/>
                     {selectedCommandeDetail.clientAdresseVille}, {selectedCommandeDetail.clientAdresseCodePostal}<br/>
                     {selectedCommandeDetail.clientAdressePays}
                   </div>
                 </div>
               </div>
             </div>

             {/* Order Information */}
             <div className="card bg-base-200">
               <div className="card-body">
                 <h4 className="card-title text-base">Informations Commande</h4>
                 <div className="space-y-2 text-sm">
                   <p><strong>Date:</strong> {formatDate(selectedCommandeDetail.dateCommande)}</p>
                   <p><strong>Statut:</strong> 
                     <span className={`badge ${getStatusBadge(selectedCommandeDetail.statut)} badge-sm ml-2`}>
                       {selectedCommandeDetail.statut}
                     </span>
                   </p>
                   <p><strong>Montant Total:</strong> 
                     <span className="font-bold text-primary ml-2">
                       {formatPrice(selectedCommandeDetail.montantTotal)}
                     </span>
                   </p>
                   {selectedCommandeDetail.notesLivraison && (
                     <p><strong>Notes:</strong> {selectedCommandeDetail.notesLivraison}</p>
                   )}
                 </div>
               </div>
             </div>
           </div>

           {/* Order Items */}
           <div className="mt-6">
             <h4 className="font-bold text-base mb-3">Articles Commandés</h4>
             <div className="overflow-x-auto">
               <table className="table table-zebra w-full">
                 <thead>
                   <tr>
                     <th>Produit</th>
                     <th>Prix Unitaire</th>
                     <th>Quantité</th>
                     <th>Sous-total</th>
                   </tr>
                 </thead>
                 <tbody>
                   {selectedCommandeDetail.lignesCommandes?.map((ligne, index) => (
                     <tr key={index}>
                       <td>
                         <div className="flex items-center gap-3">
                           {ligne.produit?.images && ligne.produit.images.length > 0 && (
                             <div className="avatar">
                               <div className="mask mask-squircle w-10 h-10">
                                 <img 
                                   src={`http://localhost:3001${ligne.produit.images[0].url}`} 
                                   alt={ligne.produit.nom} 
                                 />
                               </div>
                             </div>
                           )}
                           <div>
                             <div className="font-bold text-sm">{ligne.produit?.nom || 'N/A'}</div>
                           </div>
                         </div>
                       </td>
                       <td>{formatPrice(ligne.prixUnitaire)}</td>
                       <td>{ligne.quantite}</td>
                       <td className="font-bold">{formatPrice(ligne.sousTotal)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>

           <div className="modal-action">
             <button
               className="btn btn-primary"
               onClick={() => {
                 handleEdit(selectedCommandeDetail);
                 setIsDetailModalOpen(false);
               }}
             >
               Modifier
             </button>
             <button 
               className="btn" 
               onClick={() => setIsDetailModalOpen(false)}
             >
               Fermer
             </button>
           </div>
         </div>
       </div>
     )}
   </div>
 );
};

export default Commandes;