'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import TableComponent from '@/components/layout/TableComponent';
import HeaderCardComponent from '@/components/layout/HeaderCardComponent';
import FormModal from '@/components/layout/FormModal';
import Notification from '@/components/layout/Notification';
import ConfirmDeleteModal from '@/components/layout/ConfirmDeleteModal';
import CategoriesService from '@/services/categories-service';
import TypesService from '@/services/types-service';

interface Produit {
  idProduit: number;
  nom: string;
  prix: number;
}

interface Type {
  idType: number;
  nom: string;
}

interface Categorie {
  idCategorie: number;
  nom: string;
  description: string | null;
  produits?: Produit[];
  types?: Type[];
}

interface FormData {
  idCategorie: number | null;
  nom: string;
  description: string | null;
  typeIds: number[];
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

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    idCategorie: null,
    nom: '',
    description: '',
    typeIds: [],
  });
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedCategories, fetchedTypes] = await Promise.all([
          CategoriesService.getAllCategories(),
          TypesService.getAllTypes(),
        ]);
        console.log('Données récupérées:', { fetchedCategories, fetchedTypes });
        setCategories(fetchedCategories);
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

  const filteredCategories = categories.filter(
    (categorie) =>
      categorie &&
      ((categorie.nom && categorie.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (categorie.description && categorie.description.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const columns = [
    {
      header: 'Nom de la catégorie',
      render: (item: Categorie) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="font-bold">{item.nom || 'N/A'}</div>
            <div className="text-sm opacity-50">{item.description || 'N/A'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Produits',
      render: (item: Categorie) => (item.produits ? item.produits.length : 0),
    },
    {
      header: 'Types',
      render: (item: Categorie) => {
        if (!item.types || item.types.length === 0) {
          return <span className="text-gray-400">N/A</span>;
        }
        
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {item.types.slice(0, 3).map((type, index) => (
              <span 
                key={type.idType} 
                className="badge badge-sm badge-outline"
              >
                {type.nom}
              </span>
            ))}
            {item.types.length > 3 && (
              <div className="tooltip tooltip-top" data-tip={item.types.slice(3).map(t => t.nom).join(', ')}>
                <span className="badge badge-sm badge-info cursor-help">
                  +{item.types.length - 3}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  const categorieFields: Field<FormData>[] = [
    {
      name: 'nom',
      label: 'Nom',
      type: 'text',
      placeholder: 'Nom de la catégorie',
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
      placeholder: 'Description de la catégorie',
      validation: {
        required: false,
        maxLength: 500,
        title: 'Maximum 500 caractères',
      },
      hint: 'Maximum 500 caractères (optionnel)',
    },
    {
      name: 'typeIds',
      label: 'Types',
      type: 'custom',
      render: ({ value, onChange }) => {
        console.log('Render Select Types - formData complet:', formData);

        const typeIds = formData.typeIds || [];
        console.log('typeIds depuis formData:', typeIds);
        console.log('types disponibles:', types);

        const options = types.map((type) => ({
          value: type.idType,
          label: type.nom,
        }));
        console.log('Options créées pour Select Types:', options);

        const selectedValues = options.filter((option) => typeIds.includes(option.value));
        console.log('Valeurs sélectionnées pour Select Types:', selectedValues);

        // Custom styles for react-select
        const customStyles = {
          menu: (provided: any) => ({
            ...provided,
            ...(options.length > 4
              ? {
                  maxHeight: '150px', // Constrain height when > 4 options
                  overflowY: 'auto', // Enable scrollbar
                }
              : {}),
            zIndex: 10000, // Ensure menu is above modal
            position: 'absolute', // Proper positioning
            width: '100%', // Match control width
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Add shadow
          }),
          menuList: (provided: any) => ({
            ...provided,
            ...(options.length > 4
              ? {
                  maxHeight: '150px', // Match max height
                  overflowY: 'auto', // Enable scrollbar
                }
              : {}),
          }),
          control: (provided: any) => ({
            ...provided,
            minHeight: '40px', // Space for selected items
            borderRadius: '4px',
          }),
          valueContainer: (provided: any) => ({
            ...provided,
            flexWrap: 'wrap', // Allow selected items to wrap
            padding: '4px',
          }),
          menuPortal: (provided: any) => ({
            ...provided,
            zIndex: 10000, // Ensure portal is above modal
          }),
        };

        return (
          <div className="relative">
            <Select
              isMulti
              options={options}
              value={selectedValues}
              onChange={(selectedOptions) => {
                console.log('onChange Types déclenché - selectedOptions:', selectedOptions);
                const newValues = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                console.log('Nouvelles valeurs Types à envoyer:', newValues);

                setFormData((prev) => ({
                  ...prev,
                  typeIds: newValues,
                }));
                onChange(newValues);
              }}
              placeholder="Sélectionnez les types"
              className="w-full"
              isClearable={true}
              closeMenuOnSelect={false}
              styles={customStyles}
              menuPortalTarget={document.body} // Render dropdown in body
              menuPosition="absolute" // Position relative to control
              menuShouldScrollIntoView={true} // Ensure dropdown scrolls into view
            />
          </div>
        );
      },
      validation: {
        required: false,
        validate: (value: any) => '',
        title: 'Sélectionnez les types associés',
      },
      hint: 'Choisissez les types associés (optionnel)',
    },
  ];

  const handleAddSubmit = async (data: FormData) => {
    console.log('Données à soumettre pour ajout catégorie:', data);
    try {
      const newCategorie = await CategoriesService.createCategorie(data);
      
      const updatedCategories = await CategoriesService.getAllCategories();
      setCategories(updatedCategories);
      
      setIsAddModalOpen(false);
      setNotification({
        type: 'success',
        message: 'Catégorie ajoutée avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de l'ajout de la catégorie: ${message}`,
      });
    }
  };

  const handleEditSubmit = async (data: FormData) => {
    console.log('Données à soumettre pour modification catégorie:', data);
    try {
      if (!data.idCategorie) {
        setNotification({
          type: 'error',
          message: 'Aucune catégorie sélectionnée pour modification.',
        });
        return;
      }
      
      await CategoriesService.updateCategorie(data.idCategorie, data);
      
      const updatedCategories = await CategoriesService.getAllCategories();
      setCategories(updatedCategories);
      
      setIsEditModalOpen(false);
      setNotification({
        type: 'success',
        message: 'Catégorie modifiée avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de la modification de la catégorie: ${message}`,
      });
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      for (const id of selectedCategories) {
        await CategoriesService.deleteCategorie(id);
      }
      setCategories(categories.filter((categorie) => !selectedCategories.includes(categorie.idCategorie)));
      setSelectedCategories([]);
      setIsDeleteModalOpen(false);
      setNotification({
        type: 'success',
        message: 'Catégorie(s) supprimée(s) avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de la suppression de la catégorie: ${message}`,
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.checked) {
      setSelectedCategories([...selectedCategories, id]);
    } else {
      setSelectedCategories(selectedCategories.filter((categorieId) => categorieId !== id));
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCategories(filteredCategories.map((categorie) => categorie.idCategorie));
    } else {
      setSelectedCategories([]);
    }
  };

  const handleAdd = () => {
    const initialFormData = {
      idCategorie: null,
      nom: '',
      description: '',
      typeIds: [],
    };
    console.log('Initialisation formulaire ajout catégorie:', initialFormData);
    setFormData(initialFormData);
    setIsAddModalOpen(true);
  };

  const handleEdit = async (categorie: Categorie) => {
    try {
      const fetchedCategorie = await CategoriesService.getCategorieById(categorie.idCategorie);
      console.log('Catégorie récupérée pour édition:', fetchedCategorie);
      
      const editFormData = {
        idCategorie: fetchedCategorie.idCategorie,
        nom: fetchedCategorie.nom || '',
        description: fetchedCategorie.description || '',
        typeIds: Array.isArray(fetchedCategorie.types) ? fetchedCategorie.types.map((type) => type.idType) : [],
      };
      console.log('Données du formulaire d\'édition catégorie:', editFormData);
      
      setFormData(editFormData);
      setIsEditModalOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur lors du chargement des données de la catégorie: ${message}`,
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
        title="Liste des Catégories"
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        selectedItems={selectedCategories}
        onEdit={() => {
          const categorie = categories.find((c) => c.idCategorie === selectedCategories[0]);
          if (categorie) handleEdit(categorie);
        }}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />
      <TableComponent
        data={filteredCategories}
        columns={columns}
        loading={loading}
        error={error}
        selectedItems={selectedCategories}
        handleCheckboxChange={handleCheckboxChange}
        handleSelectAll={handleSelectAll}
        onEdit={handleEdit}
        onDelete={(id: number) => {
          setSelectedCategories([id]);
          handleDelete();
        }}
        idField="idCategorie"
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemCount={selectedCategories.length}
        entityName="catégorie(s)"
      />
      <FormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter une Nouvelle Catégorie"
        fields={categorieFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddSubmit}
        submitButtonText="Ajouter"
      />
      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier une Catégorie"
        fields={categorieFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditSubmit}
        submitButtonText="Modifier"
      />
    </div>
  );
};

export default Categories;