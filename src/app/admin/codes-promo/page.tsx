// pages/CodesPromo.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import TableComponent from '@/components/layout/TableComponent';
import HeaderCardComponent from '@/components/layout/HeaderCardComponent';
import FormModal from '@/components/layout/FormModal';
import Notification from '@/components/layout/Notification';
import ConfirmDeleteModal  from '@/components/layout/ConfirmDeleteModal';
import CodesPromoService, { CodePromo, CodePromoFormData } from '@/services/codes-promo-service';
import PromotionsService from '@/services/promotions-service';
import { ToggleLeft} from 'lucide-react';

// Interfaces
interface Promotion {
 idPromotion: number;
 nom: string;
 typePromotion: string;
 valeurPromotion: number;
 dateDebut: string;
 dateFin: string;
 actif: boolean;
}

interface FormData {
 idCodePromo: number | null;
 code: string;
 idPromotion: number;
 utilisationMax: number | null;
 actif: boolean;
}

interface CodePromoResponse extends CodePromo {
 promotion?: Promotion;
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
 };
 render?: (props: { value: any; onChange: (value: any) => void }) => React.ReactElement;
 hidden?: boolean;
 disabled?: boolean;
}

// Modal pour générer des codes en masse
const GenerateCodesModal: React.FC<{
 isOpen: boolean;
 onClose: () => void;
 promotions: Promotion[];
 onGenerate: (data: any) => Promise<void>;
}> = ({ isOpen, onClose, promotions, onGenerate }) => {
 const [formData, setFormData] = useState({
   idPromotion: 0,
   nombreCodes: 10,
   prefixe: 'PROMO',
   longueur: 8,
   utilisationMax: 1,
 });

 if (!isOpen) return null;

 return (
   <div className="modal modal-open">
     <div className="modal-box">
       <h3 className="font-bold text-lg mb-4">Générer des codes promo en masse</h3>
       
       <div className="space-y-4">
         <div>
           <label className="label">Promotion</label>
           <Select
             options={promotions.filter(p => p.actif).map(p => ({ 
               value: p.idPromotion, 
               label: `${p.nom} (${p.typePromotion})` 
             }))}
             onChange={(option) => setFormData(prev => ({ ...prev, idPromotion: option?.value || 0 }))}
             placeholder="Sélectionnez une promotion"
           />
         </div>
         
         <div>
           <label className="label">Nombre de codes</label>
           <input
             type="number"
             className="input input-bordered w-full"
             value={formData.nombreCodes}
             min="1"
             max="1000"
             onChange={(e) => setFormData(prev => ({ ...prev, nombreCodes: parseInt(e.target.value) || 1 }))}
           />
         </div>
         
         <div>
           <label className="label">Préfixe</label>
           <input
             type="text"
             className="input input-bordered w-full"
             value={formData.prefixe}
             maxLength={10}
             onChange={(e) => setFormData(prev => ({ ...prev, prefixe: e.target.value.toUpperCase() }))}
           />
         </div>
         
         <div>
           <label className="label">Longueur du suffixe</label>
           <input
             type="number"
             className="input input-bordered w-full"
             value={formData.longueur}
             min="4"
             max="20"
             onChange={(e) => setFormData(prev => ({ ...prev, longueur: parseInt(e.target.value) || 8 }))}
           />
         </div>
         
         <div>
           <label className="label">Utilisation maximale par code</label>
           <input
             type="number"
             className="input input-bordered w-full"
             value={formData.utilisationMax}
             min="1"
             onChange={(e) => setFormData(prev => ({ ...prev, utilisationMax: parseInt(e.target.value) || 1 }))}
           />
         </div>
       </div>

       <div className="modal-action">
         <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
         <button
           className="btn btn-primary"
           onClick={() => onGenerate(formData)}
           disabled={formData.idPromotion === 0}
         >
           Générer
         </button>
       </div>
     </div>
   </div>
 );
};

const CodesPromo: React.FC = () => {
 const [codesPromo, setCodesPromo] = useState<CodePromoResponse[]>([]);
 const [promotions, setPromotions] = useState<Promotion[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [searchTerm, setSearchTerm] = useState('');
 const [isAddModalOpen, setIsAddModalOpen] = useState(false);
 const [isEditModalOpen, setIsEditModalOpen] = useState(false);
 const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
 const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
 const [selectedCodesPromo, setSelectedCodesPromo] = useState<number[]>([]);
 const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

 // Pagination
 const [currentPage, setCurrentPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const [totalItems, setTotalItems] = useState(0);
 const itemsPerPage = 10;

 // Filtres
 const [filters, setFilters] = useState({
   actif: undefined as boolean | undefined,
   idPromotion: undefined as number | undefined,
 });

 const [formData, setFormData] = useState<FormData>({
   idCodePromo: null,
   code: '',
   idPromotion: 0,
   utilisationMax: null,
   actif: true,
 });

 useEffect(() => {
   fetchPromotions();
 }, []);

 useEffect(() => {
   fetchCodesPromo();
 }, [currentPage, filters, searchTerm]);

 const fetchPromotions = async () => {
   try {
     const fetchedPromotions = await PromotionsService.getAllPromotions();
     setPromotions(fetchedPromotions);
   } catch (error: unknown) {
     const message = error instanceof Error ? error.message : 'Unknown error occurred';
     setNotification({
       type: 'error',
       message: `Erreur lors du chargement des promotions: ${message}`,
     });
   }
 };

 const fetchCodesPromo = async () => {
   try {
     setLoading(true);
     const response = await CodesPromoService.getAllCodesPromo({
       page: currentPage,
       limit: itemsPerPage,
       actif: filters.actif,
       idPromotion: filters.idPromotion,
       search: searchTerm.trim() || undefined,
     });
     
     setCodesPromo(response.data);
     setTotalPages(response.pagination.totalPages);
     setTotalItems(response.pagination.total);
     setLoading(false);
   } catch (error: unknown) {
     const message = error instanceof Error ? error.message : 'Unknown error occurred';
     setError(message);
     setLoading(false);
   }
 };

 const formatDate = (dateString: string) => {
   return new Date(dateString).toLocaleDateString('fr-FR');
 };

 const getStatusBadge = (actif: boolean) => {
   return (
     <span className={`badge ${actif ? 'badge-success' : 'badge-error'}`}>
       {actif ? 'Actif' : 'Inactif'}
     </span>
   );
 };

 const getUsageBadge = (current: number, max: number | null) => {
   if (max === null) {
     return <span className="badge badge-outline">∞</span>;
   }
   
   const percentage = (current / max) * 100;
   let badgeClass = 'badge-success';
   
   if (percentage >= 80) {
     badgeClass = 'badge-error';
   } else if (percentage >= 60) {
     badgeClass = 'badge-warning';
   }
   
   return (
     <span className={`badge ${badgeClass}`}>
       {current} / {max}
     </span>
   );
 };

 const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
   setSearchTerm(e.target.value);
   setCurrentPage(1); // Reset à la première page lors d'une recherche
 };

 const columns = [
   {
     header: 'Code',
     render: (item: CodePromoResponse) => (
       <div className="font-mono font-bold text-primary">
         {item.code}
       </div>
     ),
   },
   {
     header: 'Promotion',
     render: (item: CodePromoResponse) => (
       <div>
         {item.promotion ? (
           <>
             <div className="font-semibold">{item.promotion.nom}</div>
             <div className="text-sm opacity-70">
               {item.promotion.typePromotion} - {item.promotion.valeurPromotion}
               {item.promotion.typePromotion === 'pourcentage' ? '%' : 
                item.promotion.typePromotion === 'montant_fixe' ? ' TND' : ''}
             </div>
           </>
         ) : (
           <span className="text-error">Promotion introuvable</span>
         )}
       </div>
     ),
   },
   {
     header: 'Utilisation',
     render: (item: CodePromoResponse) => getUsageBadge(item.utilisationActuelle, item.utilisationMax),
   },
   {
     header: 'Statut',
     render: (item: CodePromoResponse) => getStatusBadge(item.actif),
   },
   {
     header: 'Date création',
     render: (item: CodePromoResponse) => (
       <div className="text-sm">
         {formatDate(item.createdAt)}
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
   menuPortal: (provided: any) => ({
     ...provided,
     zIndex: 10000,
   }),
 };

 const codePromoFields: Field<FormData>[] = [
   {
     name: 'code',
     label: 'Code promo',
     type: 'text',
     placeholder: 'CODE-PROMO',
     validation: {
       required: true,
       minLength: 3,
       maxLength: 20,
       validate: (value: string) => {
         if (!/^[A-Z0-9-_]+$/.test(value)) {
           return 'Le code ne peut contenir que des lettres majuscules, chiffres, tirets et underscores';
         }
         return '';
       }
     },
     hint: 'Lettres majuscules, chiffres, tirets et underscores uniquement',
   },
   {
     name: 'idPromotion',
     label: 'Promotion',
     type: 'custom',
     render: ({ value, onChange }) => (
       <Select
         options={promotions.filter(p => p.actif).map(promotion => ({
           value: promotion.idPromotion,
           label: `${promotion.nom} (${promotion.typePromotion})`
         }))}
         value={
           value > 0
             ? {
                 value: value,
                 label: promotions.find(p => p.idPromotion === value)?.nom || '',
               }
             : null
         }
         onChange={(selectedOption) => {
           const newValue = selectedOption ? selectedOption.value : 0;
           setFormData((prev) => ({ ...prev, idPromotion: newValue }));
           onChange(newValue);
         }}
         placeholder="Sélectionnez une promotion"
         className="w-full"
         isClearable={false}
         styles={customSelectStyles}
         menuPortalTarget={document.body}
       />
     ),
     validation: {
       required: true,
       validate: (value: number) => {
         return value > 0 ? '' : 'Sélectionnez une promotion';
       },
     },
     hint: 'Choisissez la promotion associée à ce code',
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
     hint: 'Nombre maximum d\'utilisations (laisser vide pour illimité)',
   },
   {
     name: 'actif',
     label: 'Actif',
     type: 'checkbox',
     hint: 'Le code peut être utilisé',
   },
 ];

 const handleAddSubmit = async (data: FormData) => {
   try {
     if (data.idPromotion === 0) {
       setNotification({
         type: 'error',
         message: 'Veuillez sélectionner une promotion valide.',
       });
       return;
     }

     const codePromoData: CodePromoFormData = {
       code: data.code.toUpperCase(),
       idPromotion: data.idPromotion,
       utilisationMax: data.utilisationMax,
       actif: data.actif,
     };

     await CodesPromoService.createCodePromo(codePromoData);
     await fetchCodesPromo();
     setIsAddModalOpen(false);
     resetForm();
     setNotification({
       type: 'success',
       message: 'Code promo créé avec succès !',
     });
   } catch (error: unknown) {
     const message = error instanceof Error ? error.message : 'Erreur inconnue';
     setNotification({
       type: 'error',
       message: `Erreur ! Échec de la création du code promo: ${message}`,
     });
   }
 };

 const handleEditSubmit = async (data: FormData) => {
   try {
     if (!data.idCodePromo) {
       setNotification({
         type: 'error',
         message: 'Aucun code promo sélectionné pour modification.',
       });
       return;
     }

     const codePromoData = {
       code: data.code.toUpperCase(),
       utilisationMax: data.utilisationMax,
       actif: data.actif,
     };

     await CodesPromoService.updateCodePromo(data.idCodePromo, codePromoData);
     await fetchCodesPromo();
     setIsEditModalOpen(false);
     resetForm();
     setNotification({
       type: 'success',
       message: 'Code promo modifié avec succès !',
     });
   } catch (error: unknown) {
     const message = error instanceof Error ? error.message : 'Erreur inconnue';
     setNotification({
       type: 'error',
       message: `Erreur ! Échec de la modification du code promo: ${message}`,
     });
   }
 };

 const handleDelete = () => {
   setIsDeleteModalOpen(true);
 };

 const confirmDelete = async () => {
   try {
     for (const id of selectedCodesPromo) {
       await CodesPromoService.deleteCodePromo(id);
     }
     await fetchCodesPromo();
     setSelectedCodesPromo([]);
     setIsDeleteModalOpen(false);
     setNotification({
       type: 'success',
       message: 'Code(s) promo supprimé(s) avec succès !',
     });
   } catch (error: unknown) {
     const message = error instanceof Error ? error.message : 'Erreur inconnue';
     setNotification({
       type: 'error',
       message: `Erreur ! Échec de la suppression du code promo: ${message}`,
     });
   }
 };

 const handleToggleStatus = async (codePromo: CodePromoResponse) => {
   try {
     await CodesPromoService.toggleCodePromo(codePromo.idCodePromo);
     await fetchCodesPromo();
     setNotification({
       type: 'success',
       message: `Code promo ${codePromo.actif ? 'désactivé' : 'activé'} avec succès !`,
     });
   } catch (error: unknown) {
     const message = error instanceof Error ? error.message : 'Erreur inconnue';
     setNotification({
       type: 'error',
       message: `Erreur ! ${message}`,
     });
   }
 };

 const handleGenerateCodes = async (data: any) => {
   try {
     const generatedCodes = await CodesPromoService.genererCodesPromo(data);
     await fetchCodesPromo();
     setIsGenerateModalOpen(false);
     setNotification({
       type: 'success',
       message: `${generatedCodes.length} codes promo générés avec succès !`,
     });
   } catch (error: unknown) {
     const message = error instanceof Error ? error.message : 'Erreur inconnue';
     setNotification({
       type: 'error',
       message: `Erreur ! ${message}`,
     });
   }
 };

 const handleExport = async (format: 'json' | 'csv') => {
   try {
     const exportedData = await CodesPromoService.exporterCodesPromo({
       idPromotion: filters.idPromotion,
       format,
     });

     if (format === 'csv' && typeof exportedData === 'string') {
       // Télécharger le CSV
       const blob = new Blob([exportedData], { type: 'text/csv;charset=utf-8;' });
       const link = document.createElement('a');
       const url = URL.createObjectURL(blob);
       link.setAttribute('href', url);
       link.setAttribute('download', `codes-promo-${new Date().toISOString().split('T')[0]}.csv`);
       link.style.visibility = 'hidden';
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
     } else {
       // Télécharger le JSON
       const blob = new Blob([JSON.stringify(exportedData, null, 2)], { type: 'application/json' });
       const link = document.createElement('a');
       const url = URL.createObjectURL(blob);
       link.setAttribute('href', url);
       link.setAttribute('download', `codes-promo-${new Date().toISOString().split('T')[0]}.json`);
       link.style.visibility = 'hidden';
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
     }

     setNotification({
       type: 'success',
       message: 'Export réalisé avec succès !',
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
     idCodePromo: null,
     code: '',
     idPromotion: 0,
     utilisationMax: null,
     actif: true,
   });
 };

 const handleAdd = () => {
   resetForm();
   setIsAddModalOpen(true);
 };

 const handleEdit = async (codePromo: CodePromoResponse) => {
   try {
     const fetchedCodePromo = await CodesPromoService.getCodePromoById(codePromo.idCodePromo);
     
     setFormData({
       idCodePromo: fetchedCodePromo.idCodePromo,
       code: fetchedCodePromo.code,
       idPromotion: fetchedCodePromo.idPromotion,
       utilisationMax: fetchedCodePromo.utilisationMax,
       actif: fetchedCodePromo.actif,
     });
     
     setIsEditModalOpen(true);
   } catch (error: unknown) {
     const message = error instanceof Error ? error.message : 'Erreur inconnue';
     setNotification({
       type: 'error',
       message: `Erreur lors du chargement des données du code promo: ${message}`,
     });
   }
 };

 const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
   if (e.target.checked) {
     setSelectedCodesPromo([...selectedCodesPromo, id]);
   } else {
     setSelectedCodesPromo(selectedCodesPromo.filter(codePromoId => codePromoId !== id));
   }
 };

 const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
   if (e.target.checked) {
     setSelectedCodesPromo(codesPromo.map(codePromo => codePromo.idCodePromo));
   } else {
     setSelectedCodesPromo([]);
   }
 };

 // Actions supplémentaires pour le menu contextuel
 const additionalActions = [
   {
     label: 'Activer/Désactiver',
     action: (item: CodePromoResponse) => handleToggleStatus(item),
       icon: <ToggleLeft size={20} />,
   },
    
 ];

 // Actions supplémentaires pour le header
 const headerActions = (
   <div className="flex gap-2">
     <div className="dropdown dropdown-end">
       <label tabIndex={0} className="btn btn-outline btn-sm">
         Filtres
       </label>
       <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
         <li>
           <Select
             options={[
               { value: undefined, label: 'Tous les statuts' },
               { value: true, label: 'Actifs' },
               { value: false, label: 'Inactifs' },
             ]}
             value={{ 
               value: filters.actif, 
               label: filters.actif === undefined ? 'Tous les statuts' : 
                      filters.actif ? 'Actifs' : 'Inactifs' 
             }}
             onChange={(option) => {
               setFilters(prev => ({ ...prev, actif: option?.value }));
               setCurrentPage(1);
             }}
             placeholder="Statut"
           />
         </li>
         <li>
           <Select
             options={[
               { value: undefined, label: 'Toutes les promotions' },
               ...promotions.map(p => ({ value: p.idPromotion, label: p.nom }))
             ]}
             value={
               filters.idPromotion ? {
                 value: filters.idPromotion,
                 label: promotions.find(p => p.idPromotion === filters.idPromotion)?.nom || ''
               } : { value: undefined, label: 'Toutes les promotions' }
             }
             onChange={(option) => {
               setFilters(prev => ({ ...prev, idPromotion: option?.value }));
               setCurrentPage(1);
             }}
             placeholder="Promotion"
           />
         </li>
       </ul>
     </div>
     
     <div className="dropdown dropdown-end">
       <label tabIndex={0} className="btn btn-outline btn-sm">
         Actions
       </label>
       <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
         <li><a onClick={() => setIsGenerateModalOpen(true)}>Générer en masse</a></li>
         <li><a onClick={() => handleExport('csv')}>Exporter CSV</a></li>
         <li><a onClick={() => handleExport('json')}>Exporter JSON</a></li>
       </ul>
     </div>
   </div>
 );

 if (loading && codesPromo.length === 0) {
   return (
     <div className="flex justify-center items-center h-screen">
       <span className="loading loading-spinner loading-lg"></span>
     </div>
   );
 }

 if (error && codesPromo.length === 0) {
   return <div className="text-center p-6 text-error">{error}</div>;
 }

 return (
   <div className="p-6 w-full h-screen flex flex-col relative">
     <Notification notification={notification} onClose={() => setNotification(null)} />
     
     <HeaderCardComponent
       title="Gestion des Codes Promo"
       searchTerm={searchTerm}
       onSearchChange={handleSearch}
       selectedItems={selectedCodesPromo}
       onEdit={() => {
         const codePromo = codesPromo.find(cp => cp.idCodePromo === selectedCodesPromo[0]);
         if (codePromo) handleEdit(codePromo);
       }}
       onDelete={handleDelete}
       onAdd={handleAdd}
       additionalActions={headerActions}
     />

     <TableComponent
       data={codesPromo}
       columns={columns}
       loading={loading}
       error={error}
       selectedItems={selectedCodesPromo}
       handleCheckboxChange={handleCheckboxChange}
       handleSelectAll={handleSelectAll}
       onEdit={handleEdit}
       onDelete={(id: number) => {
         setSelectedCodesPromo([id]);
         handleDelete();
       }}
       additionalActions={additionalActions}
       idField="idCodePromo"
     />

     {/* Pagination */}
     <div className="flex justify-center items-center gap-4 mt-4">
       <div className="join">
         <button 
           className="join-item btn btn-sm" 
           onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
           disabled={currentPage === 1}
         >
           «
         </button>
         <button className="join-item btn btn-sm">
           Page {currentPage} sur {totalPages}
         </button>
         <button 
           className="join-item btn btn-sm"
           onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
           disabled={currentPage === totalPages}
         >
           »
         </button>
       </div>
       <div className="text-sm text-gray-500">
         {totalItems} code(s) au total
       </div>
     </div>

     <ConfirmDeleteModal
       isOpen={isDeleteModalOpen}
       onClose={() => setIsDeleteModalOpen(false)}
       onConfirm={confirmDelete}
       itemCount={selectedCodesPromo.length}
       entityName="code(s) promo"
     />

     <FormModal
       isOpen={isAddModalOpen}
       onClose={() => setIsAddModalOpen(false)}
       title="Créer un Nouveau Code Promo"
       fields={codePromoFields}
       formData={formData}
       setFormData={setFormData}
       onSubmit={handleAddSubmit}
       submitButtonText="Créer"
     />

     <FormModal
       isOpen={isEditModalOpen}
       onClose={() => setIsEditModalOpen(false)}
       title="Modifier le Code Promo"
       fields={codePromoFields.filter(field => field.name !== 'idPromotion')} // On ne peut pas changer la promotion
       formData={formData}
       setFormData={setFormData}
       onSubmit={handleEditSubmit}
       submitButtonText="Modifier"
     />

     <GenerateCodesModal
       isOpen={isGenerateModalOpen}
       onClose={() => setIsGenerateModalOpen(false)}
       promotions={promotions}
       onGenerate={handleGenerateCodes}
     />
   </div>
 );
};

export default CodesPromo;