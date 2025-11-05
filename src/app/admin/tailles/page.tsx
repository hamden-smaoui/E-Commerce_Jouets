'use client';

import React, { useState, useEffect } from 'react';
import TableComponent from '@/components/layout/TableComponent';
import HeaderCardComponent from '@/components/layout/HeaderCardComponent';
import FormModal from '@/components/layout/FormModal';
import Notification from '@/components/layout/Notification';
import ConfirmDeleteModal from '@/components/layout/ConfirmDeleteModal';
import TaillesService, { Taille, TailleFormData } from '@/services/tailles-service';
import {useSession} from "next-auth/react";
interface FormData {
  idTaille: number | null;
  nom: string;
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

const Tailles: React.FC = () => {
  const [tailles, setTailles] = useState<Taille[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    idTaille: null,
    nom: '',
  });
  const [selectedTailles, setSelectedTailles] = useState<number[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formKey, setFormKey] = useState(0);
 const { data: session, status } = useSession();
    const token = session?.customToken; 
  // Fetch tailles on component mount
  useEffect(() => {
    const fetchTailles = async () => {
      try {
        setLoading(true);
        const fetchedTailles = await TaillesService.getAllTailles(token);
        setTailles(fetchedTailles);
        setError(null);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        setError(message);
        setTailles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTailles();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredTailles = tailles.filter(
    (taille) =>
      taille &&
      taille.nom && taille.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Nom de la taille',
      render: (item: Taille) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="font-bold">{item.nom || 'N/A'}</div>
          </div>
        </div>
      ),
    },
  ];

  const tailleFields: Field<FormData>[] = [
    {
      name: 'nom',
      label: 'Nom',
      type: 'text',
      placeholder: 'Nom de la taille (ex: S, M, L, XL)',
      validation: {
        required: true,
        minLength: 1,
        maxLength: 10,
        pattern: '[A-Za-z0-9\\s]*',
        title: 'Seules les lettres, chiffres et espaces sont autorisés',
      },
      hint: '1-10 caractères, lettres, chiffres et espaces',
    },
  ];

  const handleAddSubmit = async (data: FormData) => {
    try {
      const tailleData: TailleFormData = { nom: data.nom };
      const newTaille = await TaillesService.createTaille(tailleData,token);
      setTailles([...tailles, newTaille]);
      setIsAddModalOpen(false);

      setFormData({
        idTaille: null,
        nom: '',
      });
      setFormKey((prev) => prev + 1);

      setNotification({
        type: 'success',
        message: 'Taille ajoutée avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de l'ajout de la taille: ${message}`,
      });
    }
  };

  const handleEditSubmit = async (data: FormData) => {
    try {
      if (!data.idTaille) {
        setNotification({
          type: 'error',
          message: 'Aucune taille sélectionnée pour modification.',
        });
        return;
      }

      const tailleData: TailleFormData = { nom: data.nom };
      const updatedTaille = await TaillesService.updateTaille(data.idTaille, tailleData,token);

      setTailles(tailles.map((taille) => (taille.idTaille === data.idTaille ? updatedTaille : taille)));
      setIsEditModalOpen(false);
      setFormKey((prev) => prev + 1);

      setNotification({
        type: 'success',
        message: 'Taille modifiée avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de la modification de la taille: ${message}`,
      });
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      for (const id of selectedTailles) {
        await TaillesService.deleteTaille(id,token);
      }
      setTailles(tailles.filter((taille) => !selectedTailles.includes(taille.idTaille)));
      setSelectedTailles([]);
      setIsDeleteModalOpen(false);
      setNotification({
        type: 'success',
        message: 'Taille(s) supprimée(s) avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de la suppression de la taille: ${message}`,
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.checked) {
      setSelectedTailles([...selectedTailles, id]);
    } else {
      setSelectedTailles(selectedTailles.filter((tailleId) => tailleId !== id));
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTailles(filteredTailles.map((taille) => taille.idTaille));
    } else {
      setSelectedTailles([]);
    }
  };

  const handleAdd = () => {
    setFormData({
      idTaille: null,
      nom: '',
    });
    setFormKey((prev) => prev + 1);
    setIsAddModalOpen(true);
  };

  const handleEdit = async (taille: Taille) => {
    try {
      const fetchedTaille = await TaillesService.getTailleById(taille.idTaille,token);

      setFormData({
        idTaille: fetchedTaille.idTaille,
        nom: fetchedTaille.nom || '',
      });
      
      setFormKey((prev) => prev + 1);
      setIsEditModalOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur lors du chargement des données de la taille: ${message}`,
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
    return (
      <div className="text-center p-6">
        <div className="text-error mb-4">{error}</div>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 w-full h-screen flex flex-col relative">
      <Notification notification={notification} onClose={() => setNotification(null)} />
      <HeaderCardComponent
        title="Liste des Tailles"
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        selectedItems={selectedTailles}
        onEdit={() => {
          const taille = tailles.find((t) => t.idTaille === selectedTailles[0]);
          if (taille) handleEdit(taille);
        }}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />
      <TableComponent
        data={filteredTailles}
        columns={columns}
        loading={loading}
        error={error}
        selectedItems={selectedTailles}
        handleCheckboxChange={handleCheckboxChange}
        handleSelectAll={handleSelectAll}
        onEdit={handleEdit}
        onDelete={(id: number) => {
          setSelectedTailles([id]);
          handleDelete();
        }}
        idField="idTaille"
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemCount={selectedTailles.length}
        entityName="taille(s)"
      />
      <FormModal
        key={`add-${formKey}`}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter une Nouvelle Taille"
        fields={tailleFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddSubmit}
        submitButtonText="Ajouter"
      />
      <FormModal
        key={`edit-${formKey}`}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier une Taille"
        fields={tailleFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditSubmit}
        submitButtonText="Modifier"
      />
    </div>
  );
};

export default Tailles;