"use client";
import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import AvisService, { Avis, AvisStatistiques } from '@/services/avis-service';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';

// Add ConfirmDeleteModal component
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
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
          Êtes-vous sûr de vouloir supprimer votre avis ?
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

const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = {
    année: 31536000,
    mois: 2592000,
    semaine: 604800,
    jour: 86400,
    heure: 3600,
    minute: 60
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return interval === 1 ? `il y a 1 ${unit}` : `il y a ${interval} ${unit}s`;
    }
  }

  return 'à l\'instant';
};

interface AvisComponentProps {
  idProduit: number;
}

const StarRating = ({ rating, size = 'md', interactive = false, onRatingChange }: {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => handleStarClick(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <svg
            className={`${sizeClasses[size]} ${
              star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'
            } fill-current`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

const ProgressBar = ({ value, max, className = "" }: { value: number; max: number; className?: string }) => (
  <div className={`bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
      style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
    />
  </div>
);

export default function AvisComponent({ idProduit }: AvisComponentProps) {
  const { data: session, status } = useSession();
  const user = session?.userData;
  const token = session?.customToken;
  const isAuthenticated = status === "authenticated";
  const [avis, setAvis] = useState<Avis[]>([]);
  const [statistiques, setStatistiques] = useState<AvisStatistiques | null>(null);
  const [monAvis, setMonAvis] = useState<Avis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idProduit, isAuthenticated, token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [avisData, statsData] = await Promise.all([
        AvisService.getAvisByProduit(idProduit),
        AvisService.getAvisStatistiques(idProduit)
      ]);
      setAvis(avisData);
      setStatistiques(statsData);

      if (isAuthenticated && token) {
        try {
          const monAvisData = await AvisService.getMonAvis(idProduit, token);
          setMonAvis(monAvisData);
          if (monAvisData) {
            setSelectedRating(monAvisData.note);
          }
        } catch (error) {
          setMonAvis(null);
        }
      }
    } catch (err) {
      setError('Erreur lors du chargement des avis');
      toast.error('Erreur lors du chargement des avis');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAvis = async () => {
    if (!selectedRating || !isAuthenticated || !token) return;

    try {
      setSubmitting(true);
      const newAvis = await AvisService.createOrUpdateAvis({
        idProduit,
        note: selectedRating
      }, token);

      setMonAvis(newAvis);
      setShowForm(false);
      toast.success(monAvis ? 'Avis modifié avec succès' : 'Avis ajouté avec succès');
      await fetchData();
    } catch (err) {
      toast.error('Erreur lors de l\'envoi de votre avis');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAvis = async () => {
    if (!monAvis || !isAuthenticated || !token) return;

    try {
      await AvisService.deleteAvis(monAvis.idAvis, token);
      setMonAvis(null);
      setSelectedRating(0);
      setShowDeleteModal(false);
      toast.success('Avis supprimé avec succès');
      await fetchData();
    } catch (err) {
      toast.error('Erreur lors de la suppression de votre avis');
    }
  };

  const isMyAvis = (avisItem: Avis) => {
    return user && avisItem.idUtilisateur === user.idUtilisateur;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6 border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6 border border-gray-200">
        <div className="space-y-6">
          {/* Header avec statistiques */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              Avis clients ({statistiques?.totalAvis || 0})
            </h3>
            
            {statistiques && statistiques.totalAvis > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-3xl lg:text-4xl font-bold text-gray-900">
                      {statistiques.moyenneNote}
                    </div>
                    <StarRating rating={Math.round(parseFloat(statistiques.moyenneNote.toString()))} size="lg" />
                    <div className="text-sm text-gray-600 mt-1">
                      sur {statistiques.totalAvis} avis
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2 text-sm">
                      <span className="w-8 text-right">{rating}</span>
                      <svg className="w-4 h-4 text-yellow-400 fill-current">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <ProgressBar 
                        value={statistiques.repartition[rating as keyof typeof statistiques.repartition]} 
                        max={statistiques.totalAvis} 
                        className="flex-1"
                      />
                      <span className="w-8 text-gray-600">
                        {statistiques.repartition[rating as keyof typeof statistiques.repartition]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Formulaire d'avis */}
          {isAuthenticated && (
            <div className="border-b border-gray-200 pb-6">
              {monAvis ? (
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Votre note :</p>
                      <StarRating rating={monAvis.note} size="md" />
                    </div>
                    <div className="flex space-x-2 ml-auto">
                      <button
                        onClick={() => setShowForm(true)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="Modifier"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        title="Supprimer"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                !showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Donner mon avis</span>
                  </button>
                )
              )}

              {showForm && (
                <div className="bg-gray-50 rounded-xl p-4 lg:p-6 space-y-4">
                  <h4 className="font-semibold text-gray-900">
                    {monAvis ? 'Modifier votre avis' : 'Donnez votre avis'}
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note (obligatoire)
                    </label>
                    <StarRating 
                      rating={selectedRating} 
                      size="lg" 
                      interactive 
                      onRatingChange={setSelectedRating}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={handleSubmitAvis}
                      disabled={!selectedRating || submitting}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {submitting ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        monAvis ? 'Mettre à jour' : 'Publier'
                      )}
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

         {!isAuthenticated && (
            <div className="border-b border-gray-200 pb-6">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-gray-600 mb-3">
                  Connectez-vous pour donner votre avis sur ce produit
                </p>
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => window.location.href = "/signIn"}
                >
                  Se connecter
                </button>
              </div>
            </div>
          )}

          {/* Liste des avis avec scroll */}
          {avis.length > 0 ? (
            <div className={`space-y-4 ${avis.length > 3 ? 'max-h-96 overflow-y-auto pr-2' : ''}`}>
              {avis.map((avisItem) => (
                <div key={avisItem.idAvis} className="border border-gray-200 rounded-xl p-4 lg:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {isMyAvis(avisItem) ? 'Moi' : `${avisItem.utilisateur.prenom} ${avisItem.utilisateur.nom}`}
                        </span>
                        <StarRating rating={avisItem.note} size="sm" />
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatTimeAgo(avisItem.createdAt)}
                      </p>
                    </div>
                    {isMyAvis(avisItem) && (
                      <div className="flex space-x-1 ml-auto">
                        <button
                          onClick={() => {
                            setSelectedRating(avisItem.note);
                            setShowForm(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Aucun avis pour ce produit</p>
              {isAuthenticated && (
                <p className="text-sm text-gray-500 mt-2">
                  Soyez le premier à donner votre avis !
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAvis}
      />
    </>
  );
}