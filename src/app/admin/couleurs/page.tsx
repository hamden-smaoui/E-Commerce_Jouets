'use client';

import React, { useState, useEffect } from 'react';
import TableComponent from '@/components/layout/TableComponent';
import HeaderCardComponent from '@/components/layout/HeaderCardComponent';
import FormModal from '@/components/layout/FormModal';
import Notification from '@/components/layout/Notification';
import ConfirmDeleteModal from '@/components/layout/ConfirmDeleteModal';
import CouleursService, { Couleur, CouleurFormData } from '@/services/couleurs-service';
import { useSession } from "next-auth/react";
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/css";

interface FormData {
  idCouleur: number | null;
  nom: string;
  ref: string;
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

// ✅ NOUVEAU COMPOSANT SÉPARÉ pour le Color Picker
const ColorPickerField: React.FC<{ value: string; onChange: (value: string) => void }> = ({ value, onChange }) => {
  const [color, setColor] = useColor(value || "#000000");

  // Synchroniser : picker → formData
  useEffect(() => {
    onChange(color.hex.toUpperCase());
  }, [color.hex, onChange]);

  // Gérer la saisie manuelle du code HEX
  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.toUpperCase();
    if (input === '' || /^#[0-9A-F]{0,6}$/.test(input)) {
      onChange(input);
      if (/^#[0-9A-F]{6}$/.test(input)) {
        setColor({ ...color, hex: input });
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Color Picker */}
      <div className="bg-white p-4 rounded-xl border shadow-md">
        <ColorPicker
          color={color}
          onChange={setColor}
          hideInput={["rgb", "hsv"]}
          height={200}
        />
      </div>

      {/* Champ texte + aperçu */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border">
        <div
          className="w-20 h-20 rounded-xl border-2 border-gray-300 shadow-inner"
          style={{ backgroundColor: color.hex }}
        />

        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={value || ''}
            onChange={handleHexInput}
            placeholder="#000000"
            maxLength={7}
            className="input input-bordered w-full font-mono text-lg"
            style={{ textTransform: 'uppercase' }}
          />
          <p className="text-xs text-gray-500">
            Saisissez ou modifiez le code HEX
          </p>
        </div>
      </div>

      {/* Palette rapide */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Couleurs populaires :</p>
        <div className="grid grid-cols-8 gap-2">
          {[
            '#FF0000', '#FF6B6B', '#FFA500', '#FFD700',
            '#00FF00', '#4CAF50', '#00CED1', '#1E90FF',
            '#0000FF', '#8B00FF', '#FF1493', '#FF69B4',
            '#000000', '#666666', '#999999', '#FFFFFF'
          ].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setColor({ ...color, hex: c });
                onChange(c);
              }}
              className={`aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                color.hex.toUpperCase() === c ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'
              }`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

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
    ref: '#000000',
  });
  const [selectedCouleurs, setSelectedCouleurs] = useState<number[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formKey, setFormKey] = useState(0);

  const { data: session } = useSession();
  const token = session?.customToken;

  useEffect(() => {
    const fetchCouleurs = async () => {
      try {
        setLoading(true);
        const fetchedCouleurs = await CouleursService.getAllCouleurs(token);
        setCouleurs(fetchedCouleurs);
        setError(null);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        setError(message);
        setCouleurs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCouleurs();
  }, [token]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredCouleurs = couleurs.filter(
    (couleur) =>
      couleur &&
      ((couleur.nom && couleur.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (couleur.ref && couleur.ref.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const columns = [
    {
      header: 'Couleur',
      render: (item: Couleur) => (
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg border-2 border-gray-300 shadow-sm"
            style={{ backgroundColor: item.ref || '#CCCCCC' }}
            title={item.ref || 'Pas de couleur'}
          />
          <div>
            <div className="font-bold">{item.nom || 'N/A'}</div>
            <div className="text-xs text-gray-500">{item.ref || '-'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Code Couleur',
      render: (item: Couleur) => (
        <div className="flex items-center gap-2">
          <code className="badge badge-outline font-mono">{item.ref || '-'}</code>
        </div>
      ),
    },
  ];

  // ✅ UTILISATION DU NOUVEAU COMPOSANT
  const couleurFields: Field<FormData>[] = [
    {
      name: 'nom',
      label: 'Nom de la couleur',
      type: 'text',
      placeholder: 'Ex: Rouge Ferrari, Bleu Ciel',
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50,
      },
      hint: 'Donnez un nom descriptif à votre couleur',
    },
    {
      name: 'ref',
      label: 'Sélectionner la couleur',
      type: 'custom',
      render: ({ value, onChange }) => (
        <ColorPickerField value={value} onChange={onChange} />
      ),
    },
  ];

  const handleAddSubmit = async (data: FormData) => {
    try {
      const couleurData: CouleurFormData = { 
        nom: data.nom,
        ref: data.ref || null
      };
      const newCouleur = await CouleursService.createCouleur(couleurData, token);
      setCouleurs([...couleurs, newCouleur]);
      setIsAddModalOpen(false);

      setFormData({
        idCouleur: null,
        nom: '',
        ref: '#000000',
      });
      setFormKey((prev) => prev + 1);

      setNotification({
        type: 'success',
        message: 'Couleur ajoutée avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! ${message}`,
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

      const couleurData: CouleurFormData = { 
        nom: data.nom,
        ref: data.ref || null
      };
      const updatedCouleur = await CouleursService.updateCouleur(data.idCouleur, couleurData, token);

      setCouleurs(couleurs.map((couleur) => (couleur.idCouleur === data.idCouleur ? updatedCouleur : couleur)));
      setIsEditModalOpen(false);
      setFormKey((prev) => prev + 1);

      setNotification({
        type: 'success',
        message: 'Couleur modifiée avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! ${message}`,
      });
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      for (const id of selectedCouleurs) {
        await CouleursService.deleteCouleur(id, token);
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
      setNotification({
        type: 'error',
        message: `Erreur ! ${message}`,
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
      ref: '#000000',
    });
    setFormKey((prev) => prev + 1);
    setIsAddModalOpen(true);
  };

  const handleEdit = async (couleur: Couleur) => {
    try {
      const fetchedCouleur = await CouleursService.getCouleurById(couleur.idCouleur, token);

      setFormData({
        idCouleur: fetchedCouleur.idCouleur,
        nom: fetchedCouleur.nom || '',
        ref: fetchedCouleur.ref || '#000000',
      });
      
      setFormKey((prev) => prev + 1);
      setIsEditModalOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur lors du chargement: ${message}`,
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