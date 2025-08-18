'use client';
import { EyeIcon } from '@heroicons/react/24/outline';
import React from 'react';

// Define TypeScript interface for props
interface HeaderCardComponentProps {
  title: string;
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedItems: any[];
  onEdit: () => void;
  onDelete: () => void;
  onAdd?: () => void;
  showAddButton?: boolean;
  showViewButton?: boolean;
  onView?: () => void;
  additionalActions?: React.ReactNode; // ✅ Ajout de additionalActions
}

const HeaderCardComponent: React.FC<HeaderCardComponentProps> = ({
  title,
  searchTerm,
  onSearchChange,
  selectedItems,
  onEdit,
  onDelete,
  onAdd,
  showAddButton = true,
  showViewButton = false,
  onView,
  additionalActions // ✅ Destructuring de additionalActions
}) => {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-base-200 p-4 shadow-md rounded-lg mb-4 gap-4">
      <h2 className="text-xl font-bold w-full md:w-auto">{title}</h2>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full md:w-auto">
        {selectedItems.length > 0 && (
          <div className="flex gap-2">
            {selectedItems.length === 1 && (
              <button className="btn btn-warning" onClick={onEdit}>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Modifier
              </button>
            )}
            <button className="btn btn-error" onClick={onDelete}>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Supprimer
            </button>
          </div>
        )}
        
        {/* ✅ Affichage des actions supplémentaires */}
        {additionalActions && (
          <div className="flex gap-2">
            {additionalActions}
          </div>
        )}
        
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={onSearchChange}
          className="input input-bordered w-full sm:w-64"
        />
        {showAddButton && (
          <button className="btn btn-primary w-full sm:w-auto" onClick={onAdd}>
            Ajouter
          </button>
        )}
        {showViewButton && selectedItems.length === 1 && (
          <button
            className="btn btn-info btn-sm"
            onClick={onView}
          >
            <EyeIcon className="w-4 h-4" />
            Voir
          </button>
        )}
      </div>
    </div>
  );
};

export default HeaderCardComponent;