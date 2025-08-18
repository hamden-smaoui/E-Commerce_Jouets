// Produits.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import TableComponent from '@/components/layout/TableComponent';
import HeaderCardComponent from '@/components/layout/HeaderCardComponent';
import FormModal from '@/components/layout/FormModal';
import Notification from '@/components/layout/Notification';
import ConfirmDeleteModal from '@/components/layout/ConfirmDeleteModal';
import ProduitsService, { Produit, ProduitFormData } from '@/services/produits-service';
import CategoriesService from '@/services/categories-service';
import MarquesService from '@/services/marques-service';
import FournisseursService from '@/services/fournisseurs-service'; // Added
import ImageManager from '@/components/layout/ImageManager';
import { ImageData } from '@/services/produits-service';

// Define TypeScript interface for Type from the backend
interface Type {
  idType: number;
  nom: string;
}

// Define TypeScript interface for Categorie from the backend
interface Categorie {
  idCategorie: number;
  nom: string;
  types?: Type[];
}

// Define TypeScript interface for Marque from the backend
interface Marque {
  idMarque: number;
  nom: string;
}
  interface Fournisseur {
  idFournisseur: number;
  nom: string;
 
}

// Updated FormData interface to include idFournisseur
interface FormData {
  idProduit: number | null;
  nom: string;
  description: string;
  prix: number;
  quantiteStock: number;
  idCategorie: number;
  idMarque: number;
  idFournisseur: number; // Added
  idType: number | null;
  trancheAge: string | null;
  images: File[];
}

// Updated ProduitResponse interface to include fournisseur
interface ProduitResponse extends Produit {
  categorie?: Categorie;
  marque?: Marque;
  fournisseur?: Fournisseur; // Added
  type?: Type;
  images?: ImageData[];
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

const Produits: React.FC = () => {
  const [produits, setProduits] = useState<ProduitResponse[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [marques, setMarques] = useState<Marque[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]); // Added
  const [types, setTypes] = useState<Type[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ImageData[]>([]);
  const [formData, setFormData] = useState<FormData>({
    idProduit: null,
    nom: '',
    description: '',
    prix: 0,
    quantiteStock: 0,
    idCategorie: 0,
    idMarque: 0,
    idFournisseur: 0, // Added
    idType: null,
    trancheAge: '',
    images: [],
  });
  const [selectedProduits, setSelectedProduits] = useState<number[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedProduits, fetchedCategories, fetchedMarques, fetchedFournisseurs] = await Promise.all([
          ProduitsService.getAllProduits(),
          CategoriesService.getAllCategories(),
          MarquesService.getAllMarques(),
          FournisseursService.getAllFournisseurs(), // Added
        ]);
        setProduits(fetchedProduits);
        setCategories(fetchedCategories);
        setMarques(fetchedMarques);
        setFournisseurs(fetchedFournisseurs); // Added
        setLoading(false);
        console.log('Produits fetched:', fetchedProduits);
        console.log('Categories fetched:', fetchedCategories);
        console.log('Marques fetched:', fetchedMarques);
        console.log('Fournisseurs fetched:', fetchedFournisseurs);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    console.log('useEffect: formData.idCategorie:', formData.idCategorie, 'categories:', categories);
    if (formData.idCategorie > 0) {
      const selectedCategory = categories.find((cat) => cat.idCategorie === formData.idCategorie);
      console.log('Selected category:', selectedCategory);
      const newTypes = selectedCategory?.types || [];
      setTypes(newTypes);
      console.log('Updated types:', newTypes);
      if (formData.idType && newTypes.length > 0 && !newTypes.some((type) => type.idType === formData.idType)) {
        console.log('Resetting idType: Current idType', formData.idType, 'not found in types:', newTypes);
        setFormData((prev) => ({ ...prev, idType: null }));
      }
    } else {
      console.log('No category selected, resetting types and idType');
      setTypes([]);
      setFormData((prev) => ({ ...prev, idType: null }));
    }
  }, [formData.idCategorie, categories]);

  const formatPrice = (prix: any): string => {
    if (prix === null || prix === undefined || prix === '' || isNaN(Number(prix))) {
      return '0.00 TND';
    }
    return `${Number(prix).toFixed(2)} TND`;
  };

  const formatStock = (stock: any): number => {
    if (stock === null || stock === undefined || stock === '' || isNaN(Number(stock))) {
      return 0;
    }
    return Number(stock);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredProduits = produits.filter(
    (produit) =>
      produit &&
      ((produit.nom && produit.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (produit.description && produit.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (produit.categorie && produit.categorie.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (produit.marque && produit.marque.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (produit.fournisseur && produit.fournisseur.nom.toLowerCase().includes(searchTerm.toLowerCase())) || // Added
        (produit.type && produit.type.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (produit.trancheAge && produit.trancheAge.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const columns = [
    {
      header: 'Produit',
      render: (item: ProduitResponse) => (
        <div className="flex items-center gap-3">
          {item.images && item.images.length > 0 && (
            <div className="avatar">
              <div className="mask mask-squircle w-12 h-12">
                <img
                  src={`http://localhost:3001${item.images.find(img => img.rang === 1)?.url || item.images[0]?.url}`}
                  alt={item.nom}
                />
              </div>
            </div>
          )}
          <div>
            <div className="font-bold">{item.nom || 'N/A'}</div>
            <div className="text-sm opacity-50">{item.description || 'N/A'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Prix',
      render: (item: ProduitResponse) => formatPrice(item.prix),
    },
    {
      header: 'Stock',
      render: (item: ProduitResponse) => formatStock(item.quantiteStock),
    },
    {
      header: 'Catégorie',
      render: (item: ProduitResponse) => (item.categorie ? item.categorie.nom : 'N/A'),
    },
    {
      header: 'Marque',
      render: (item: ProduitResponse) => (item.marque ? item.marque.nom : 'N/A'),
    },
    {
      header: 'Fournisseur', // Added
      render: (item: ProduitResponse) => (item.fournisseur ? item.fournisseur.nom : 'N/A'),
    },
    {
      header: 'Type',
      render: (item: ProduitResponse) => (item.type ? item.type.nom : 'N/A'),
    },
    {
      header: 'Tranche d\'âge',
      render: (item: ProduitResponse) => item.trancheAge || 'N/A',
    },
  ];

  const customSelectStyles = {
    menu: (provided: any) => ({
      ...provided,
      maxHeight: '150px',
      overflowY: 'auto',
      zIndex: 10000,
      position: 'absolute',
      width: '100%',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    }),
    menuList: (provided: any) => ({
      ...provided,
      maxHeight: '150px',
      overflowY: 'auto',
    }),
    control: (provided: any) => ({
      ...provided,
      minHeight: '40px',
      borderRadius: '4px',
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      flexWrap: 'wrap',
      padding: '4px',
    }),
    menuPortal: (provided: any) => ({
      ...provided,
      zIndex: 10000,
    }),
  };

  const produitFields: Field<FormData>[] = [
    {
      name: 'nom',
      label: 'Nom du produit',
      type: 'text',
      placeholder: 'Nom du produit',
      validation: {
        required: true,
        minLength: 2,
        maxLength: 100,
        title: 'Le nom doit contenir entre 2 et 100 caractères',
      },
      hint: '2-100 caractères',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Description du produit',
      validation: {
        required: true,
        minLength: 10,
        maxLength: 1000,
        title: 'La description doit contenir entre 10 et 1000 caractères',
      },
      hint: '10-1000 caractères',
    },
    {
      name: 'prix',
      label: 'Prix (TND)',
      type: 'number',
      placeholder: '0.00',
      validation: {
        required: true,
        min: 0.01,
        step: 0.01,
        title: 'Le prix doit être supérieur à 0',
      },
      hint: 'Prix en dinars tunisiens',
    },
    {
      name: 'quantiteStock',
      label: 'Quantité en stock',
      type: 'number',
      placeholder: '0',
      validation: {
        required: true,
        min: 0,
        title: 'La quantité doit être supérieure ou égale à 0',
      },
      hint: 'Nombre d\'unités en stock',
    },
    {
      name: 'idCategorie',
      label: 'Catégorie',
      type: 'custom',
      render: ({ value, onChange }) => {
        const currentValue = value || 0;
        return (
          <div className="relative">
            <Select
              options={categories.map((categorie) => ({
                value: categorie.idCategorie,
                label: categorie.nom,
              }))}
              value={
                currentValue > 0
                  ? {
                      value: currentValue,
                      label: categories.find((c) => c.idCategorie === currentValue)?.nom || '',
                    }
                  : null
              }
              onChange={(selectedOption) => {
                const newValue = selectedOption ? selectedOption.value : 0;
                setFormData((prev) => ({
                  ...prev,
                  idCategorie: newValue,
                  idType: null,
                }));
                onChange(newValue);
              }}
              placeholder="Sélectionnez une catégorie"
              className="w-full"
              isClearable={false}
              styles={customSelectStyles}
              menuPortalTarget={document.body}
              menuPosition="absolute"
              menuShouldScrollIntoView={true}
            />
          </div>
        );
      },
      validation: {
        required: true,
        validate: (value: any) => {
          const idCategorie = value || 0;
          return idCategorie > 0 ? '' : 'Sélectionnez une catégorie';
        },
        title: 'Sélectionnez une catégorie',
      },
      hint: 'Choisissez une catégorie associée',
    },
    {
      name: 'idType',
      label: 'Type',
      type: 'custom',
      render: ({ value, onChange }) => {
        const currentIdType = value || null;
        const selectedType = currentIdType ? types.find((t) => t.idType === currentIdType) : null;
        console.log('Type Select - value:', value, 'currentIdType:', currentIdType, 'selectedType:', selectedType);
        return (
          <div>
            <Select
              options={types.map((type) => ({
                value: type.idType,
                label: type.nom,
              }))}
              value={
                selectedType
                  ? { value: selectedType.idType, label: selectedType.nom }
                  : null
              }
              onChange={(selectedOption) => {
                const newValue = selectedOption ? selectedOption.value : null;
                setFormData((prev) => ({
                  ...prev,
                  idType: newValue,
                }));
                onChange(newValue);
                console.log('Type sélectionné:', newValue);
              }}
              placeholder={
                formData.idCategorie === 0 || types.length === 0
                  ? 'Sélectionnez d\'abord une catégorie'
                  : 'Sélectionnez un type'
              }
              className="w-full"
              isClearable
              isDisabled={formData.idCategorie === 0 || types.length === 0}
              styles={customSelectStyles}
              menuPortalTarget={document.body}
              menuPosition="absolute"
              menuShouldScrollIntoView={true}
            />
            {formData.idCategorie > 0 && types.length === 0 && (
              <div className="text-sm text-gray-500 mt-1">
                Aucun type disponible pour cette catégorie
              </div>
            )}
          </div>
        );
      },
      validation: {
        required: false,
        title: 'Sélectionnez un type (optionnel)',
      },
      hint: 'Choisissez un type associé (optionnel)',
    },
    {
      name: 'idMarque',
      label: 'Marque',
      type: 'custom',
      render: ({ value, onChange }) => {
        const currentValue = value || 0;
        return (
          <div>
            <Select
              options={marques.map((marque) => ({
                value: marque.idMarque,
                label: marque.nom,
              }))}
              value={
                currentValue > 0
                  ? {
                      value: currentValue,
                      label: marques.find((m) => m.idMarque === currentValue)?.nom || '',
                    }
                  : null
              }
              onChange={(selectedOption) => {
                const newValue = selectedOption ? selectedOption.value : 0;
                setFormData((prev) => ({
                  ...prev,
                  idMarque: newValue,
                }));
                onChange(newValue);
              }}
              placeholder="Sélectionnez une marque"
              className="w-full"
              isClearable={false}
              styles={customSelectStyles}
              menuPortalTarget={document.body}
              menuPosition="absolute"
              menuShouldScrollIntoView={true}
            />
          </div>
        );
      },
      validation: {
        required: true,
        validate: (value: any) => {
          const idMarque = value || 0;
          return idMarque > 0 ? '' : 'Sélectionnez une marque';
        },
        title: 'Sélectionnez une marque',
      },
      hint: 'Choisissez une marque associée',
    },
    {
      name: 'idFournisseur', // Added
      label: 'Fournisseur',
      type: 'custom',
      render: ({ value, onChange }) => {
        const currentValue = value || 0;
        return (
          <div>
            <Select
              options={fournisseurs.map((fournisseur) => ({
                value: fournisseur.idFournisseur,
                label: fournisseur.nom,
              }))}
              value={
                currentValue > 0
                  ? {
                      value: currentValue,
                      label: fournisseurs.find((f) => f.idFournisseur === currentValue)?.nom || '',
                    }
                  : null
              }
              onChange={(selectedOption) => {
                const newValue = selectedOption ? selectedOption.value : 0;
                setFormData((prev) => ({
                  ...prev,
                  idFournisseur: newValue,
                }));
                onChange(newValue);
              }}
              placeholder="Sélectionnez un fournisseur"
              className="w-full"
              isClearable={false}
              styles={customSelectStyles}
              menuPortalTarget={document.body}
              menuPosition="absolute"
              menuShouldScrollIntoView={true}
            />
          </div>
        );
      },
      validation: {
        required: true,
        validate: (value: any) => {
          const idFournisseur = value || 0;
          return idFournisseur > 0 ? '' : 'Sélectionnez un fournisseur';
        },
        title: 'Sélectionnez un fournisseur',
      },
      hint: 'Choisissez un fournisseur associé',
    },
    {
      name: 'trancheAge',
      label: 'Tranche d\'âge',
      type: 'text',
      placeholder: 'Ex: 3-6 ans',
      validation: {
        required: false,
        maxLength: 50,
        title: 'Maximum 50 caractères',
      },
      hint: 'Tranche d\'âge recommandée (optionnel)',
    },
    {
      name: 'images',
      label: 'Images du produit',
      type: 'custom',
      render: () => (
        <ImageManager
          images={selectedImages}
          existingImages={existingImages}
          onImagesChange={setSelectedImages}
          maxImages={10}
        />
      ),
      validation: {
        required: false,
      },
      hint: 'Sélectionnez jusqu\'à 10 images pour le produit',
    },
  ];

  const handleAddSubmit = async (data: FormData) => {
    try {
      if (data.idCategorie === 0) {
        setNotification({
          type: 'error',
          message: 'Veuillez sélectionner une catégorie valide.',
        });
        return;
      }
      if (data.idMarque === 0) {
        setNotification({
          type: 'error',
          message: 'Veuillez sélectionner une marque valide.',
        });
        return;
      }
      if (data.idFournisseur === 0) { // Added
        setNotification({
          type: 'error',
          message: 'Veuillez sélectionner un fournisseur valide.',
        });
        return;
      }

      const produitData = {
        ...data,
        images: selectedImages,
      };

      const response = await ProduitsService.createProduit(produitData);
      const newProduit: ProduitResponse = {
        ...response,
        categorie: categories.find((cat) => cat.idCategorie === data.idCategorie),
        marque: marques.find((m) => m.idMarque === data.idMarque),
        fournisseur: fournisseurs.find((f) => f.idFournisseur === data.idFournisseur), // Added
        type: data.idType ? types.find((t) => t.idType === data.idType) : undefined,
      };

      setProduits([...produits, newProduit]);
      setIsAddModalOpen(false);
      setSelectedImages([]);
      setExistingImages([]);
      setNotification({
        type: 'success',
        message: 'Produit ajouté avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de l'ajout du produit: ${message}`,
      });
    }
  };

  const handleEditSubmit = async (data: FormData) => {
    try {
      if (!data.idProduit) {
        setNotification({
          type: 'error',
          message: 'Aucun produit sélectionné pour modification.',
        });
        return;
      }
      if (data.idCategorie === 0) {
        setNotification({
          type: 'error',
          message: 'Veuillez sélectionner une catégorie valide.',
        });
        return;
      }
      if (data.idMarque === 0) {
        setNotification({
          type: 'error',
          message: 'Veuillez sélectionner une marque valide.',
        });
        return;
      }
      if (data.idFournisseur === 0) { // Added
        setNotification({
          type: 'error',
          message: 'Veuillez sélectionner un fournisseur valide.',
        });
        return;
      }

      const produitData = {
        ...data,
        images: selectedImages,
      };

      const updatedProduit = await ProduitsService.updateProduit(data.idProduit, produitData);
      const updatedProduitWithDetails: ProduitResponse = {
        ...updatedProduit,
        categorie: categories.find((cat) => cat.idCategorie === data.idCategorie),
        marque: marques.find((m) => m.idMarque === data.idMarque),
        fournisseur: fournisseurs.find((f) => f.idFournisseur === data.idFournisseur), // Added
        type: data.idType ? types.find((t) => t.idType === data.idType) : undefined,
      };

      setProduits(
        produits.map((produit) =>
          produit.idProduit === data.idProduit ? updatedProduitWithDetails : produit
        )
      );
      setIsEditModalOpen(false);
      setSelectedImages([]);
      setExistingImages([]);
      setNotification({
        type: 'success',
        message: 'Produit modifié avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de la modification du produit: ${message}`,
      });
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      for (const id of selectedProduits) {
        await ProduitsService.deleteProduit(id);
      }
      setProduits(produits.filter((produit) => !selectedProduits.includes(produit.idProduit)));
      setSelectedProduits([]);
      setIsDeleteModalOpen(false);
      setNotification({
        type: 'success',
        message: 'Produit(s) supprimé(s) avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de la suppression du produit: ${message}`,
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.checked) {
      setSelectedProduits([...selectedProduits, id]);
    } else {
      setSelectedProduits(selectedProduits.filter((produitId) => produitId !== id));
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProduits(filteredProduits.map((produit) => produit.idProduit));
    } else {
      setSelectedProduits([]);
    }
  };

  const handleAdd = () => {
    const newFormData = {
      idProduit: null,
      nom: '',
      description: '',
      prix: 0,
      quantiteStock: 0,
      idCategorie: 0,
      idMarque: 0,
      idFournisseur: 0, // Added
      idType: null,
      trancheAge: '',
      images: [],
    };
    setFormData(newFormData);
    setTypes([]);
    setSelectedImages([]);
    setExistingImages([]);
    setIsAddModalOpen(true);
  };

  const handleEdit = async (produit: ProduitResponse) => {
    try {
      const fetchedProduit = await ProduitsService.getProduitById(produit.idProduit);
      const selectedCategory = categories.find((cat) => cat.idCategorie === fetchedProduit.idCategorie);
      setTypes(selectedCategory?.types || []);

      const newFormData = {
        idProduit: fetchedProduit.idProduit,
        nom: fetchedProduit.nom || '',
        description: fetchedProduit.description || '',
        prix: fetchedProduit.prix || 0,
        quantiteStock: fetchedProduit.quantiteStock || 0,
        idCategorie: fetchedProduit.idCategorie || 0,
        idMarque: fetchedProduit.idMarque || 0,
        idFournisseur: fetchedProduit.idFournisseur || 0, // Added
        idType: fetchedProduit.idType || null,
        trancheAge: fetchedProduit.trancheAge || '',
        images: [],
      };

      setFormData(newFormData);
      setSelectedImages([]);
      setExistingImages(fetchedProduit.images || []);
      setIsEditModalOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur lors du chargement des données du produit: ${message}`,
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

  if (categories.length === 0 || marques.length === 0 || fournisseurs.length === 0) { // Added fournisseurs check
    return (
      <div className="text-center p-6 text-error">
        {categories.length === 0 && marques.length === 0 && fournisseurs.length === 0
          ? 'Aucune catégorie, marque ou fournisseur disponibles. Veuillez créer des catégories, marques et fournisseurs avant d\'ajouter un produit.'
          : categories.length === 0
          ? 'Aucune catégorie disponible. Veuillez créer une catégorie avant d\'ajouter un produit.'
          : marques.length === 0
          ? 'Aucune marque disponible. Veuillez créer une marque avant d\'ajouter un produit.'
          : 'Aucun fournisseur disponible. Veuillez créer un fournisseur avant d\'ajouter un produit.'}
      </div>
    );
  }

  console.log('Render - formData:', formData, 'types:', types);

  return (
    <div className="p-6 w-full h-screen flex flex-col relative">
      <Notification notification={notification} onClose={() => setNotification(null)} />
      <HeaderCardComponent
        title="Liste des Produits"
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        selectedItems={selectedProduits}
        onEdit={() => {
          const produit = produits.find((p) => p.idProduit === selectedProduits[0]);
          if (produit) handleEdit(produit);
        }}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />
      <TableComponent
        data={filteredProduits}
        columns={columns}
        loading={loading}
        error={error}
        selectedItems={selectedProduits}
        handleCheckboxChange={handleCheckboxChange}
        handleSelectAll={handleSelectAll}
        onEdit={handleEdit}
        onDelete={(id: number) => {
          setSelectedProduits([id]);
          handleDelete();
        }}
        idField="idProduit"
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemCount={selectedProduits.length}
        entityName="produit(s)"
      />
      <FormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter un Nouveau Produit"
        fields={produitFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddSubmit}
        submitButtonText="Ajouter"
      />
      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier un Produit"
        fields={produitFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditSubmit}
        submitButtonText="Modifier"
      />
    </div>
  );
};

export default Produits;