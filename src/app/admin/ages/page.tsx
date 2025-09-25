'use client';

import React, { useState, useEffect } from 'react';
import TableComponent from '@/components/layout/TableComponent';
import HeaderCardComponent from '@/components/layout/HeaderCardComponent';
import FormModal from '@/components/layout/FormModal';
import Notification from '@/components/layout/Notification';
import ConfirmDeleteModal from '@/components/layout/ConfirmDeleteModal';
import AgesService, { Age, AgeFormData } from '@/services/ages-service';

interface FormData {
  idAge: number | null;
  minAge: number;
  maxAge: number;
  typeAge: 'mois' | 'ans';
  label: string;
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

const Ages: React.FC = () => {
  const [ages, setAges] = useState<Age[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    idAge: null,
    minAge: 0,
    maxAge: 0,
    typeAge: 'ans',
    label: '',
  });
  const [selectedAges, setSelectedAges] = useState<number[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formKey, setFormKey] = useState(0);

  // Fetch ages on component mount
  useEffect(() => {
    const fetchAges = async () => {
      try {
        setLoading(true);
        const fetchedAges = await AgesService.getAllAges();
        setAges(fetchedAges);
        setError(null);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        console.error('Erreur lors de la récupération:', error);
        setError(message);
        setAges([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAges();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredAges = ages.filter(
    (age) =>
      age &&
      ((age.label && age.label.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (age.typeAge && age.typeAge.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const columns = [
    {
      header: 'Tranche d\'âge',
      render: (item: Age) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="font-bold">{item.label || 'N/A'}</div>
            <div className="text-sm opacity-50">
              {item.minAge} - {item.maxAge} {item.typeAge}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Min',
      render: (item: Age) => `${item.minAge}`,
    },
    {
      header: 'Max',
      render: (item: Age) => `${item.maxAge}`,
    },
    {
      header: 'Type',
      render: (item: Age) => (
        <span className={`badge ${item.typeAge === 'mois' ? 'badge-info' : 'badge-success'}`}>
          {item.typeAge}
        </span>
      ),
    },
  ];

  const ageFields: Field<FormData>[] = [
    {
      name: 'label',
      label: 'Label',
      type: 'text',
      placeholder: 'ex: Nouveau-né, Enfant, Adolescent',
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: '[A-Za-zÀ-ÿ0-9\\s\\-]*',
        title: 'Seules les lettres, chiffres, espaces et tirets sont autorisés',
      },
      hint: '2-50 caractères, description de la tranche d\'âge',
    },
    {
      name: 'minAge',
      label: 'Âge minimum',
      type: 'number',
      placeholder: '0',
      validation: {
        required: true,
        min: 0,
        max: 100,
        step: 1,
        validate: (value: any, allData: any) => {
          if (allData.maxAge && parseInt(value) >= parseInt(allData.maxAge)) {
            return 'L\'âge minimum doit être inférieur à l\'âge maximum';
          }
          return '';
        },
      },
      hint: 'Âge minimum de 0 à 100',
    },
    {
      name: 'maxAge',
      label: 'Âge maximum',
      type: 'number',
      placeholder: '0',
      validation: {
        required: true,
        min: 0,
        max: 100,
        step: 1,
        validate: (value: any, allData: any) => {
          if (allData.minAge && parseInt(value) <= parseInt(allData.minAge)) {
            return 'L\'âge maximum doit être supérieur à l\'âge minimum';
          }
          return '';
        },
      },
      hint: 'Âge maximum de 0 à 100',
    },
    {
      name: 'typeAge',
      label: 'Type d\'âge',
      type: 'custom',
      render: ({ value, onChange }) => (
        <select
          className="select select-bordered w-full"
          value={value}
          onChange={(e) => onChange(e.target.value as 'mois' | 'ans')}
        >
          <option value="ans">Ans</option>
          <option value="mois">Mois</option>
        </select>
      ),
      validation: {
        required: true,
      },
      hint: 'Choisir entre mois ou ans',
    },
  ];

  const handleAddSubmit = async (data: FormData) => {
    try {
      const ageData: AgeFormData = {
        minAge: data.minAge,
        maxAge: data.maxAge,
        typeAge: data.typeAge,
        label: data.label,
      };
      const newAge = await AgesService.createAge(ageData);
      setAges([...ages, newAge]);
      setIsAddModalOpen(false);

      setFormData({
        idAge: null,
        minAge: 0,
        maxAge: 0,
        typeAge: 'ans',
        label: '',
      });
      setFormKey((prev) => prev + 1);

     setNotification({
        type: 'success',
        message: 'Tranche d\'âge ajoutée avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors de l\'ajout:', error);
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de l'ajout de la tranche d'âge: ${message}`,
      });
    }
  };

  const handleEditSubmit = async (data: FormData) => {
    try {
      if (!data.idAge) {
        setNotification({
          type: 'error',
          message: 'Aucune tranche d\'âge sélectionnée pour modification.',
        });
        return;
      }

      const ageData: AgeFormData = {
        minAge: data.minAge,
        maxAge: data.maxAge,
        typeAge: data.typeAge,
        label: data.label,
      };
      const updatedAge = await AgesService.updateAge(data.idAge, ageData);

      setAges(ages.map((age) => (age.idAge === data.idAge ? updatedAge : age)));
      setIsEditModalOpen(false);
      setFormKey((prev) => prev + 1);

      setNotification({
        type: 'success',
        message: 'Tranche d\'âge modifiée avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors de la modification:', error);
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de la modification de la tranche d'âge: ${message}`,
      });
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      for (const id of selectedAges) {
        await AgesService.deleteAge(id);
      }
      setAges(ages.filter((age) => !selectedAges.includes(age.idAge)));
      setSelectedAges([]);
      setIsDeleteModalOpen(false);
      setNotification({
        type: 'success',
        message: 'Tranche(s) d\'âge supprimée(s) avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors de la suppression:', error);
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de la suppression de la tranche d'âge: ${message}`,
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.checked) {
      setSelectedAges([...selectedAges, id]);
    } else {
      setSelectedAges(selectedAges.filter((ageId) => ageId !== id));
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedAges(filteredAges.map((age) => age.idAge));
    } else {
      setSelectedAges([]);
    }
  };

  const handleAdd = () => {
    setFormData({
      idAge: null,
      minAge: 0,
      maxAge: 0,
      typeAge: 'ans',
      label: '',
    });
    setFormKey((prev) => prev + 1);
    setIsAddModalOpen(true);
  };

  const handleEdit = async (age: Age) => {
    try {
      const fetchedAge = await AgesService.getAgeById(age.idAge);

      setFormData({
        idAge: fetchedAge.idAge,
        minAge: fetchedAge.minAge,
        maxAge: fetchedAge.maxAge,
        typeAge: fetchedAge.typeAge,
        label: fetchedAge.label || '',
      });
      
      setFormKey((prev) => prev + 1);
      setIsEditModalOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors du chargement pour modification:', error);
      setNotification({
        type: 'error',
        message: `Erreur lors du chargement des données de la tranche d'âge: ${message}`,
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
        title="Liste des Tranches d'Âge"
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        selectedItems={selectedAges}
        onEdit={() => {
          const age = ages.find((a) => a.idAge === selectedAges[0]);
          if (age) handleEdit(age);
        }}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />
      <TableComponent
        data={filteredAges}
        columns={columns}
        loading={loading}
        error={error}
        selectedItems={selectedAges}
        handleCheckboxChange={handleCheckboxChange}
        handleSelectAll={handleSelectAll}
        onEdit={handleEdit}
        onDelete={(id: number) => {
          setSelectedAges([id]);
          handleDelete();
        }}
        idField="idAge"
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemCount={selectedAges.length}
        entityName="tranche(s) d'âge"
      />
      <FormModal
        key={`add-${formKey}`}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter une Nouvelle Tranche d'Âge"
        fields={ageFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddSubmit}
        submitButtonText="Ajouter"
      />
      <FormModal
        key={`edit-${formKey}`}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier une Tranche d'Âge"
        fields={ageFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditSubmit}
        submitButtonText="Modifier"
      />
    </div>
  );
};

export default Ages;