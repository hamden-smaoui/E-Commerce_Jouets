// pages/Promotions.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import TableComponent from '@/components/layout/TableComponent';
import HeaderCardComponent from '@/components/layout/HeaderCardComponent';
import FormModal from '@/components/layout/FormModal';
import Notification from '@/components/layout/Notification';
import ConfirmDeleteModal from '@/components/layout/ConfirmDeleteModal';
import PromotionsService, { Promotion, PromotionFormData } from '@/services/promotions-service';
import ProduitsService from '@/services/produits-service';
import CategoriesService from '@/services/categories-service';
import MarquesService from '@/services/marques-service';
import {  Copy , ToggleLeft} from 'lucide-react';

// Interfaces
interface Produit {
  idProduit: number;
  nom: string;
}

interface Categorie {
  idCategorie: number;
  nom: string;
  types?: Type[];
}

interface Type {
  idType: number;
  nom: string;
}

interface Marque {
  idMarque: number;
  nom: string;
}

interface FormData {
  idPromotion: number | null;
  nom: string;
  description: string;
  typePromotion: 'pourcentage' | 'montant_fixe' | 'livraison_gratuite';
  valeurPromotion: number;
  typeApplication: 'produit' | 'categorie' | 'type' | 'marque' | 'panier' | 'global';
  conditionMinimum: number | null;
  quantiteMinimum: number | null;
  dateDebut: string;
  dateFin: string;
  utilisationMax: number | null;
  utilisationParClient: number | null;
  produits: number[];
  categories: number[];
  marques: number[];
  types: number[];
 
}

interface PromotionResponse extends Promotion {
  produits?: Produit[];
  categories?: Categorie[];
  marques?: Marque[];
  types?: Type[];
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
    step?: number;
  };
  render?: (props: { value: any; onChange: (value: any) => void }) => React.ReactElement;
  hidden?: boolean;
  disabled?: boolean;
}

const Promotions: React.FC = () => {
  const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [marques, setMarques] = useState<Marque[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPromotions, setSelectedPromotions] = useState<number[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    idPromotion: null,
    nom: '',
    description: '',
    typePromotion: 'pourcentage',
    valeurPromotion: 0,
    typeApplication: 'global',
    conditionMinimum: null,
    quantiteMinimum: null,
    dateDebut: '',
    dateFin: '',
    utilisationMax: null,
    utilisationParClient: null,
    produits: [],
    categories: [],
    marques: [],
    types: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          fetchedPromotions,
          fetchedProduits,
          fetchedCategories,
          fetchedMarques
        ] = await Promise.all([
          PromotionsService.getAllPromotions(),
          ProduitsService.getAllProduits(),
          CategoriesService.getAllCategories(),
          MarquesService.getAllMarques(),
        ]);

        setPromotions(fetchedPromotions);
        setProduits(fetchedProduits);
        setCategories(fetchedCategories);
        setMarques(fetchedMarques);

        // Extraire tous les types de toutes les catégories
        const allTypes = fetchedCategories.flatMap(cat => cat.types || []);
        const uniqueTypes = allTypes.filter((type, index, arr) => 
          arr.findIndex(t => t.idType === type.idType) === index
        );
        setTypes(uniqueTypes);

        setLoading(false);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatPromotion = (typePromotion: string, valeur: number) => {
    switch (typePromotion) {
      case 'pourcentage':
        return `${valeur}%`;
     case 'montant_fixe':
       return `${valeur} TND`;
     case 'livraison_gratuite':
       return 'Livraison gratuite';
     default:
       return `${valeur}`;
   }
 };

 const getStatusBadge = (actif: boolean) => {
   return (
     <span className={`badge ${actif ? 'badge-success' : 'badge-error'}`}>
       {actif ? 'Active' : 'Inactive'}
     </span>
   );
 };

 const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
   setSearchTerm(e.target.value);
 };

 const filteredPromotions = promotions.filter(
   (promotion) =>
     promotion &&
     ((promotion.nom && promotion.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (promotion.description && promotion.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (promotion.typePromotion && promotion.typePromotion.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (promotion.typeApplication && promotion.typeApplication.toLowerCase().includes(searchTerm.toLowerCase())))
 );

 const columns = [
   {
     header: 'Promotion',
     render: (item: PromotionResponse) => (
       <div>
         <div className="font-bold">{item.nom}</div>
         <div className="text-sm opacity-50">{item.description || 'Aucune description'}</div>
       </div>
     ),
   },
   {
     header: 'Type',
     render: (item: PromotionResponse) => (
       <div>
         <div className="badge badge-outline">{item.typePromotion}</div>
         <div className="text-sm mt-1">{item.typeApplication}</div>
       </div>
     ),
   },
   {
     header: 'Valeur',
     render: (item: PromotionResponse) => formatPromotion(item.typePromotion, item.valeurPromotion),
   },
   {
     header: 'Période',
     render: (item: PromotionResponse) => (
       <div className="text-sm">
         <div>Du: {formatDate(item.dateDebut)}</div>
         <div>Au: {formatDate(item.dateFin)}</div>
       </div>
     ),
   },
   {
     header: 'Utilisation',
     render: (item: PromotionResponse) => (
       <div className="text-sm">
         <div>{item.utilisationActuelle || 0} / {item.utilisationMax || '∞'}</div>
         {item.utilisationParClient && (
           <div className="text-xs opacity-70">Max par client: {item.utilisationParClient}</div>
         )}
       </div>
     ),
   },
 
   {
     header: 'Statut',
     render: (item: PromotionResponse) => getStatusBadge(item.actif),
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
   menuPortal: (provided: any) => ({
     ...provided,
     zIndex: 10000,
   }),
 };

 const promotionFields: Field<FormData>[] = [
   {
     name: 'nom',
     label: 'Nom de la promotion',
     type: 'text',
     placeholder: 'Nom de la promotion',
     validation: {
       required: true,
       minLength: 2,
       maxLength: 100,
     },
     hint: '2-100 caractères',
   },
   {
     name: 'description',
     label: 'Description',
     type: 'textarea',
     placeholder: 'Description de la promotion',
     validation: {
       required: false,
       maxLength: 500,
     },
     hint: 'Maximum 500 caractères',
   },
   {
     name: 'typePromotion',
     label: 'Type de promotion',
     type: 'custom',
     render: ({ value, onChange }) => (
       <Select
         options={[
           { value: 'pourcentage', label: 'Pourcentage' },
           { value: 'montant_fixe', label: 'Montant fixe' },
           { value: 'livraison_gratuite', label: 'Livraison gratuite' },
         ]}
         value={{ value, label: value === 'pourcentage' ? 'Pourcentage' : value === 'montant_fixe' ? 'Montant fixe' : 'Livraison gratuite' }}
         onChange={(selectedOption) => {
           const newValue = selectedOption ? selectedOption.value : 'pourcentage';
           setFormData((prev) => ({ ...prev, typePromotion: newValue as any }));
           onChange(newValue);
         }}
         placeholder="Type de promotion"
         className="w-full"
         styles={customSelectStyles}
         menuPortalTarget={document.body}
       />
     ),
     validation: { required: true },
   },
   {
     name: 'valeurPromotion',
     label: 'Valeur',
     type: 'number',
     placeholder: '0',
     validation: {
       required: true,
       min: 0.01,
       step: 0.01,
     },
     hint: formData.typePromotion === 'pourcentage' ? 'Pourcentage de réduction' : 
           formData.typePromotion === 'montant_fixe' ? 'Montant en TND' : 
           'Valeur (généralement 0 pour livraison gratuite)',
   },
   {
     name: 'typeApplication',
     label: 'Application',
     type: 'custom',
     render: ({ value, onChange }) => (
       <Select
         options={[
           { value: 'global', label: 'Globale' },
           { value: 'panier', label: 'Panier' },
           { value: 'produit', label: 'Produits spécifiques' },
           { value: 'categorie', label: 'Catégories' },
           { value: 'marque', label: 'Marques' },
           { value: 'type', label: 'Types' },
         ]}
         value={{ value, label: value === 'global' ? 'Globale' : 
                                 value === 'panier' ? 'Panier' :
                                 value === 'produit' ? 'Produits spécifiques' :
                                 value === 'categorie' ? 'Catégories' :
                                 value === 'marque' ? 'Marques' : 'Types' }}
         onChange={(selectedOption) => {
           const newValue = selectedOption ? selectedOption.value : 'global';
           setFormData((prev) => ({ 
             ...prev, 
             typeApplication: newValue as any,
             // Réinitialiser les sélections lors du changement de type
             produits: [],
             categories: [],
             marques: [],
             types: []
           }));
           onChange(newValue);
         }}
         placeholder="Type d'application"
         className="w-full"
         styles={customSelectStyles}
         menuPortalTarget={document.body}
       />
     ),
     validation: { required: true },
   },
   {
     name: 'dateDebut',
     label: 'Date de début',
     type: 'datetime-local',
     validation: { required: true },
     hint: 'Date et heure de début de la promotion',
   },
   {
     name: 'dateFin',
     label: 'Date de fin',
     type: 'datetime-local',
     validation: { 
       required: true,
       validate: (value: string, allData: FormData) => {
         if (allData.dateDebut && value && new Date(value) <= new Date(allData.dateDebut)) {
           return 'La date de fin doit être postérieure à la date de début';
         }
         return '';
       }
     },
     hint: 'Date et heure de fin de la promotion',
   },
   {
     name: 'conditionMinimum',
     label: 'Montant minimum (TND)',
     type: 'number',
     placeholder: '0.00',
     validation: {
       required: false,
       min: 0,
       step: 0.01,
     },
     hint: 'Montant minimum du panier (optionnel)',
     hidden: formData.typeApplication !== 'panier' && formData.typeApplication !== 'global',
   },
   {
     name: 'quantiteMinimum',
     label: 'Quantité minimum',
     type: 'number',
     placeholder: '0',
     validation: {
       required: false,
       min: 1,
     },
     hint: 'Quantité minimum d\'articles (optionnel)',
     hidden: formData.typeApplication !== 'panier',
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
     hint: 'Nombre maximum d\'utilisations totales (optionnel)',
   },
   {
     name: 'utilisationParClient',
     label: 'Utilisation par client',
     type: 'number',
     placeholder: 'Illimitée',
     validation: {
       required: false,
       min: 1,
     },
     hint: 'Nombre maximum d\'utilisations par client (optionnel)',
   },
   // Champs conditionnels selon le type d'application
   {
     name: 'produits',
     label: 'Produits',
     type: 'custom',
     render: ({ value, onChange }) => (
       <Select
         isMulti
         options={produits.map(produit => ({ value: produit.idProduit, label: produit.nom }))}
         value={produits.filter(p => value.includes(p.idProduit)).map(p => ({ value: p.idProduit, label: p.nom }))}
         onChange={(selectedOptions) => {
           const values = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
           setFormData((prev) => ({ ...prev, produits: values }));
           onChange(values);
         }}
         placeholder="Sélectionnez les produits"
         className="w-full"
         styles={customSelectStyles}
         menuPortalTarget={document.body}
       />
     ),
     validation: {
       validate: (value: number[]) => {
         if (formData.typeApplication === 'produit' && (!value || value.length === 0)) {
           return 'Sélectionnez au moins un produit';
         }
         return '';
       }
     },
     hidden: formData.typeApplication !== 'produit',
     hint: 'Sélectionnez les produits concernés par la promotion',
   },
   {
     name: 'categories',
     label: 'Catégories',
     type: 'custom',
     render: ({ value, onChange }) => (
       <Select
         isMulti
         options={categories.map(categorie => ({ value: categorie.idCategorie, label: categorie.nom }))}
         value={categories.filter(c => value.includes(c.idCategorie)).map(c => ({ value: c.idCategorie, label: c.nom }))}
         onChange={(selectedOptions) => {
           const values = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
           setFormData((prev) => ({ ...prev, categories: values }));
           onChange(values);
         }}
         placeholder="Sélectionnez les catégories"
         className="w-full"
         styles={customSelectStyles}
         menuPortalTarget={document.body}
       />
     ),
     validation: {
       validate: (value: number[]) => {
         if (formData.typeApplication === 'categorie' && (!value || value.length === 0)) {
           return 'Sélectionnez au moins une catégorie';
         }
         return '';
       }
     },
     hidden: formData.typeApplication !== 'categorie',
     hint: 'Sélectionnez les catégories concernées par la promotion',
   },
   {
     name: 'marques',
     label: 'Marques',
     type: 'custom',
     render: ({ value, onChange }) => (
       <Select
         isMulti
         options={marques.map(marque => ({ value: marque.idMarque, label: marque.nom }))}
         value={marques.filter(m => value.includes(m.idMarque)).map(m => ({ value: m.idMarque, label: m.nom }))}
         onChange={(selectedOptions) => {
           const values = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
           setFormData((prev) => ({ ...prev, marques: values }));
           onChange(values);
         }}
         placeholder="Sélectionnez les marques"
         className="w-full"
         styles={customSelectStyles}
         menuPortalTarget={document.body}
       />
     ),
     validation: {
       validate: (value: number[]) => {
         if (formData.typeApplication === 'marque' && (!value || value.length === 0)) {
           return 'Sélectionnez au moins une marque';
         }
         return '';
       }
     },
     hidden: formData.typeApplication !== 'marque',
     hint: 'Sélectionnez les marques concernées par la promotion',
   },
   {
     name: 'types',
     label: 'Types',
     type: 'custom',
     render: ({ value, onChange }) => (
       <Select
         isMulti
         options={types.map(type => ({ value: type.idType, label: type.nom }))}
         value={types.filter(t => value.includes(t.idType)).map(t => ({ value: t.idType, label: t.nom }))}
         onChange={(selectedOptions) => {
           const values = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
           setFormData((prev) => ({ ...prev, types: values }));
           onChange(values);
         }}
         placeholder="Sélectionnez les types"
         className="w-full"
         styles={customSelectStyles}
         menuPortalTarget={document.body}
       />
     ),
     validation: {
       validate: (value: number[]) => {
         if (formData.typeApplication === 'type' && (!value || value.length === 0)) {
           return 'Sélectionnez au moins un type';
         }
         return '';
       }
     },
     hidden: formData.typeApplication !== 'type',
     hint: 'Sélectionnez les types concernés par la promotion',
   },
  ];

 const handleAddSubmit = async (data: FormData) => {
   try {
     const promotionData: PromotionFormData = {
       nom: data.nom,
       description: data.description,
       typePromotion: data.typePromotion,
       valeurPromotion: data.valeurPromotion,
       typeApplication: data.typeApplication,
       conditionMinimum: data.conditionMinimum,
       quantiteMinimum: data.quantiteMinimum,
       dateDebut: data.dateDebut,
       dateFin: data.dateFin,
       utilisationMax: data.utilisationMax,
       utilisationParClient: data.utilisationParClient,
       produits: data.produits,
       categories: data.categories,
       marques: data.marques,
       types: data.types,
     };

     const newPromotion = await PromotionsService.createPromotion(promotionData);
     setPromotions([...promotions, newPromotion]);
     setIsAddModalOpen(false);
     resetForm();
     setNotification({
       type: 'success',
       message: 'Promotion créée avec succès !',
     });
   } catch (error: unknown) {
     const message = error instanceof Error ? error.message : 'Erreur inconnue';
     setNotification({
       type: 'error',
       message: `Erreur ! Échec de la création de la promotion: ${message}`,
     });
   }
 };

 const handleEditSubmit = async (data: FormData) => {
   try {
     if (!data.idPromotion) {
       setNotification({
         type: 'error',
         message: 'Aucune promotion sélectionnée pour modification.',
       });
       return;
     }

     const promotionData: PromotionFormData = {
       nom: data.nom,
       description: data.description,
       typePromotion: data.typePromotion,
       valeurPromotion: data.valeurPromotion,
       typeApplication: data.typeApplication,
       conditionMinimum: data.conditionMinimum,
       quantiteMinimum: data.quantiteMinimum,
       dateDebut: data.dateDebut,
       dateFin: data.dateFin,
       utilisationMax: data.utilisationMax,
       utilisationParClient: data.utilisationParClient,
       produits: data.produits,
       categories: data.categories,
       marques: data.marques,
       types: data.types,
     };

     const updatedPromotion = await PromotionsService.updatePromotion(data.idPromotion, promotionData);
     setPromotions(promotions.map(p => p.idPromotion === data.idPromotion ? updatedPromotion : p));
     setIsEditModalOpen(false);
     resetForm();
     setNotification({
       type: 'success',
       message: 'Promotion modifiée avec succès !',
     });
   } catch (error: unknown) {
     const message = error instanceof Error ? error.message : 'Erreur inconnue';
     setNotification({
       type: 'error',
       message: `Erreur ! Échec de la modification de la promotion: ${message}`,
     });
   }
 };

 const handleDelete = () => {
   setIsDeleteModalOpen(true);
 };

 const confirmDelete = async () => {
   try {
     for (const id of selectedPromotions) {
       await PromotionsService.deletePromotion(id);
     }
     setPromotions(promotions.filter(p => !selectedPromotions.includes(p.idPromotion)));
     setSelectedPromotions([]);
     setIsDeleteModalOpen(false);
     setNotification({
       type: 'success',
       message: 'Promotion(s) supprimée(s) avec succès !',
     });
   } catch (error: unknown) {
     const message = error instanceof Error ? error.message : 'Erreur inconnue';
     setNotification({
       type: 'error',
       message: `Erreur ! Échec de la suppression de la promotion: ${message}`,
     });
   }
 };

 const handleToggleStatus = async (promotion: PromotionResponse) => {
   try {
     const updatedPromotion = await PromotionsService.togglePromotion(promotion.idPromotion);
     setPromotions(promotions.map(p => 
       p.idPromotion === promotion.idPromotion ? updatedPromotion : p
     ));
     setNotification({
       type: 'success',
       message: `Promotion ${updatedPromotion.actif ? 'activée' : 'désactivée'} avec succès !`,
     });
   } catch (error: unknown) {
     const message = error instanceof Error ? error.message : 'Erreur inconnue';
     setNotification({
       type: 'error',
       message: `Erreur ! ${message}`,
     });
   }
 };

 const handleDuplicate = async (promotion: PromotionResponse) => {
   try {
     const duplicatedPromotion = await PromotionsService.dupliquerPromotion(promotion.idPromotion);
     setPromotions([...promotions, duplicatedPromotion]);
     setNotification({
       type: 'success',
       message: 'Promotion dupliquée avec succès !',
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
     idPromotion: null,
     nom: '',
     description: '',
     typePromotion: 'pourcentage',
     valeurPromotion: 0,
     typeApplication: 'global',
     conditionMinimum: null,
     quantiteMinimum: null,
     dateDebut: '',
     dateFin: '',
     utilisationMax: null,
     utilisationParClient: null,
     produits: [],
     categories: [],
     marques: [],
     types: [],
   });
 };

 const handleAdd = () => {
   resetForm();
   setIsAddModalOpen(true);
 };

 const handleEdit = async (promotion: PromotionResponse) => {
   try {
     const fetchedPromotion = await PromotionsService.getPromotionById(promotion.idPromotion);
     
     setFormData({
       idPromotion: fetchedPromotion.idPromotion,
       nom: fetchedPromotion.nom,
       description: fetchedPromotion.description || '',
       typePromotion: fetchedPromotion.typePromotion,
       valeurPromotion: fetchedPromotion.valeurPromotion,
       typeApplication: fetchedPromotion.typeApplication,
       conditionMinimum: fetchedPromotion.conditionMinimum,
       quantiteMinimum: fetchedPromotion.quantiteMinimum,
       dateDebut: new Date(fetchedPromotion.dateDebut).toISOString().slice(0, -1),
       dateFin: new Date(fetchedPromotion.dateFin).toISOString().slice(0, -1),
       utilisationMax: fetchedPromotion.utilisationMax,
       utilisationParClient: fetchedPromotion.utilisationParClient,
       produits: fetchedPromotion.produits?.map(p => p.idProduit) || [],
       categories: fetchedPromotion.categories?.map(c => c.idCategorie) || [],
       marques: fetchedPromotion.marques?.map(m => m.idMarque) || [],
       types: fetchedPromotion.types?.map(t => t.idType) || []
     });
     
     setIsEditModalOpen(true);
   } catch (error: unknown) {
     const message = error instanceof Error ? error.message : 'Erreur inconnue';
     setNotification({
       type: 'error',
       message: `Erreur lors du chargement des données de la promotion: ${message}`,
     });
   }
 };

 const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
   if (e.target.checked) {
     setSelectedPromotions([...selectedPromotions, id]);
   } else {
     setSelectedPromotions(selectedPromotions.filter(promotionId => promotionId !== id));
   }
 };

 const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
   if (e.target.checked) {
     setSelectedPromotions(filteredPromotions.map(promotion => promotion.idPromotion));
   } else {
     setSelectedPromotions([]);
   }
 };

const additionalActions = [
  {
    label: 'Activer/Désactiver',
    action: (item: PromotionResponse) => handleToggleStatus(item),
    icon: <ToggleLeft size={20} />,
  },
  {
    label: 'Dupliquer',
    action: (item: PromotionResponse) => handleDuplicate(item),
    icon: <Copy size={20} />,
  },
];

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
       title="Gestion des Promotions"
       searchTerm={searchTerm}
       onSearchChange={handleSearch}
       selectedItems={selectedPromotions}
       onEdit={() => {
         const promotion = promotions.find(p => p.idPromotion === selectedPromotions[0]);
         if (promotion) handleEdit(promotion);
       }}
       onDelete={handleDelete}
       onAdd={handleAdd}
     />

     <TableComponent
       data={filteredPromotions}
       columns={columns}
       loading={loading}
       error={error}
       selectedItems={selectedPromotions}
       handleCheckboxChange={handleCheckboxChange}
       handleSelectAll={handleSelectAll}
       onEdit={handleEdit}
       onDelete={(id: number) => {
         setSelectedPromotions([id]);
         handleDelete();
       }}
       additionalActions={additionalActions}
       idField="idPromotion"
     />

     <ConfirmDeleteModal
       isOpen={isDeleteModalOpen}
       onClose={() => setIsDeleteModalOpen(false)}
       onConfirm={confirmDelete}
       itemCount={selectedPromotions.length}
       entityName="promotion(s)"
     />

     <FormModal
       isOpen={isAddModalOpen}
       onClose={() => setIsAddModalOpen(false)}
       title="Créer une Nouvelle Promotion"
       fields={promotionFields}
       formData={formData}
       setFormData={setFormData}
       onSubmit={handleAddSubmit}
       submitButtonText="Créer"
     />

     <FormModal
       isOpen={isEditModalOpen}
       onClose={() => setIsEditModalOpen(false)}
       title="Modifier la Promotion"
       fields={promotionFields}
       formData={formData}
       setFormData={setFormData}
       onSubmit={handleEditSubmit}
       submitButtonText="Modifier"
     />
   </div>
 );
};

export default Promotions;