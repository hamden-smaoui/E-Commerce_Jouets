'use client';

import React from 'react';

// Define TypeScript interface for props
interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemCount: number;
  entityName: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemCount,
  entityName,
}) => {
  if (!isOpen) return null;

  return (
    <dialog open className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg">Confirmer la suppression</h3>
        <p className="py-4">
          Êtes-vous sûr de vouloir supprimer {itemCount} {entityName} ?
        </p>
        <div className="modal-action">
          <button className="btn btn-error" onClick={onConfirm}>
            Supprimer
          </button>
          <button className="btn" onClick={onClose}>
            Annuler
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default ConfirmDeleteModal;