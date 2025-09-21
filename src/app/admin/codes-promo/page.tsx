'use client';

import React, { useState, useEffect } from 'react';
import TableComponent from '@/components/layout/TableComponent';
import HeaderCardComponent from '@/components/layout/HeaderCardComponent';
import FormModal from '@/components/layout/FormModal';
import Notification from '@/components/layout/Notification';
import ConfirmDeleteModal  from '@/components/layout/ConfirmDeleteModal';
import CodesPromoService, { CodePromo, CodePromoFormData } from '@/services/codes-promo-service';
import { ToggleLeft } from 'lucide-react';

interface FormData {
  idCodePromo: number | null;
  code: string;
  valeurPourcentage: number;
  utilisationMax: number | null;
  actif: boolean;
}

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
    validate?: (value: any, allData: any) => string;
  };
  render?: (props: { value: any; onChange: (value: any) => void }) => React.ReactElement;
  hidden?: boolean;
  disabled?: boolean;
}

const codePromoFields: Field<FormData>[] = [
  {
    name: 'code',
    label: 'Code promo',
    type: 'text',
    placeholder: 'CODE-PROMO',
    validation: {
      required: true,
      minLength: 3,
      maxLength: 20,
      validate: (value: string) => {
        if (!/^[A-Z0-9-_]+$/.test(value)) {
          return 'Le code ne peut contenir que des lettres majuscules, chiffres, tirets et underscores';
        }
        return '';
      }
    },
    hint: 'Lettres majuscules, chiffres, tirets et underscores uniquement',
  },
  {
    name: 'valeurPourcentage',
    label: 'Réduction (%)',
    type: 'number',
    placeholder: 'ex: 20',
    validation: {
      required: true,
      min: 1,
      max: 100,
      validate: (value: number) => value > 0 && value <= 100 ? '' : 'Valeur entre 1 et 100'
    },
    hint: 'Pourcentage de réduction appliqué par ce code',
  },
  {
    name: 'utilisationMax',
    label: 'Utilisation maximale',
    type: 'number',
    placeholder: 'Illimitée',
    validation: {
      required: false,
      min: 1,
    },
    hint: 'Nombre maximum d\'utilisations (laisser vide pour illimité)',
  },
  {
    name: 'actif',
    label: 'Actif',
    type: 'checkbox',
    hint: 'Le code peut être utilisé',
  },
];

const CodesPromo: React.FC = () => {
  const [codesPromo, setCodesPromo] = useState<CodePromo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCodesPromo, setSelectedCodesPromo] = useState<number[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState<FormData>({
    idCodePromo: null,
    code: '',
    valeurPourcentage: 0,
    utilisationMax: null,
    actif: true,
  });

  useEffect(() => {
    fetchCodesPromo();
    // eslint-disable-next-line
  }, [currentPage, searchTerm]);

  const fetchCodesPromo = async () => {
    try {
      setLoading(true);
      const response = await CodesPromoService.getAllCodesPromo({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm.trim() || undefined,
      });
      setCodesPromo(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
      setLoading(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(message);
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusBadge = (actif: boolean) => {
    return (
      <span className={`badge ${actif ? 'badge-success' : 'badge-error'}`}>
        {actif ? 'Actif' : 'Inactif'}
      </span>
    );
  };

  const getUsageBadge = (current: number, max: number | null) => {
    if (max === null) {
      return <span className="badge badge-outline">∞</span>;
    }
    const percentage = (current / max) * 100;
    let badgeClass = 'badge-success';
    if (percentage >= 80) badgeClass = 'badge-error';
    else if (percentage >= 60) badgeClass = 'badge-warning';
    return (
      <span className={`badge ${badgeClass}`}>
        {current} / {max}
      </span>
    );
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const columns = [
    {
      header: 'Code',
      render: (item: CodePromo) => (
        <div className="font-mono font-bold text-primary">{item.code}</div>
      ),
    },
    {
      header: 'Réduction',
      render: (item: CodePromo) => (
        <div>
          <span className="badge badge-info">{item.valeurPourcentage}%</span>
        </div>
      ),
    },
    {
      header: 'Utilisation',
      render: (item: CodePromo) => getUsageBadge(item.utilisationActuelle, item.utilisationMax),
    },
    {
      header: 'Statut',
      render: (item: CodePromo) => getStatusBadge(item.actif),
    },
    {
      header: 'Date création',
      render: (item: CodePromo) => (
        <div className="text-sm">{formatDate(item.createdAt)}</div>
      ),
    },
  ];

  const handleAddSubmit = async (data: FormData) => {
    try {
      const codePromoData: CodePromoFormData = {
        code: data.code.toUpperCase(),
        valeurPourcentage: data.valeurPourcentage,
        utilisationMax: data.utilisationMax,
        actif: data.actif,
      };
      await CodesPromoService.createCodePromo(codePromoData);
      await fetchCodesPromo();
      setIsAddModalOpen(false);
      resetForm();
      setNotification({ type: 'success', message: 'Code promo créé avec succès !' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de la création du code promo: ${message}`,
      });
    }
  };

  const handleEditSubmit = async (data: FormData) => {
    try {
      if (!data.idCodePromo) {
        setNotification({
          type: 'error',
          message: 'Aucun code promo sélectionné pour modification.',
        });
        return;
      }
      const codePromoData = {
        code: data.code.toUpperCase(),
        valeurPourcentage: data.valeurPourcentage,
        utilisationMax: data.utilisationMax,
        actif: data.actif,
      };
      await CodesPromoService.updateCodePromo(data.idCodePromo, codePromoData);
      await fetchCodesPromo();
      setIsEditModalOpen(false);
      resetForm();
      setNotification({
        type: 'success',
        message: 'Code promo modifié avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de la modification du code promo: ${message}`,
      });
    }
  };

  const handleDelete = () => setIsDeleteModalOpen(true);

  const confirmDelete = async () => {
    try {
      for (const id of selectedCodesPromo) {
        await CodesPromoService.deleteCodePromo(id);
      }
      await fetchCodesPromo();
      setSelectedCodesPromo([]);
      setIsDeleteModalOpen(false);
      setNotification({
        type: 'success',
        message: 'Code(s) promo supprimé(s) avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de la suppression du code promo: ${message}`,
      });
    }
  };

  const handleToggleStatus = async (codePromo: CodePromo) => {
    try {
      await CodesPromoService.toggleCodePromo(codePromo.idCodePromo);
      await fetchCodesPromo();
      setNotification({
        type: 'success',
        message: `Code promo ${codePromo.actif ? 'désactivé' : 'activé'} avec succès !`,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! ${message}`,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      idCodePromo: null,
      code: '',
      valeurPourcentage: 0,
      utilisationMax: null,
      actif: true,
    });
  };

  const handleAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleEdit = async (codePromo: CodePromo) => {
    try {
      const fetchedCodePromo = await CodesPromoService.getCodePromoById(codePromo.idCodePromo);
      setFormData({
        idCodePromo: fetchedCodePromo.idCodePromo,
        code: fetchedCodePromo.code,
        valeurPourcentage: fetchedCodePromo.valeurPourcentage,
        utilisationMax: fetchedCodePromo.utilisationMax,
        actif: fetchedCodePromo.actif,
      });
      setIsEditModalOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur lors du chargement des données du code promo: ${message}`,
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.checked) {
      setSelectedCodesPromo([...selectedCodesPromo, id]);
    } else {
      setSelectedCodesPromo(selectedCodesPromo.filter(codePromoId => codePromoId !== id));
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCodesPromo(codesPromo.map(codePromo => codePromo.idCodePromo));
    } else {
      setSelectedCodesPromo([]);
    }
  };

  const additionalActions = [
    {
      label: 'Activer/Désactiver',
      action: (item: CodePromo) => handleToggleStatus(item),
      icon: <ToggleLeft size={20} />,
    },
  ];

  if (loading && codesPromo.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error && codesPromo.length === 0) {
    return <div className="text-center p-6 text-error">{error}</div>;
  }

  return (
    <div className="p-6 w-full h-screen flex flex-col relative">
      <Notification notification={notification} onClose={() => setNotification(null)} />

      <HeaderCardComponent
        title="Gestion des Codes Promo"
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        selectedItems={selectedCodesPromo}
        onEdit={() => {
          const codePromo = codesPromo.find(cp => cp.idCodePromo === selectedCodesPromo[0]);
          if (codePromo) handleEdit(codePromo);
        }}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />

      <TableComponent
        data={codesPromo}
        columns={columns}
        loading={loading}
        error={error}
        selectedItems={selectedCodesPromo}
        handleCheckboxChange={handleCheckboxChange}
        handleSelectAll={handleSelectAll}
        onEdit={handleEdit}
        onDelete={(id: number) => {
          setSelectedCodesPromo([id]);
          handleDelete();
        }}
        additionalActions={additionalActions}
        idField="idCodePromo"
      />

      <div className="flex justify-center items-center gap-4 mt-4">
        <div className="join">
          <button
            className="join-item btn btn-sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            «
          </button>
          <button className="join-item btn btn-sm">
            Page {currentPage} sur {totalPages}
          </button>
          <button
            className="join-item btn btn-sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </div>
        <div className="text-sm text-gray-500">
          {totalItems} code(s) au total
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemCount={selectedCodesPromo.length}
        entityName="code(s) promo"
      />

      <FormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Créer un Nouveau Code Promo"
        fields={codePromoFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddSubmit}
        submitButtonText="Créer"
      />

      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier le Code Promo"
        fields={codePromoFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditSubmit}
        submitButtonText="Modifier"
      />
    </div>
  );
};

export default CodesPromo;