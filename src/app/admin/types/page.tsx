'use client';

import React, { useState, useEffect } from 'react';
import TableComponent from '@/components/layout/TableComponent';
import HeaderCardComponent from '@/components/layout/HeaderCardComponent';
import FormModal from '@/components/layout/FormModal';
import Notification from '@/components/layout/Notification';
import ConfirmDeleteModal from '@/components/layout/ConfirmDeleteModal';
import TypesService from '@/services/types-service';
import { useSession } from 'next-auth/react';
interface Categorie {
  idCategorie: number;
  nom: string;
}

interface Type {
  idType: number;
  nom: string;
  description: string | null;
  categories?: Categorie[];
}

interface FormData {
  idType: number | null;
  nom: string;
  description: string | null;
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
    pattern?: string;
    title?: string;
    validate?: (value: any, allData: any) => string;
    step?: number;
  };
  render?: (props: { value: any; onChange: (value: any) => void }) => React.ReactElement;
  hidden?: boolean;
  disabled?: boolean;
}

const Types: React.FC = () => {
  const [types, setTypes] = useState<Type[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    idType: null,
    nom: '',
    description: '',
  });
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { data: session, status } = useSession();
      const token = session?.customToken; 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedTypes = await TypesService.getAllTypes(token);
        setTypes(fetchedTypes);
        setLoading(false);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredTypes = types.filter(
    (type) =>
      type &&
      ((type.nom && type.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (type.categories && type.categories.some((cat) => cat.nom.toLowerCase().includes(searchTerm.toLowerCase()))))
  );

  const columns = [
    {
      header: 'Nom du type',
      render: (item: Type) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="font-bold">{item.nom || 'N/A'}</div>
            <div className="text-sm opacity-50">{item.description || 'N/A'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Catégories associées',
      render: (item: Type) => (item.categories ? item.categories.map(c => c.nom).join(', ') : 'Aucune'),
    },
  ];

  const typeFields: Field<FormData>[] = [
    {
      name: 'nom',
      label: 'Nom',
      type: 'text',
      placeholder: 'Nom du type',
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: '[A-Za-z0-9\\s]*',
        title: 'Seules les lettres, chiffres et espaces sont autorisés',
      },
      hint: '2-50 caractères, lettres, chiffres et espaces',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Description du type',
      validation: {
        required: false,
        maxLength: 500,
        title: 'Maximum 500 caractères',
      },
      hint: 'Maximum 500 caractères (optionnel)',
    },
  ];

  const handleAddSubmit = async (data: FormData) => {
    try {
      const newType = await TypesService.createType(data,token);
      setTypes([...types, newType]);
      setIsAddModalOpen(false);
      setNotification({
        type: 'success',
        message: 'Type ajouté avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de l'ajout du type: ${message}`,
      });
    }
  };

  const handleEditSubmit = async (data: FormData) => {
    try {
      if (!data.idType) {
        setNotification({
          type: 'error',
          message: 'Aucun type sélectionné pour modification.',
        });
        return;
      }
      const updatedType = await TypesService.updateType(data.idType, data,token);
      setTypes(types.map((type) => (type.idType === data.idType ? updatedType : type)));
      setIsEditModalOpen(false);
      setNotification({
        type: 'success',
        message: 'Type modifié avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de la modification du type: ${message}`,
      });
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      for (const id of selectedTypes) {
        await TypesService.deleteType(id,token);
      }
      setTypes(types.filter((type) => !selectedTypes.includes(type.idType)));
      setSelectedTypes([]);
      setIsDeleteModalOpen(false);
      setNotification({
        type: 'success',
        message: 'Type(s) supprimé(s) avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de la suppression du type: ${message}`,
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.checked) {
      setSelectedTypes([...selectedTypes, id]);
    } else {
      setSelectedTypes(selectedTypes.filter((typeId) => typeId !== id));
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTypes(filteredTypes.map((type) => type.idType));
    } else {
      setSelectedTypes([]);
    }
  };

  const handleAdd = () => {
    const initialFormData = {
      idType: null,
      nom: '',
      description: '',
    };
    setFormData(initialFormData);
    setIsAddModalOpen(true);
  };

  const handleEdit = async (type: Type) => {
    try {
      const fetchedType = await TypesService.getTypeById(type.idType,token);
      
      const editFormData = {
        idType: fetchedType.idType,
        nom: fetchedType.nom || '',
        description: fetchedType.description || '',
      };
      
      setFormData(editFormData);
      setIsEditModalOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur lors du chargement des données du type: ${message}`,
      });
    }
  };

  if (loading) {
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
      <HeaderCardComponent
        title="Liste des Types"
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        selectedItems={selectedTypes}
        onEdit={() => {
          const type = types.find((t) => t.idType === selectedTypes[0]);
          if (type) handleEdit(type);
        }}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />
      <TableComponent
        data={filteredTypes}
        columns={columns}
        loading={loading}
        error={error}
        selectedItems={selectedTypes}
        handleCheckboxChange={handleCheckboxChange}
        handleSelectAll={handleSelectAll}
        onEdit={handleEdit}
        onDelete={(id: number) => {
          setSelectedTypes([id]);
          handleDelete();
        }}
        idField="idType"
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemCount={selectedTypes.length}
        entityName="type(s)"
      />
      <FormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter un Nouveau Type"
        fields={typeFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddSubmit}
        submitButtonText="Ajouter"
      />
      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier un Type"
        fields={typeFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditSubmit}
        submitButtonText="Modifier"
      />
    </div>
  );
};

export default Types;