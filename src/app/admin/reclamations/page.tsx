"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import Select from 'react-select';
import TableComponent from '@/components/layout/TableComponent';
import HeaderCardComponent from '@/components/layout/HeaderCardComponent';
import FormModal from '@/components/layout/FormModal';
import Notification from '@/components/layout/Notification';
import ConfirmDeleteModal from '@/components/layout/ConfirmDeleteModal';
import ReclamationService, { 
  ReclamationFormData, 
  ReclamationResponse 
} from '@/services/reclamations-service';

// Status options for select
const statutOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'resolue', label: 'Résolue' },
  { value: 'fermee', label: 'Fermée' },
];

// Interface for form handling
interface FormData {
  idReclamation: number | null;
  sujet: string;
  message: string;
  statut: 'en_attente' | 'en_cours' | 'resolue' | 'fermee';
  idUtilisateur?: number;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
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

// Stats interface
interface ReclamationStats {
  statut: string;
  count: number;
}

const Reclamations: React.FC = () => {
  const { data: session, status } = useSession();
  const token = session?.customToken;

  const [reclamations, setReclamations] = useState<ReclamationResponse[]>([]);
  const [stats, setStats] = useState<ReclamationStats[]>([]);
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
    idReclamation: null,
    sujet: '',
    message: '',
    statut: 'en_attente',
  });
  const [selectedReclamations, setSelectedReclamations] = useState<number[]>([]);
  const [selectedReclamationDetail, setSelectedReclamationDetail] = useState<ReclamationResponse | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, [currentPage, statutFilter, token]); // <-- dépend du token

  useEffect(() => {
    fetchStats();
  }, [token]); // <-- dépend du token

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await ReclamationService.getAllReclamations(token);
      setReclamations(response);
      const itemsPerPage = 10;
      setTotalPages(Math.ceil(response.length / itemsPerPage));
      setLoading(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(message);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await ReclamationService.getAllReclamations(token);
      const statsMap = response.reduce((acc: { [key: string]: number }, reclamation) => {
        acc[reclamation.statut] = (acc[reclamation.statut] || 0) + 1;
        return acc;
      }, {});
      const statsData: ReclamationStats[] = Object.entries(statsMap).map(([statut, count]) => ({
        statut,
        count,
      }));
      setStats(statsData);
    } catch (error: unknown) {
      console.error('Error fetching stats:', error);
    }
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
      'en_attente': 'badge-warning',
      'en_cours': 'badge-info',
      'resolue': 'badge-success',
      'fermee': 'badge-error',
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

  const filteredReclamations = reclamations.filter(
    (reclamation) =>
      reclamation &&
      ((reclamation.sujet && reclamation.sujet.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (reclamation.message && reclamation.message.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (reclamation.utilisateur?.nom && reclamation.utilisateur.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (reclamation.utilisateur?.prenom && reclamation.utilisateur.prenom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (reclamation.utilisateur?.email && reclamation.utilisateur.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (reclamation.idReclamation && reclamation.idReclamation.toString().includes(searchTerm))) &&
      (statutFilter === '' || reclamation.statut === statutFilter)
  );

  const itemsPerPage = 10;
  const paginatedReclamations = filteredReclamations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    {
      header: 'N° Réclamation',
      render: (item: ReclamationResponse) => (
        <div className="font-mono text-sm">#{item.idReclamation}</div>
      ),
    },
    {
      header: 'Client',
      render: (item: ReclamationResponse) => (
        <div>
          <div className="font-bold">{`${item.utilisateur?.prenom || ''} ${item.utilisateur?.nom || ''}`}</div>
          <div className="text-sm opacity-50">{item.utilisateur?.email || 'N/A'}</div>
        </div>
      ),
    },
    {
      header: 'Sujet',
      render: (item: ReclamationResponse) => (
        <div className="max-w-xs truncate" title={item.sujet}>
          {item.sujet}
        </div>
      ),
    },
    {
      header: 'Date',
      render: (item: ReclamationResponse) => formatDate(item.createdAt),
    },
    {
      header: 'Statut',
      render: (item: ReclamationResponse) => (
        <span className={`badge ${getStatusBadge(item.statut)} badge-sm`}>
          {item.statut.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Message',
      render: (item: ReclamationResponse) => (
        <div className="max-w-xs truncate text-sm" title={item.message}>
          {item.message}
        </div>
      ),
    },
  ];

  const reclamationFields: Field<FormData>[] = [
    {
      name: 'sujet',
      label: 'Sujet',
      type: 'text',
      placeholder: 'Sujet de la réclamation',
      validation: {
        required: true,
        minLength: 5,
        maxLength: 100,
        title: 'Le sujet doit contenir entre 5 et 100 caractères',
      },
      hint: '5-100 caractères',
      disabled: true,
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
      placeholder: 'Description détaillée de la réclamation',
      validation: {
        required: true,
        minLength: 10,
        maxLength: 1000,
        title: 'Le message doit contenir entre 10 et 1000 caractères',
      },
      hint: '10-1000 caractères',
      disabled: true,
    },
    {
      name: 'statut',
      label: 'Statut de la réclamation',
      type: 'custom',
      render: ({ value, onChange }) => {
        const selectedOption = statutOptions.find(option => option.value === value);
        return (
          <Select
            options={statutOptions.filter(option => option.value !== '')}
            value={selectedOption || null}
            onChange={(selectedOption) => {
              const newValue = selectedOption?.value || 'en_attente';
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
      hint: 'Statut actuel de la réclamation',
    },
  ];

  const handleEditSubmit = async (data: FormData) => {
    try {
      if (!data.idReclamation) {
        setNotification({
          type: 'error',
          message: 'Aucune réclamation sélectionnée pour modification.',
        });
        return;
      }
      const updatedReclamation = await ReclamationService.updateReclamation(data.idReclamation, {
        sujet: data.sujet,
        message: data.message,
        statut: data.statut,
      }, token);
      setReclamations(
        reclamations.map((reclamation) =>
          reclamation.idReclamation === data.idReclamation ? { ...reclamation, ...updatedReclamation } : reclamation
        )
      );
      setIsEditModalOpen(false);
      fetchStats();
      setNotification({
        type: 'success',
        message: 'Réclamation modifiée avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de la modification de la réclamation: ${message}`,
      });
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      for (const id of selectedReclamations) {
        await ReclamationService.deleteReclamation(id, token);
      }
      setReclamations(reclamations.filter((reclamation) => !selectedReclamations.includes(reclamation.idReclamation)));
      setSelectedReclamations([]);
      setIsDeleteModalOpen(false);
      fetchStats();
      setNotification({
        type: 'success',
        message: 'Réclamation(s) supprimée(s) avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de la suppression de la réclamation: ${message}`,
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.checked) {
      setSelectedReclamations([...selectedReclamations, id]);
    } else {
      setSelectedReclamations(selectedReclamations.filter((reclamationId) => reclamationId !== id));
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedReclamations(paginatedReclamations.map((reclamation) => reclamation.idReclamation));
    } else {
      setSelectedReclamations([]);
    }
  };

  const handleEdit = async (reclamation: ReclamationResponse) => {
    try {
      const fetchedReclamation = await ReclamationService.getReclamationById(reclamation.idReclamation, token);
      const newFormData = {
        idReclamation: fetchedReclamation.idReclamation,
        sujet: fetchedReclamation.sujet || '',
        message: fetchedReclamation.message || '',
        statut: fetchedReclamation.statut,
      };
      setFormData(newFormData);
      setIsEditModalOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur lors du chargement des données de la réclamation: ${message}`,
      });
    }
  };

  const handleViewDetails = async (reclamation: ReclamationResponse) => {
    try {
      const fetchedReclamation = await ReclamationService.getReclamationById(reclamation.idReclamation, token);
      setSelectedReclamationDetail(fetchedReclamation);
      setIsDetailModalOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur lors du chargement des détails de la réclamation: ${message}`,
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading && reclamations.length === 0) {
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
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
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
        title="Liste des Réclamations"
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        selectedItems={selectedReclamations}
        onEdit={() => {
          const reclamation = reclamations.find((r) => r.idReclamation === selectedReclamations[0]);
          if (reclamation) handleEdit(reclamation);
        }}
        onDelete={handleDelete}
        showAddButton={false}
        showViewButton={true}
        onView={() => {
          const reclamation = reclamations.find((r) => r.idReclamation === selectedReclamations[0]);
          if (reclamation) handleViewDetails(reclamation);
        }}
      />

      <TableComponent
        data={paginatedReclamations}
        columns={columns}
        loading={loading}
        error={error}
        selectedItems={selectedReclamations}
        handleCheckboxChange={handleCheckboxChange}
        handleSelectAll={handleSelectAll}
        onEdit={handleEdit}
        onDelete={(id: number) => {
          setSelectedReclamations([id]);
          handleDelete();
        }}
        onView={handleViewDetails}
        idField="idReclamation"
      />

      {/* Pagination */}
      {Math.ceil(filteredReclamations.length / itemsPerPage) > 1 && (
        <div className="flex justify-center mt-6">
          <div className="join">
            <button
              className="join-item btn"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              «
            </button>
            {Array.from({ length: Math.ceil(filteredReclamations.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
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
              disabled={currentPage === Math.ceil(filteredReclamations.length / itemsPerPage)}
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
        itemCount={selectedReclamations.length}
        entityName="réclamation(s)"
      />

      {/* Edit Modal */}
      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier une Réclamation"
        fields={reclamationFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditSubmit}
        submitButtonText="Modifier"
      />

      {/* Details Modal */}
      {selectedReclamationDetail && (
        <div className={`modal ${isDetailModalOpen ? 'modal-open' : ''}`}>
          <div className="modal-box w-11/12 max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">
                Détails de la Réclamation #{selectedReclamationDetail.idReclamation}
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
                    <p><strong>Nom:</strong> {selectedReclamationDetail.utilisateur?.prenom} {selectedReclamationDetail.utilisateur?.nom}</p>
                    <p><strong>Email:</strong> {selectedReclamationDetail.utilisateur?.email || 'N/A'}</p>
                      <p><strong>Téléphone:</strong> {selectedReclamationDetail.utilisateur?.telephone || 'N/A'}</p>

                  </div>
                </div>
              </div>

              {/* Reclamation Information */}
              <div className="card bg-base-200">
                <div className="card-body">
                  <h4 className="card-title text-base">Informations Réclamation</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Date:</strong> {formatDate(selectedReclamationDetail.createdAt)}</p>
                    <p><strong>Statut:</strong> 
                      <span className={`badge ${getStatusBadge(selectedReclamationDetail.statut)} badge-sm ml-2`}>
                        {selectedReclamationDetail.statut.replace('_', ' ')}
                      </span>
                    </p>
                    <p><strong>Dernière mise à jour:</strong> {formatDate(selectedReclamationDetail.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reclamation Content */}
            <div className="mt-6">
              <div className="card bg-base-200">
                <div className="card-body">
                  <h4 className="card-title text-base">Sujet</h4>
                  <p className="text-sm font-medium">{selectedReclamationDetail.sujet}</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="card bg-base-200">
                <div className="card-body">
                  <h4 className="card-title text-base">Message</h4>
                  <div className="text-sm whitespace-pre-wrap">{selectedReclamationDetail.message}</div>
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleEdit(selectedReclamationDetail);
                  setIsDetailModalOpen(false);
                }}
              >
                Modifier le Statut
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

export default Reclamations;