// Fournisseurs.tsx
'use client';

import React, { useState, useEffect } from 'react';
import TableComponent from '@/components/layout/TableComponent';
import HeaderCardComponent from '@/components/layout/HeaderCardComponent';
import FormModal from '@/components/layout/FormModal';
import Notification from '@/components/layout/Notification';
import ConfirmDeleteModal from '@/components/layout/ConfirmDeleteModal';
import FournisseursService, { Fournisseur, FournisseurFormData } from '@/services/fournisseurs-service';
import { useSession } from "next-auth/react";

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

const Fournisseurs: React.FC = () => {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState<FournisseurFormData>({
    idFournisseur: null,
    prenom: '',
    nom: '',
    email: null,
    telephone: '',
  });
  const [selectedFournisseurs, setSelectedFournisseurs] = useState<number[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
const { data: session, status } = useSession();
const token = session?.customToken;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedFournisseurs = await FournisseursService.getAllFournisseurs(token);
        setFournisseurs(fetchedFournisseurs);
        setLoading(false);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatTelephone = (telephone: any): string => {
    return telephone || 'N/A';
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredFournisseurs = fournisseurs.filter(
    (fournisseur) =>
      fournisseur &&
      ((fournisseur.prenom && fournisseur.prenom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (fournisseur.nom && fournisseur.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (fournisseur.email && fournisseur.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (fournisseur.telephone && fournisseur.telephone.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const columns = [
    {
      header: 'Prénom',
      render: (item: Fournisseur) => item.prenom || 'N/A',
    },
    {
      header: 'Nom',
      render: (item: Fournisseur) => item.nom || 'N/A',
    },
    {
      header: 'Email',
      render: (item: Fournisseur) => item.email || 'N/A',
    },
    {
      header: 'Téléphone',
      render: (item: Fournisseur) => formatTelephone(item.telephone),
    },
  ];

  const fournisseurFields: Field<FournisseurFormData>[] = [
    {
      name: 'prenom',
      label: 'Prénom',
      type: 'text',
      placeholder: 'Prénom du fournisseur',
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50,
        title: 'Le prénom doit contenir entre 2 et 50 caractères',
      },
      hint: '2-50 caractères',
    },
    {
      name: 'nom',
      label: 'Nom',
      type: 'text',
      placeholder: 'Nom du fournisseur',
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50,
        title: 'Le nom doit contenir entre 2 et 50 caractères',
      },
      hint: '2-50 caractères',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'email@exemple.com',
      validation: {
        required: false,
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        title: 'Veuillez entrer un email valide',
      },
      hint: 'Email du fournisseur (optionnel)',
    },
    {
      name: 'telephone',
      label: 'Téléphone',
      type: 'text',
      placeholder: '12345678',
      validation: {
        required: true,
        pattern: '^[0-9]{8}$',
        title: 'Le numéro de téléphone doit contenir 8 chiffres',
      },
      hint: 'Numéro de téléphone à 8 chiffres',
    },
  ];

  const handleAddSubmit = async (data: FournisseurFormData) => {
    try {
      const response = await FournisseursService.createFournisseur(data,token);
      setFournisseurs([...fournisseurs, response]);
      setIsAddModalOpen(false);
      setNotification({
        type: 'success',
        message: 'Fournisseur ajouté avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de l'ajout du fournisseur: ${message}`,
      });
    }
  };

  const handleEditSubmit = async (data: FournisseurFormData) => {
    try {
      if (!data.idFournisseur) {
        setNotification({
          type: 'error',
          message: 'Aucun fournisseur sélectionné pour modification.',
        });
        return;
      }
      const updatedFournisseur = await FournisseursService.updateFournisseur(data.idFournisseur, data,token);
      setFournisseurs(
        fournisseurs.map((fournisseur) =>
          fournisseur.idFournisseur === data.idFournisseur ? updatedFournisseur : fournisseur
        )
      );
      setIsEditModalOpen(false);
      setNotification({
        type: 'success',
        message: 'Fournisseur modifié avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de la modification du fournisseur: ${message}`,
      });
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      for (const id of selectedFournisseurs) {
        await FournisseursService.deleteFournisseur(id,token);
      }
      setFournisseurs(fournisseurs.filter((fournisseur) => !selectedFournisseurs.includes(fournisseur.idFournisseur)));
      setSelectedFournisseurs([]);
      setIsDeleteModalOpen(false);
      setNotification({
        type: 'success',
        message: 'Fournisseur(s) supprimé(s) avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de la suppression du fournisseur: ${message}`,
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.checked) {
      setSelectedFournisseurs([...selectedFournisseurs, id]);
    } else {
      setSelectedFournisseurs(selectedFournisseurs.filter((fournisseurId) => fournisseurId !== id));
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedFournisseurs(filteredFournisseurs.map((fournisseur) => fournisseur.idFournisseur));
    } else {
      setSelectedFournisseurs([]);
    }
  };

  const handleAdd = () => {
    const newFormData = {
      idFournisseur: null,
      prenom: '',
      nom: '',
      email: null,
      telephone: '',
    };
    setFormData(newFormData);
    setIsAddModalOpen(true);
  };

  const handleEdit = async (fournisseur: Fournisseur) => {
    try {
      const fetchedFournisseur = await FournisseursService.getFournisseurById(fournisseur.idFournisseur,token);
      const newFormData = {
        idFournisseur: fetchedFournisseur.idFournisseur,
        prenom: fetchedFournisseur.prenom || '',
        nom: fetchedFournisseur.nom || '',
        email: fetchedFournisseur.email || null,
        telephone: fetchedFournisseur.telephone || '',
      };
      setFormData(newFormData);
      setIsEditModalOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur lors du chargement des données du fournisseur: ${message}`,
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
        title="Liste des Fournisseurs"
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        selectedItems={selectedFournisseurs}
        onEdit={() => {
          const fournisseur = fournisseurs.find((f) => f.idFournisseur === selectedFournisseurs[0]);
          if (fournisseur) handleEdit(fournisseur);
        }}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />
      <TableComponent
        data={filteredFournisseurs}
        columns={columns}
        loading={loading}
        error={error}
        selectedItems={selectedFournisseurs}
        handleCheckboxChange={handleCheckboxChange}
        handleSelectAll={handleSelectAll}
        onEdit={handleEdit}
        onDelete={(id: number) => {
          setSelectedFournisseurs([id]);
          handleDelete();
        }}
        idField="idFournisseur"
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemCount={selectedFournisseurs.length}
        entityName="fournisseur(s)"
      />
      <FormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter un Nouveau Fournisseur"
        fields={fournisseurFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddSubmit}
        submitButtonText="Ajouter"
      />
      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier un Fournisseur"
        fields={fournisseurFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditSubmit}
        submitButtonText="Modifier"
      />
    </div>
  );
};

export default Fournisseurs;