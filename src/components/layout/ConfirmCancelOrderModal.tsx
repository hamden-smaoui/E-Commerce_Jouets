'use client';
import React from 'react';

// Define TypeScript interface for props
interface ConfirmCancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderNumber: string;
  isLoading?: boolean;
}

const ConfirmCancelOrderModal: React.FC<ConfirmCancelOrderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  orderNumber,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <dialog open className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
            disabled={isLoading}
          >
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg">Confirmer l'annulation</h3>
        <p className="py-4">
          Êtes-vous sûr de vouloir annuler la commande {orderNumber} ?
        </p>
        <div className="modal-action">
          <button 
            className="btn btn-error" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Annulation...' : 'Annuler'}
          </button>
          <button 
            className="btn" 
            onClick={onClose}
            disabled={isLoading}
          >
            Conserver
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default ConfirmCancelOrderModal;