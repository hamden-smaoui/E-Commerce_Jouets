'use client';

import React, { useState, useEffect } from 'react';
import TableComponent from '@/components/layout/TableComponent';
import HeaderCardComponent from '@/components/layout/HeaderCardComponent';
import FormModal from '@/components/layout/FormModal';
import Notification from '@/components/layout/Notification';
import ConfirmDeleteModal from '@/components/layout/ConfirmDeleteModal';
import MarquesService from '@/services/marques-service';
import imageCompression from 'browser-image-compression';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useSession } from "next-auth/react";



// Define TypeScript interface for Produit from the backend
interface Produit {
  idProduit: number;
  nom: string;
  prix: number;
}

// Define TypeScript interface matching the Sequelize Marque model
interface Marque {
  idMarque: number;
  nom: string;
  description: string | null;
  logoUrl: string | null;
  produits?: Produit[];
}

// Define FormData interface for form handling
interface FormData {
  idMarque: number | null;
  nom: string;
  description: string | null;
  logo: File | string | null;
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

// Marques component
const Marques: React.FC = () => {
  const [marques, setMarques] = useState<Marque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    idMarque: null,
    nom: '',
    description: '',
    logo: null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [selectedMarques, setSelectedMarques] = useState<number[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [imageKey, setImageKey] = useState(0);
const { data: session, status } = useSession();
const token = session?.customToken;
  // Fetch marques on component mount
  useEffect(() => {
    const fetchMarques = async () => {
      try {
        setLoading(true);
        const fetchedMarques = await MarquesService.getAllMarques(token);
        setMarques(fetchedMarques);
        setError(null);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        console.error('Erreur lors de la récupération:', error);
        setError(message);
        setMarques([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMarques();
  }, []);

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    };
  }, [previewUrl]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredMarques = marques.filter(
    (marque) =>
      marque &&
      ((marque.nom && marque.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (marque.description && marque.description.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const columns = [
    {
      header: 'Nom de la marque',
      render: (item: Marque) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="font-bold">{item.nom || 'N/A'}</div>
            <div className="text-sm opacity-50">{item.description || 'N/A'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Logo',
      render: (item: Marque) =>
        item.logoUrl ? (
          <img
            src={`${item.logoUrl}`}
            alt={item.nom}
            className="h-10 w-10 object-contain"
            onError={(e) => {
              e.currentTarget.src = '/images/image-profile.svg';
              console.error(`Failed to load image: ${item.logoUrl}`);
            }}
          />
        ) : (
          <span className="text-gray-400">N/A</span>
        ),
    },
    {
      header: 'Produits',
      render: (item: Marque) => (item.produits ? item.produits.length : 0),
    },
  ];

const handleImageChange = async (file: File | null, onChange: (value: any) => void) => {
  if (file) {
    try {
      setImageLoading(true);
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };
      const compressedBlob = await imageCompression(file, options);
      console.log('Image compressée:', compressedBlob);

      // Convert Blob to File
      const compressedFile = new File([compressedBlob], file.name, {
        type: compressedBlob.type,
        lastModified: file.lastModified,
      });
      console.log('Fichier File créé:', compressedFile);

      // Revoke previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      // Set new preview URL
      const newPreviewUrl = URL.createObjectURL(compressedFile);
      console.log('Nouvelle URL de prévisualisation créée:', newPreviewUrl);
      setPreviewUrl(newPreviewUrl);
      setImageKey((prev) => prev + 1);

      // Update form data EXPLICITLY
      setFormData(prev => ({
        ...prev,
        logo: compressedFile
      }));

      // Also call onChange for the FormModal
      onChange(compressedFile);

      console.log('FormData mis à jour avec le nouveau fichier');

      setNotification({
        type: 'success',
        message: 'Image sélectionnée avec succès',
      });
    } catch (error) {
      console.error('Erreur lors de la compression:', error);
      setNotification({
        type: 'error',
        message: 'Erreur lors de la compression de l\'image',
      });
    } finally {
      setImageLoading(false);
    }
  }
};

const marqueFields: Field<FormData>[] = [
  {
    name: 'nom',
    label: 'Nom',
    type: 'text',
    placeholder: 'Nom de la marque',
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
    placeholder: 'Description de la marque',
    validation: {
      required: false,
      maxLength: 500,
      title: 'Maximum 500 caractères',
    },
    hint: 'Maximum 500 caractères (optionnel)',
  },
  {
    name: 'logo',
    label: 'Logo',
    type: 'custom',
    render: ({ value, onChange }) => {
      const getPreviewUrl = () => {
        console.log('getPreviewUrl - value:', value);
        console.log('getPreviewUrl - previewUrl:', previewUrl);
        console.log('getPreviewUrl - imageLoading:', imageLoading);
        console.log('getPreviewUrl - formData.logo:', formData.logo);
        
        // Si on est en train de charger
        if (imageLoading) {
          return '/images/image-profile.svg';
        }
        
        // Utiliser formData.logo au lieu de value pour être sûr d'avoir la dernière valeur
        const logoValue = formData.logo;
        
        // Si on a un nouveau fichier sélectionné ET une URL de prévisualisation
        if (logoValue instanceof File && previewUrl) {
          console.log('Utilisation de previewUrl:', previewUrl);
          return previewUrl;
        }
        
        // Si on a une URL d'image existante (cas de modification)
        if (typeof logoValue === 'string' && logoValue && !logoValue.startsWith('blob:')) {
          const url = `${logoValue}`;
          console.log('Utilisation de l\'URL backend:', url);
          return url;
        }
        
        // Image par défaut
        console.log('Utilisation de l\'image par défaut');
        return '/images/image-profile.svg';
      };

      const currentUrl = getPreviewUrl();
      console.log('URL actuelle utilisée:', currentUrl);

      return (
        <div className="relative w-32 h-32">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded border z-10">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          )}
          <img
            key={`image-${imageKey}-${Date.now()}`}
            src={currentUrl}
            alt="Aperçu"
            className="w-full h-full object-cover rounded border"
            onLoad={() => {
              console.log('Image chargée avec succès:', currentUrl);
            }}
            onError={(e) => {
              console.error('Erreur lors du chargement de l\'image:', currentUrl);
              if (e.currentTarget.src !== '/images/image-profile.svg') {
                e.currentTarget.src = '/images/image-profile.svg';
              }
            }}
          />
          <label className="absolute top-2 right-2 btn btn-circle btn-sm btn-primary cursor-pointer">
            <FontAwesomeIcon icon={faEdit} />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files ? e.target.files[0] : null;
                console.log('Fichier sélectionné:', file);
                if (file) {
                  await handleImageChange(file, onChange);
                }
                // Reset the input value to allow selecting the same file again
                e.target.value = '';
              }}
            />
          </label>
        </div>
      );
    },
    validation: {
      required: false,
      validate: (value: any) => {
        if (value && value instanceof File) {
          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
          if (!allowedTypes.includes(value.type)) {
            return 'Seuls les fichiers JPEG, PNG ou GIF sont autorisés';
          }
          if (value.size > 5 * 1024 * 1024) {
            return 'Le fichier ne doit pas dépasser 5MB';
          }
        }
        return '';
      },
    },
    hint: 'Importer une image (JPEG, PNG, GIF, max 5MB, optionnel)',
  },
];

  const handleAddSubmit = async (data: FormData) => {
    try {
      console.log('Données à envoyer:', data);

      const formDataToSend = new FormData();
      formDataToSend.append('nom', data.nom);
      formDataToSend.append('description', data.description || '');
      if (data.logo && data.logo instanceof File) {
        formDataToSend.append('logo', data.logo);
        console.log('Logo ajouté au FormData:', data.logo);
      }

      const newMarque = await MarquesService.createMarque(formDataToSend,token);
      console.log('Nouvelle marque créée:', newMarque);

      setMarques([...marques, newMarque]);
      setIsAddModalOpen(false);

      // Reset form data and preview
      setFormData({
        idMarque: null,
        nom: '',
        description: '',
        logo: null,
      });
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setFormKey((prev) => prev + 1);
      setImageKey((prev) => prev + 1);

      setNotification({
        type: 'success',
        message: 'Marque ajoutée avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors de l\'ajout:', error);
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de l'ajout de la marque: ${message}`,
      });
    }
  };

  const handleEditSubmit = async (data: FormData) => {
    try {
      if (!data.idMarque) {
        setNotification({
          type: 'error',
          message: 'Aucune marque sélectionnée pour modification.',
        });
        return;
      }

      console.log('Données de modification:', data);

      const formDataToSend = new FormData();
      formDataToSend.append('nom', data.nom);
      formDataToSend.append('description', data.description || '');
      if (data.logo && data.logo instanceof File) {
        formDataToSend.append('logo', data.logo);
        console.log('Logo de modification ajouté:', data.logo);
      }

      const updatedMarque = await MarquesService.updateMarque(data.idMarque, formDataToSend,token);
      console.log('Marque mise à jour:', updatedMarque);

      setMarques(marques.map((marque) => (marque.idMarque === data.idMarque ? updatedMarque : marque)));
      setIsEditModalOpen(false);
      
      // Cleanup preview
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setFormKey((prev) => prev + 1);
      setImageKey((prev) => prev + 1);

      setNotification({
        type: 'success',
        message: 'Marque modifiée avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors de la modification:', error);
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de la modification de la marque: ${message}`,
      });
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      for (const id of selectedMarques) {
        await MarquesService.deleteMarque(id,token);
      }
      setMarques(marques.filter((marque) => !selectedMarques.includes(marque.idMarque)));
      setSelectedMarques([]);
      setIsDeleteModalOpen(false);
      setNotification({
        type: 'success',
        message: 'Marque(s) supprimée(s) avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors de la suppression:', error);
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de la suppression de la marque: ${message}`,
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.checked) {
      setSelectedMarques([...selectedMarques, id]);
    } else {
      setSelectedMarques(selectedMarques.filter((marqueId) => marqueId !== id));
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedMarques(filteredMarques.map((marque) => marque.idMarque));
    } else {
      setSelectedMarques([]);
    }
  };

  const handleAdd = () => {
    // Reset tout pour l'ajout
    setFormData({
      idMarque: null,
      nom: '',
      description: '',
      logo: null,
    });
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setFormKey((prev) => prev + 1);
    setImageKey((prev) => prev + 1);
    setIsAddModalOpen(true);
  };

  const handleEdit = async (marque: Marque) => {
    try {
      const fetchedMarque = await MarquesService.getMarqueById(marque.idMarque,token);
      console.log('Marque récupérée pour modification:', fetchedMarque);

      // Nettoyer le previewUrl précédent
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      setFormData({
        idMarque: fetchedMarque.idMarque,
        nom: fetchedMarque.nom || '',
        description: fetchedMarque.description || '',
        logo: fetchedMarque.logoUrl || null, // Utiliser logoUrl directement
      });
      
      setFormKey((prev) => prev + 1);
      setImageKey((prev) => prev + 1);
      setIsEditModalOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors du chargement pour modification:', error);
      setNotification({
        type: 'error',
        message: `Erreur lors du chargement des données de la marque: ${message}`,
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
        title="Liste des Marques"
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        selectedItems={selectedMarques}
        onEdit={() => {
          const marque = marques.find((m) => m.idMarque === selectedMarques[0]);
          if (marque) handleEdit(marque);
        }}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />
      <TableComponent
        data={filteredMarques}
        columns={columns}
        loading={loading}
        error={error}
        selectedItems={selectedMarques}
        handleCheckboxChange={handleCheckboxChange}
        handleSelectAll={handleSelectAll}
        onEdit={handleEdit}
        onDelete={(id: number) => {
          setSelectedMarques([id]);
          handleDelete();
        }}
        idField="idMarque"
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemCount={selectedMarques.length}
        entityName="marque(s)"
      />
      <FormModal
        key={`add-${formKey}`}
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }
          setImageKey((prev) => prev + 1);
        }}
        title="Ajouter une Nouvelle Marque"
        fields={marqueFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddSubmit}
        submitButtonText="Ajouter"
      />
      <FormModal
        key={`edit-${formKey}`}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }
          setImageKey((prev) => prev + 1);
        }}
        title="Modifier une Marque"
        fields={marqueFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditSubmit}
        submitButtonText="Modifier"
      />
    </div>
  );
};

export default Marques;