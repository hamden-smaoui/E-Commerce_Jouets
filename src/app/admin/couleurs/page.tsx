'use client';

import React, { useState, useEffect } from 'react';
import TableComponent from '@/components/layout/TableComponent';
import HeaderCardComponent from '@/components/layout/HeaderCardComponent';
import FormModal from '@/components/layout/FormModal';
import Notification from '@/components/layout/Notification';
import ConfirmDeleteModal from '@/components/layout/ConfirmDeleteModal';
import CouleursService, { Couleur, CouleurFormData } from '@/services/couleurs-service';
import { useSession } from "next-auth/react";

interface FormData {
  idCouleur: number | null;
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

const Couleurs: React.FC = () => {
  const [couleurs, setCouleurs] = useState<Couleur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    idCouleur: null,
    nom: '',
  });
  const [selectedCouleurs, setSelectedCouleurs] = useState<number[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formKey, setFormKey] = useState(0);

const { data: session, status } = useSession();
const token = session?.customToken;
  // Fetch couleurs on component mount
  useEffect(() => {
    const fetchCouleurs = async () => {
      try {
        setLoading(true);
        const fetchedCouleurs = await CouleursService.getAllCouleurs(token);
        setCouleurs(fetchedCouleurs);
        setError(null);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        console.error('Erreur lors de la récupération:', error);
        setError(message);
        setCouleurs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCouleurs();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredCouleurs = couleurs.filter(
    (couleur) =>
      couleur &&
      couleur.nom && couleur.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Nom de la couleur',
      render: (item: Couleur) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="font-bold">{item.nom || 'N/A'}</div>
          </div>
        </div>
      ),
    },
  ];

  const couleurFields: Field<FormData>[] = [
    {
      name: 'nom',
      label: 'Nom',
      type: 'text',
      placeholder: 'Nom de la couleur',
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: '[A-Za-z0-9\\s]*',
        title: 'Seules les lettres, chiffres et espaces sont autorisés',
      },
      hint: '2-50 caractères, lettres, chiffres et espaces',
    },
  ];

  const handleAddSubmit = async (data: FormData) => {
    try {
      const couleurData: CouleurFormData = { nom: data.nom };
      const newCouleur = await CouleursService.createCouleur(couleurData,token);
      setCouleurs([...couleurs, newCouleur]);
      setIsAddModalOpen(false);

      setFormData({
        idCouleur: null,
        nom: '',
      });
      setFormKey((prev) => prev + 1);

      setNotification({
        type: 'success',
        message: 'Couleur ajoutée avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors de l\'ajout:', error);
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de l'ajout de la couleur: ${message}`,
      });
    }
  };

  const handleEditSubmit = async (data: FormData) => {
    try {
      if (!data.idCouleur) {
        setNotification({
          type: 'error',
          message: 'Aucune couleur sélectionnée pour modification.',
        });
        return;
      }

      const couleurData: CouleurFormData = { nom: data.nom };
      const updatedCouleur = await CouleursService.updateCouleur(data.idCouleur, couleurData,token);

      setCouleurs(couleurs.map((couleur) => (couleur.idCouleur === data.idCouleur ? updatedCouleur : couleur)));
      setIsEditModalOpen(false);
      setFormKey((prev) => prev + 1);

      setNotification({
        type: 'success',
        message: 'Couleur modifiée avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors de la modification:', error);
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de la modification de la couleur: ${message}`,
      });
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      for (const id of selectedCouleurs) {
        await CouleursService.deleteCouleur(id,token);
      }
      setCouleurs(couleurs.filter((couleur) => !selectedCouleurs.includes(couleur.idCouleur)));
      setSelectedCouleurs([]);
      setIsDeleteModalOpen(false);
      setNotification({
        type: 'success',
        message: 'Couleur(s) supprimée(s) avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors de la suppression:', error);
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de la suppression de la couleur: ${message}`,
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.checked) {
      setSelectedCouleurs([...selectedCouleurs, id]);
    } else {
      setSelectedCouleurs(selectedCouleurs.filter((couleurId) => couleurId !== id));
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCouleurs(filteredCouleurs.map((couleur) => couleur.idCouleur));
    } else {
      setSelectedCouleurs([]);
    }
  };

  const handleAdd = () => {
    setFormData({
      idCouleur: null,
      nom: '',
    });
    setFormKey((prev) => prev + 1);
    setIsAddModalOpen(true);
  };

  const handleEdit = async (couleur: Couleur) => {
    try {
      const fetchedCouleur = await CouleursService.getCouleurById(couleur.idCouleur,token);

      setFormData({
        idCouleur: fetchedCouleur.idCouleur,
        nom: fetchedCouleur.nom || '',
      });
      
      setFormKey((prev) => prev + 1);
      setIsEditModalOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors du chargement pour modification:', error);
      setNotification({
        type: 'error',
        message: `Erreur lors du chargement des données de la couleur: ${message}`,
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
        title="Liste des Couleurs"
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        selectedItems={selectedCouleurs}
        onEdit={() => {
          const couleur = couleurs.find((c) => c.idCouleur === selectedCouleurs[0]);
          if (couleur) handleEdit(couleur);
        }}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />
      <TableComponent
        data={filteredCouleurs}
        columns={columns}
        loading={loading}
        error={error}
        selectedItems={selectedCouleurs}
        handleCheckboxChange={handleCheckboxChange}
        handleSelectAll={handleSelectAll}
        onEdit={handleEdit}
        onDelete={(id: number) => {
          setSelectedCouleurs([id]);
          handleDelete();
        }}
        idField="idCouleur"
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemCount={selectedCouleurs.length}
        entityName="couleur(s)"
      />
      <FormModal
        key={`add-${formKey}`}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter une Nouvelle Couleur"
        fields={couleurFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddSubmit}
        submitButtonText="Ajouter"
      />
      <FormModal
        key={`edit-${formKey}`}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier une Couleur"
        fields={couleurFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditSubmit}
        submitButtonText="Modifier"
      />
    </div>
  );
};

export default Couleurs;