'use client';
import React from 'react';
import { signIn } from 'next-auth/react';
import { usePathname } from 'next/navigation';

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({
  isOpen,
  onClose,
  isLoading = false,
}) => {
  const pathname = usePathname();

  const handleLogin = () => {
    // Rediriger vers login avec retour sur la page actuelle
    signIn(undefined, { callbackUrl: pathname });
  };

  if (!isOpen) return null;

  return (
    <dialog open className="modal modal-bottom sm:modal-middle">
      <div className="modal-box bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-pink-200">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
            disabled={isLoading}
          >
            ✕
          </button>
        </form>
        
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="currentColor" 
              viewBox="0 0 24 24" 
              className="w-8 h-8 text-pink-500"
            >
              <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-xl text-center text-gray-800 mb-2">
          Connexion requise
        </h3>
        
        {/* Description */}
        <p className="text-center text-gray-600 py-4">
          Pour ajouter des produits à vos favoris, vous devez être connecté.
          <br />
          <span className="text-sm text-gray-500 mt-2 block">
            Vous serez redirigé vers cette page après connexion.
          </span>
        </p>
        
        {/* Actions */}
        <div className="modal-action flex flex-col sm:flex-row gap-2 justify-center">
          <button 
            className="btn bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none flex-1 sm:flex-none"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Se connecter
              </>
            )}
          </button>
          <button 
            className="btn btn-ghost flex-1 sm:flex-none"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </button>
        </div>
      </div>
      
      {/* Backdrop */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default LoginRequiredModal;