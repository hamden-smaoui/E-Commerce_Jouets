'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import TableComponent from '@/components/layout/TableComponent';
import HeaderCardComponent from '@/components/layout/HeaderCardComponent';
import FormModal from '@/components/layout/FormModal';
import Notification from '@/components/layout/Notification';
import ConfirmDeleteModal from '@/components/layout/ConfirmDeleteModal';
import ProduitsService, { ProduitFormData, ImageData, ProduitVariation, Couleur, Taille, Age ,Produit } from '@/services/produits-service';
import CategoriesService from '@/services/categories-service';
import MarquesService from '@/services/marques-service';
import FournisseursService from '@/services/fournisseurs-service';
import CouleursService from '@/services/couleurs-service';
import TaillesService from '@/services/tailles-service';
import AgesService from '@/services/ages-service';
import ImageManager from '@/components/layout/ImageManager';
import VariationsManager from '@/components/layout/VariationsManager'; // Nouveau composant
import { useSession } from 'next-auth/react';
interface Type {
  idType: number;
  nom: string;
}

interface Categorie {
  idCategorie: number;
  nom: string;
  types?: Type[];
}

interface Marque {
  idMarque: number;
  nom: string;
}

interface Fournisseur {
  idFournisseur: number;
  nom: string;
}

interface FormData {
  idProduit: number | null;
  nom: string;
  description: string;
  prix: number;
  quantiteStock: number;
  idCategorie: number;
  idMarque: number;
  idFournisseur: number;
  idType: number | null;
  genre: 'fille' | 'garçon' | 'enfant';
  images: File[];
  variants: {
    idCouleur: number;
    idTaille?: number;
    idAge?: number;
    quantiteStock: number;
  }[];
}

interface ProduitResponse extends Produit {
  categorie?: Categorie;
  marque?: Marque;
  fournisseur?: Fournisseur;
  type?: Type;
  images?: ImageData[];
  variations?: ProduitVariation[];
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
const Produits: React.FC = () => {
  const [produits, setProduits] = useState<ProduitResponse[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [marques, setMarques] = useState<Marque[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [couleurs, setCouleurs] = useState<Couleur[]>([]);
  const [tailles, setTailles] = useState<Taille[]>([]);
  const [ages, setAges] = useState<Age[]>([]);
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
    idFournisseur: 0,
    idType: null,
    genre: 'enfant',
    images: [],
    variants: [],
  });
  const [selectedProduits, setSelectedProduits] = useState<number[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { data: session, status } = useSession();
  const token = session?.customToken;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          fetchedProduits,
          fetchedCategories,
          fetchedMarques,
          fetchedFournisseurs,
          fetchedCouleurs,
          fetchedTailles,
          fetchedAges,
        ] = await Promise.all([
          ProduitsService.getAllProduits(token),
          CategoriesService.getAllCategories(token),
          MarquesService.getAllMarques(token),
          FournisseursService.getAllFournisseurs(token),
          CouleursService.getAllCouleurs(token),
          TaillesService.getAllTailles(token),
          AgesService.getAllAges(token),
        ]);
        
        setProduits(fetchedProduits);
        setCategories(fetchedCategories);
        setMarques(fetchedMarques);
        setFournisseurs(fetchedFournisseurs);
        setCouleurs(fetchedCouleurs);
        setTailles(fetchedTailles);
        setAges(fetchedAges);
        setLoading(false);
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
  // Calcul du stock total basé sur les variations
  const calculateTotalStock = (variations: ProduitVariation[] | undefined): number => {
    if (!variations || variations.length === 0) return 0;
    return variations.reduce((total, variation) => total + (variation.quantiteStock || 0), 0);
  };

  // Formatage des variations pour l'affichage
  const formatVariations = (variations: ProduitVariation[] | undefined): string => {
    if (!variations || variations.length === 0) return 'Aucune variation';
    
    const variationTexts = variations.map(variation => {
      const parts = [];
      if (variation.couleur) parts.push(variation.couleur.nom);
      if (variation.taille) parts.push(variation.taille.nom);
      if (variation.age) parts.push(variation.age.label);
      return `${parts.join(' / ')} (${variation.quantiteStock})`;
    });
    
    return variationTexts.join(', ');
  };

  

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
        (produit.fournisseur && produit.fournisseur.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (produit.type && produit.type.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (produit.genre && produit.genre.toLowerCase().includes(searchTerm.toLowerCase())))
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
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}${item.images.find(img => img.rang === 1)?.url || item.images[0]?.url}`}
                  alt={item.nom}
                />
              </div>
            </div>
          )}
          <div>
            <div className="font-bold">{item.nom || 'N/A'}</div>
            <div className="text-sm opacity-50">{item.description?.substring(0, 50) || 'N/A'}...</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Prix',
      render: (item: ProduitResponse) => `${item.prix?.toFixed(2) || '0.00'} TND`,
    },
    {
      header: 'Stock Total',
      render: (item: ProduitResponse) => calculateTotalStock(item.variations),
    },
    {
      header: 'Variations',
      render: (item: ProduitResponse) => (
        <div className="max-w-xs">
          <div className="text-sm" title={formatVariations(item.variations)}>
            {formatVariations(item.variations)}
          </div>
        </div>
      ),
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
      header: 'Genre',
      render: (item: ProduitResponse) => item.genre || 'N/A',
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
      name: 'idFournisseur',
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
      name: 'variants',
      label: 'Variations du produit',
      type: 'custom',
      render: ({ value, onChange }) => (
        <VariationsManager
          variants={value || []}
          onVariantsChange={onChange}
          couleurs={couleurs}
          tailles={tailles}
          ages={ages}
        />
      ),
      validation: {
        required: true,
        validate: (value: any) => {
          const variants = value || [];
          return variants.length > 0 ? '' : 'Au moins une variation est requise';
        },
        title: 'Ajoutez au moins une variation',
      },
      hint: 'Définissez les variations de couleur, taille et âge avec leurs stocks',
    },
    {
      name: 'genre',
      label: 'Genre',
      type: 'custom',
      render: ({ value, onChange }) => (
        <Select
          options={[
            { value: 'enfant', label: 'Enfant' },
            { value: 'fille', label: 'Fille' },
            { value: 'garçon', label: 'Garçon' },
          ]}
          value={{
            value: value,
            label: value === 'enfant' ? 'Enfant' : value === 'fille' ? 'Fille' : 'Garçon',
          }}
          onChange={(selectedOption) => {
            const newValue = selectedOption ? selectedOption.value : 'enfant';
            setFormData((prev) => ({
              ...prev,
              genre: newValue as 'fille' | 'garçon' | 'enfant',
            }));
            onChange(newValue);
          }}
          className="w-full"
          isClearable={false}
          styles={customSelectStyles}
          menuPortalTarget={document.body}
          menuPosition="absolute"
          menuShouldScrollIntoView={true}
        />
      ),
      validation: {
        required: true,
        title: 'Sélectionnez le genre',
      },
      hint: 'Choisissez le genre associé',
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

      if (!data.variants || data.variants.length === 0) {
        setNotification({
          type: 'error',
          message: 'Veuillez ajouter au moins une variation du produit.',
        });
        return;
      }

      const produitData: ProduitFormData = {
        ...data,
        images: selectedImages,
        variants: data.variants,
      };

      const response = await ProduitsService.createProduit(produitData,token);
      const newProduit: ProduitResponse = {
        ...response,
        categorie: categories.find((cat) => cat.idCategorie === data.idCategorie),
        marque: marques.find((m) => m.idMarque === data.idMarque),
        fournisseur: fournisseurs.find((f) => f.idFournisseur === data.idFournisseur),
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
      if (data.idFournisseur === 0) {
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

      const updatedProduit = await ProduitsService.updateProduit(data.idProduit, produitData,token);
      const updatedProduitWithDetails: ProduitResponse = {
        ...updatedProduit,
        categorie: categories.find((cat) => cat.idCategorie === data.idCategorie),
        marque: marques.find((m) => m.idMarque === data.idMarque),
        fournisseur: fournisseurs.find((f) => f.idFournisseur === data.idFournisseur),
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
        await ProduitsService.deleteProduit(id,token);
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
const formatAgeRanges = (variations: ProduitVariation[] | undefined): string => {
  if (!variations || variations.length === 0) return 'N/A';
  // On récupère tous les labels de tranche d'âge uniques
  const uniqueLabels = Array.from(
    new Set(
      variations
        .filter((v) => v.age && v.age.label)
        .map((v) => v.age!.label)
    )
  );
  return uniqueLabels.length > 0 ? uniqueLabels.join(', ') : 'N/A';
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
    const newFormData: FormData = {
      idProduit: null,
      nom: '',
      description: '',
      prix: 0,
      quantiteStock: 0,
      idCategorie: 0,
      idMarque: 0,
      idFournisseur: 0,
      idType: null,
      genre: 'enfant',
      images: [],
      variants: [],
    };
    setFormData(newFormData);
    setTypes([]);
    setSelectedImages([]);
    setExistingImages([]);
    setIsAddModalOpen(true);
  };

  const handleEdit = async (produit: ProduitResponse) => {
    try {
      const fetchedProduit = await ProduitsService.getProduitById(produit.idProduit,token);
      const selectedCategory = categories.find((cat) => cat.idCategorie === fetchedProduit.idCategorie);
      setTypes(selectedCategory?.types || []);

      const newFormData: FormData = {
        idProduit: fetchedProduit.idProduit,
        nom: fetchedProduit.nom || '',
        description: fetchedProduit.description || '',
        prix: fetchedProduit.prix || 0,
        quantiteStock: fetchedProduit.quantiteStock || 0,
        idCategorie: fetchedProduit.idCategorie || 0,
        idMarque: fetchedProduit.idMarque || 0,
        idFournisseur: fetchedProduit.idFournisseur || 0,
        idType: fetchedProduit.idType || null,
        genre: fetchedProduit.genre || 'enfant',
        images: [],
variants: fetchedProduit.variations || [],
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

  if (categories.length === 0 || marques.length === 0 || fournisseurs.length === 0) {
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