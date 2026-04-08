'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import TableComponent from '@/components/layout/TableComponent';
import HeaderCardComponent from '@/components/layout/HeaderCardComponent';
import FormModal from '@/components/layout/FormModal';
import Notification from '@/components/layout/Notification';
import ConfirmDeleteModal from '@/components/layout/ConfirmDeleteModal';
import ProduitsService, { ProduitFormData, ImageData, ProduitVariation, Couleur, Taille, Age, Produit } from '@/services/produits-service';
import CategoriesService from '@/services/categories-service';
import MarquesService from '@/services/marques-service';
import FournisseursService from '@/services/fournisseurs-service';
import CouleursService from '@/services/couleurs-service';
import TaillesService from '@/services/tailles-service';
import AgesService from '@/services/ages-service';
import ImageManager from '@/components/layout/ImageManager';
import VariationsManager from '@/components/layout/VariationsManager';
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
  livraisonGratuite: boolean;
  idType: number | null;
  idAge: number | null;
  genre: 'fille' | 'garçon' | 'enfant';
  images: File[];
  imageColors?: (number | null)[];
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
  age?: Age;
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

// ✅ NOUVEAU : Type pour le filtre de statut
type StatusFilter = 'all' | 'active' | 'inactive';

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

  // ✅ NOUVEAU : filtre de statut + état de chargement du toggle
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ImageData[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [imageColors, setImageColors] = useState<(number | null)[]>([]);
  const [existingImageColors, setExistingImageColors] = useState<{[key: number]: number | null}>({});

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
    idAge: null,
    genre: 'enfant',
    livraisonGratuite: false,
    images: [],
    variants: [],
  });

  const [selectedProduits, setSelectedProduits] = useState<number[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { data: session } = useSession();
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
    if (formData.idCategorie > 0) {
      const selectedCategory = categories.find((cat) => cat.idCategorie === formData.idCategorie);
      const newTypes = selectedCategory?.types || [];
      setTypes(newTypes);
      if (formData.idType && newTypes.length > 0 && !newTypes.some((type) => type.idType === formData.idType)) {
        setFormData((prev) => ({ ...prev, idType: null }));
      }
    } else {
      setTypes([]);
      setFormData((prev) => ({ ...prev, idType: null }));
    }
  }, [formData.idCategorie, categories]);

  // ✅ NOUVEAU : Handler toggle actif/inactif directement depuis la table
  const handleToggleActive = async (produit: ProduitResponse) => {
    setTogglingId(produit.idProduit);
    try {
      const result = await ProduitsService.toggleActive(produit.idProduit, token);
      setProduits(prev =>
        prev.map(p =>
          p.idProduit === produit.idProduit ? { ...p, isActive: result.isActive } : p
        )
      );
      setNotification({
        type: 'success',
        message: result.message,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur lors du changement de statut : ${message}`,
      });
    } finally {
      setTogglingId(null);
    }
  };

  const calculateTotalStock = (variations: ProduitVariation[] | undefined): number => {
    if (!variations || variations.length === 0) return 0;
    return variations.reduce((total, variation) => total + (variation.quantiteStock || 0), 0);
  };

  const formatAgeLabel = (age: Age | undefined): string => {
    if (!age) return 'N/A';
    if (age.minTypeAge === age.maxTypeAge) {
      return `${age.minAge}-${age.maxAge} ${age.minTypeAge}`;
    }
    return `${age.minAge} ${age.minTypeAge} - ${age.maxAge} ${age.maxTypeAge}`;
  };

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

  const handleDeleteExistingImage = (imageId: number) => {
    setImagesToDelete(prev => [...prev, imageId]);
  };

  const handleExistingImageColorChange = (imageId: number, colorId: number | null) => {
    setExistingImageColors(prev => ({ ...prev, [imageId]: colorId }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // ✅ MODIFIÉ : filtrage combiné recherche + statut
  const filteredProduits = produits.filter((produit) => {
    if (!produit) return false;

    // Filtre statut
    if (statusFilter === 'active' && !produit.isActive) return false;
    if (statusFilter === 'inactive' && produit.isActive) return false;

    // Filtre recherche
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (produit.nom && produit.nom.toLowerCase().includes(term)) ||
      (produit.description && produit.description.toLowerCase().includes(term)) ||
      (produit.categorie && produit.categorie.nom.toLowerCase().includes(term)) ||
      (produit.marque && produit.marque.nom.toLowerCase().includes(term)) ||
      (produit.fournisseur && produit.fournisseur.nom.toLowerCase().includes(term)) ||
      (produit.type && produit.type.nom.toLowerCase().includes(term)) ||
      (produit.genre && produit.genre.toLowerCase().includes(term))
    );
  });

  // ✅ Compteurs pour les onglets de filtre
  const countAll = produits.length;
  const countActive = produits.filter(p => p.isActive).length;
  const countInactive = produits.filter(p => !p.isActive).length;

  const columns = [
    {
      header: 'Produit',
      render: (item: ProduitResponse) => (
        <div className="flex items-center gap-3">
          {item.images && item.images.length > 0 && (
            <div className="avatar">
              <div className="mask mask-squircle w-12 h-12">
                <img
                  src={`${item.images.find(img => img.rang === 1)?.url || item.images[0]?.url}`}
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
    {
      header: "Tranche d'âge",
      render: (item: ProduitResponse) => (
        <div>
          {item.age ? (
            <>
              <div className="font-semibold text-sm">{item.age.label}</div>
              <div className="text-xs text-gray-500">{formatAgeLabel(item.age)}</div>
            </>
          ) : (
            <span className="text-gray-400">Non spécifié</span>
          )}
        </div>
      ),
    },
    {
      header: 'Livraison Gratuite',
      render: (produit: ProduitResponse) => (
        <span className={`badge ${produit.livraisonGratuite ? 'badge-success' : 'badge-ghost'}`}>
          {produit.livraisonGratuite ? 'Oui' : 'Non'}
        </span>
      ),
    },
    // ✅ NOUVEAU : Colonne Statut avec badge + toggle switch
    {
      header: 'Statut',
      render: (item: ProduitResponse) => (
        <div className="flex flex-col items-center gap-1">
          {/* Badge visuel */}
          <span className={`badge badge-sm font-semibold ${item.isActive ? 'badge-success' : 'badge-error'}`}>
            {item.isActive ? 'Actif' : 'Inactif'}
          </span>
          {/* Toggle switch */}
          <label className="swap swap-rotate cursor-pointer">
            <input
              type="checkbox"
              checked={item.isActive}
              disabled={togglingId === item.idProduit}
              onChange={() => handleToggleActive(item)}
              className="hidden"
            />
            <div
              onClick={() => togglingId !== item.idProduit && handleToggleActive(item)}
              className={`
                relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer
                ${item.isActive ? 'bg-success' : 'bg-error'}
                ${togglingId === item.idProduit ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {togglingId === item.idProduit ? (
                // Spinner pendant le chargement
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="loading loading-spinner loading-xs text-white"></span>
                </span>
              ) : (
                <span
                  className={`
                    absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                    ${item.isActive ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              )}
            </div>
          </label>
        </div>
      ),
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
      validation: { required: true, min: 0.01, step: 0.01, title: 'Le prix doit être supérieur à 0' },
      hint: 'Prix en dinars tunisiens',
    },
    {
      name: 'quantiteStock',
      label: 'Quantité en stock',
      type: 'number',
      placeholder: '0',
      validation: { required: true, min: 0, title: 'La quantité doit être supérieure ou égale à 0' },
      hint: "Nombre d'unités en stock",
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
              options={categories.map((categorie) => ({ value: categorie.idCategorie, label: categorie.nom }))}
              value={currentValue > 0 ? { value: currentValue, label: categories.find((c) => c.idCategorie === currentValue)?.nom || '' } : null}
              onChange={(selectedOption) => {
                const newValue = selectedOption ? selectedOption.value : 0;
                setFormData((prev) => ({ ...prev, idCategorie: newValue, idType: null }));
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
        validate: (value: any) => (value > 0 ? '' : 'Sélectionnez une catégorie'),
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
        return (
          <div>
            <Select
              options={types.map((type) => ({ value: type.idType, label: type.nom }))}
              value={selectedType ? { value: selectedType.idType, label: selectedType.nom } : null}
              onChange={(selectedOption) => {
                const newValue = selectedOption ? selectedOption.value : null;
                setFormData((prev) => ({ ...prev, idType: newValue }));
                onChange(newValue);
              }}
              placeholder={formData.idCategorie === 0 || types.length === 0 ? "Sélectionnez d'abord une catégorie" : 'Sélectionnez un type'}
              className="w-full"
              isClearable
              isDisabled={formData.idCategorie === 0 || types.length === 0}
              styles={customSelectStyles}
              menuPortalTarget={document.body}
              menuPosition="absolute"
              menuShouldScrollIntoView={true}
            />
            {formData.idCategorie > 0 && types.length === 0 && (
              <div className="text-sm text-gray-500 mt-1">Aucun type disponible pour cette catégorie</div>
            )}
          </div>
        );
      },
      validation: { required: false, title: 'Sélectionnez un type (optionnel)' },
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
              options={marques.map((marque) => ({ value: marque.idMarque, label: marque.nom }))}
              value={currentValue > 0 ? { value: currentValue, label: marques.find((m) => m.idMarque === currentValue)?.nom || '' } : null}
              onChange={(selectedOption) => {
                const newValue = selectedOption ? selectedOption.value : 0;
                setFormData((prev) => ({ ...prev, idMarque: newValue }));
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
        validate: (value: any) => (value > 0 ? '' : 'Sélectionnez une marque'),
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
              options={fournisseurs.map((fournisseur) => ({ value: fournisseur.idFournisseur, label: fournisseur.nom }))}
              value={currentValue > 0 ? { value: currentValue, label: fournisseurs.find((f) => f.idFournisseur === currentValue)?.nom || '' } : null}
              onChange={(selectedOption) => {
                const newValue = selectedOption ? selectedOption.value : 0;
                setFormData((prev) => ({ ...prev, idFournisseur: newValue }));
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
        validate: (value: any) => (value > 0 ? '' : 'Sélectionnez un fournisseur'),
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
        validate: (value: any) => ((value || []).length > 0 ? '' : 'Au moins une variation est requise'),
        title: 'Ajoutez au moins une variation',
      },
      hint: 'Définissez les variations de couleur, taille et âge avec leurs stocks',
    },
    {
      name: 'idAge',
      label: "Tranche d'âge",
      type: 'custom',
      render: ({ value, onChange }) => {
        const currentIdAge = value || null;
        const selectedAge = currentIdAge ? ages.find((a) => a.idAge === currentIdAge) : null;
        return (
          <div>
            <Select
              options={ages.map((age) => ({
                value: age.idAge,
                label: `${age.label} (${age.minAge} ${age.minTypeAge} - ${age.maxAge} ${age.maxTypeAge})`,
              }))}
              value={selectedAge ? { value: selectedAge.idAge, label: `${selectedAge.label} (${selectedAge.minAge} ${selectedAge.minTypeAge} - ${selectedAge.maxAge} ${selectedAge.maxTypeAge})` } : null}
              onChange={(selectedOption) => {
                const newValue = selectedOption ? selectedOption.value : null;
                setFormData((prev) => ({ ...prev, idAge: newValue }));
                onChange(newValue);
              }}
              placeholder="Sélectionnez une tranche d'âge (optionnel)"
              className="w-full"
              isClearable
              styles={customSelectStyles}
              menuPortalTarget={document.body}
              menuPosition="absolute"
              menuShouldScrollIntoView={true}
            />
            {ages.length === 0 && <div className="text-sm text-gray-500 mt-1">Aucune tranche d'âge disponible</div>}
          </div>
        );
      },
      validation: { required: false, title: "Sélectionnez une tranche d'âge (optionnel)" },
      hint: "Choisissez une tranche d'âge pour ce produit (optionnel)",
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
          value={{ value, label: value === 'enfant' ? 'Enfant' : value === 'fille' ? 'Fille' : 'Garçon' }}
          onChange={(selectedOption) => {
            const newValue = selectedOption ? selectedOption.value : 'enfant';
            setFormData((prev) => ({ ...prev, genre: newValue as 'fille' | 'garçon' | 'enfant' }));
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
      validation: { required: true, title: 'Sélectionnez le genre' },
      hint: 'Choisissez le genre associé',
    },
    {
      name: 'livraisonGratuite',
      label: 'Livraison Gratuite',
      type: 'custom',
      render: ({ value, onChange }) => (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            className="checkbox checkbox-primary"
          />
          <span className="text-sm text-gray-600">
            {value ? 'La livraison est gratuite pour ce produit' : 'Activer la livraison gratuite'}
          </span>
        </div>
      ),
    },
    {
      name: 'images',
      label: 'Images du produit',
      type: 'custom',
      render: () => (
        <ImageManager
          images={selectedImages}
          existingImages={existingImages.filter(img => !imagesToDelete.includes(img.idImage))}
          onImagesChange={setSelectedImages}
          onDeleteExistingImage={handleDeleteExistingImage}
          onImageColorsChange={setImageColors}
          onExistingImageColorChange={handleExistingImageColorChange}
          couleurs={couleurs}
          maxImages={10}
        />
      ),
      validation: { required: false },
      hint: "Sélectionnez jusqu'à 10 images et associez-les à des couleurs",
    },
  ];

  const handleAddSubmit = async (data: FormData) => {
    try {
      if (data.idCategorie === 0) {
        setNotification({ type: 'error', message: 'Veuillez sélectionner une catégorie valide.' });
        return;
      }
      if (!data.variants || data.variants.length === 0) {
        setNotification({ type: 'error', message: 'Veuillez ajouter au moins une variation du produit.' });
        return;
      }

      const produitData: ProduitFormData = {
        ...data,
        idAge: data.idAge,
        images: selectedImages,
        imageColors: imageColors,
        variants: data.variants,
        isActive: true, // ✅ Toujours actif à la création
      };

      const response = await ProduitsService.createProduit(produitData, token);
      const newProduit: ProduitResponse = {
        ...response,
        categorie: categories.find((cat) => cat.idCategorie === data.idCategorie),
        marque: marques.find((m) => m.idMarque === data.idMarque),
        fournisseur: fournisseurs.find((f) => f.idFournisseur === data.idFournisseur),
        type: data.idType ? types.find((t) => t.idType === data.idType) : undefined,
        age: data.idAge ? ages.find((a) => a.idAge === data.idAge) : undefined,
      };

      setProduits([...produits, newProduit]);
      setIsAddModalOpen(false);
      setSelectedImages([]);
      setExistingImages([]);
      setNotification({ type: 'success', message: 'Produit ajouté avec succès !' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({ type: 'error', message: `Erreur ! Échec de l'ajout du produit: ${message}` });
    }
  };

  const handleEditSubmit = async (data: FormData) => {
    try {
      if (!data.idProduit) {
        setNotification({ type: 'error', message: 'Aucun produit sélectionné pour modification.' });
        return;
      }
      if (data.idCategorie === 0) {
        setNotification({ type: 'error', message: 'Veuillez sélectionner une catégorie valide.' });
        return;
      }
      if (data.idMarque === 0) {
        setNotification({ type: 'error', message: 'Veuillez sélectionner une marque valide.' });
        return;
      }
      if (data.idFournisseur === 0) {
        setNotification({ type: 'error', message: 'Veuillez sélectionner un fournisseur valide.' });
        return;
      }

      if (imagesToDelete.length > 0) {
        for (const imageId of imagesToDelete) {
          await ProduitsService.deleteImage(imageId, token);
        }
      }

      const produitData = {
        ...data,
        images: selectedImages,
        imageColors: imageColors,
        existingImageColors: existingImageColors,
      };

      const updatedProduit = await ProduitsService.updateProduit(data.idProduit, produitData, token);

      const updatedProduitWithDetails: ProduitResponse = {
        ...updatedProduit,
        categorie: categories.find((cat) => cat.idCategorie === data.idCategorie),
        marque: marques.find((m) => m.idMarque === data.idMarque),
        fournisseur: fournisseurs.find((f) => f.idFournisseur === data.idFournisseur),
        type: data.idType ? types.find((t) => t.idType === data.idType) : undefined,
        age: data.idAge ? ages.find((a) => a.idAge === data.idAge) : undefined,
      };

      setProduits(
        produits.map((produit) =>
          produit.idProduit === data.idProduit ? updatedProduitWithDetails : produit
        )
      );

      setIsEditModalOpen(false);
      setSelectedImages([]);
      setExistingImages([]);
      setImagesToDelete([]);
      setNotification({ type: 'success', message: 'Produit modifié avec succès !' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({ type: 'error', message: `Erreur ! Échec de la modification du produit: ${message}` });
    }
  };

  const handleDelete = () => setIsDeleteModalOpen(true);

  const confirmDelete = async () => {
    try {
      for (const id of selectedProduits) {
        await ProduitsService.deleteProduit(id, token);
      }
      setProduits(produits.filter((produit) => !selectedProduits.includes(produit.idProduit)));
      setSelectedProduits([]);
      setIsDeleteModalOpen(false);
      setNotification({ type: 'success', message: 'Produit(s) supprimé(s) avec succès !' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({ type: 'error', message: `Erreur ! Échec de la suppression du produit: ${message}` });
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
    setFormData({
      idProduit: null,
      nom: '',
      description: '',
      prix: 0,
      quantiteStock: 0,
      idCategorie: 0,
      idMarque: 0,
      idFournisseur: 0,
      idType: null,
      idAge: null,
      genre: 'enfant',
      livraisonGratuite: false,
      images: [],
      variants: [],
    });
    setTypes([]);
    setSelectedImages([]);
    setExistingImages([]);
    setExistingImageColors({});
    setImageColors([]);
    setIsAddModalOpen(true);
  };

  const handleEdit = async (produit: ProduitResponse) => {
    try {
      const fetchedProduit = await ProduitsService.getProduitById(produit.idProduit, token);
      const selectedCategory = categories.find((cat) => cat.idCategorie === fetchedProduit.idCategorie);
      setTypes(selectedCategory?.types || []);

      setFormData({
        idProduit: fetchedProduit.idProduit,
        nom: fetchedProduit.nom || '',
        description: fetchedProduit.description || '',
        prix: fetchedProduit.prix || 0,
        quantiteStock: fetchedProduit.quantiteStock || 0,
        idCategorie: fetchedProduit.idCategorie || 0,
        idMarque: fetchedProduit.idMarque || 0,
        idFournisseur: fetchedProduit.idFournisseur || 0,
        idType: fetchedProduit.idType || null,
        idAge: fetchedProduit.idAge || null,
        genre: fetchedProduit.genre || 'enfant',
        livraisonGratuite: fetchedProduit.livraisonGratuite || false,
        images: [],
        variants: fetchedProduit.variations || [],
      });

      setSelectedImages([]);
      setExistingImages(fetchedProduit.images || []);
      setImageColors([]);
      setExistingImageColors({});
      setIsEditModalOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({ type: 'error', message: `Erreur lors du chargement des données du produit: ${message}` });
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
          ? "Aucune catégorie, marque ou fournisseur disponibles. Veuillez créer des catégories, marques et fournisseurs avant d'ajouter un produit."
          : categories.length === 0
          ? "Aucune catégorie disponible. Veuillez créer une catégorie avant d'ajouter un produit."
          : marques.length === 0
          ? "Aucune marque disponible. Veuillez créer une marque avant d'ajouter un produit."
          : "Aucun fournisseur disponible. Veuillez créer un fournisseur avant d'ajouter un produit."}
      </div>
    );
  }

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

      {/* ✅ NOUVEAU : Barre de filtres Actifs / Inactifs / Tous */}
      <div className="flex items-center gap-2 my-3">
        <span className="text-sm font-medium text-gray-500 mr-1">Statut :</span>
        <button
          onClick={() => setStatusFilter('all')}
          className={`btn btn-sm rounded-full ${statusFilter === 'all' ? 'btn-neutral' : 'btn-ghost border border-gray-300'}`}
        >
          Tous
          <span className="badge badge-sm ml-1">{countAll}</span>
        </button>
        <button
          onClick={() => setStatusFilter('active')}
          className={`btn btn-sm rounded-full ${statusFilter === 'active' ? 'btn-success text-white' : 'btn-ghost border border-gray-300'}`}
        >
          ● Actifs
          <span className={`badge badge-sm ml-1 ${statusFilter === 'active' ? 'badge-success' : ''}`}>{countActive}</span>
        </button>
        <button
          onClick={() => setStatusFilter('inactive')}
          className={`btn btn-sm rounded-full ${statusFilter === 'inactive' ? 'btn-error text-white' : 'btn-ghost border border-gray-300'}`}
        >
          ● Inactifs
          <span className={`badge badge-sm ml-1 ${statusFilter === 'inactive' ? 'badge-error' : ''}`}>{countInactive}</span>
        </button>
      </div>

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