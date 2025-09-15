"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import CommentaireService, { Commentaire, CommentairePagination } from '@/services/commentaires-service';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';

// ConfirmDeleteModal component
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
          Êtes-vous sûr de vouloir supprimer ce commentaire ?
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

// Helper function to format time ago
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

interface CommentaireComponentProps {
  idProduit: number;
}

export default function CommentaireComponent({ idProduit }: CommentaireComponentProps) {
  const { user, isAuthenticated } = useAuth();
  const [commentaires, setCommentaires] = useState<Commentaire[]>([]);
  const [pagination, setPagination] = useState<CommentairePagination['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchCommentaires(1, true);
  }, [idProduit]);

  const fetchCommentaires = async (page: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCurrentPage(1);
      } else {
        setLoadingMore(true);
      }
      
      const data = await CommentaireService.getCommentairesByProduit(idProduit, page, 5);
      
      if (reset) {
        setCommentaires(data.data);
        setCurrentPage(1);
      } else {
        setCommentaires(prev => [...prev, ...data.data]);
      }
      
      setPagination(data.pagination);
    } catch (err) {
      setError('Erreur lors du chargement des commentaires');
      toast.error('Erreur lors du chargement des commentaires');
      console.error('Error fetching commentaires:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination && pagination.hasNext) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchCommentaires(nextPage, false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !isAuthenticated) return;

    try {
      setSubmitting(true);
      const nouveauCommentaire = await CommentaireService.createCommentaire({
        idProduit,
        contenu: newComment.trim()
      });
      
      setCommentaires(prev => [nouveauCommentaire, ...prev]);
      setNewComment('');
      setShowForm(false);
      toast.success('Commentaire ajouté avec succès');
      
      if (pagination) {
        setPagination(prev => prev ? { ...prev, totalItems: prev.totalItems + 1 } : null);
      }
    } catch (err) {
      toast.error('Erreur lors de l\'envoi du commentaire');
      console.error('Error submitting commentaire:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (id: number) => {
    if (!editContent.trim() || !isAuthenticated) return;

    try {
      const updatedCommentaire = await CommentaireService.updateCommentaire(id, {
        contenu: editContent.trim()
      });
      
      setCommentaires(prev => 
        prev.map(comment => 
          comment.idCommentaire === id ? updatedCommentaire : comment
        )
      );
      
      setEditingId(null);
      setEditContent('');
      toast.success('Commentaire modifié avec succès');
    } catch (err) {
      toast.error('Erreur lors de la modification du commentaire');
      console.error('Error updating commentaire:', err);
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete || !isAuthenticated) return;

    try {
      await CommentaireService.deleteCommentaire(commentToDelete);
      setCommentaires(prev => prev.filter(comment => comment.idCommentaire !== commentToDelete));
      setShowDeleteModal(false);
      setCommentToDelete(null);
      toast.success('Commentaire supprimé avec succès');
      
      if (pagination) {
        setPagination(prev => prev ? { ...prev, totalItems: prev.totalItems - 1 } : null);
      }
    } catch (err) {
      toast.error('Erreur lors de la suppression du commentaire');
      console.error('Error deleting commentaire:', err);
    }
  };

  const startEditing = (commentaire: Commentaire) => {
    setEditingId(commentaire.idCommentaire);
    setEditContent(commentaire.contenu);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent('');
  };

  const isMyComment = (commentaire: Commentaire) => {
    return user && commentaire.idUtilisateur === user.idUtilisateur;
  };

  const openDeleteModal = (id: number) => {
    setCommentToDelete(id);
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6 border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6 border border-gray-200">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
              Commentaires ({pagination?.totalItems || 0})
            </h3>
            
            {isAuthenticated ? (
              <button
                onClick={() => setShowForm(!showForm)}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transition-all duration-200 font-medium"
              >
                <PlusIcon className="w-4 h-4" />
                <span>{showForm ? 'Annuler' : 'Ajouter'}</span>
              </button>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-gray-600 mb-3">
                  Connectez-vous pour ajouter un commentaire
                </p>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Se connecter
                </button>
              </div>
            )}
          </div>

          {showForm && isAuthenticated && (
            <div className="bg-gray-50 rounded-xl p-4 lg:p-6 space-y-4">
              <h4 className="font-semibold text-gray-900">Nouveau commentaire</h4>
              
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Partagez votre expérience avec ce produit..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={500}
              />
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <span className="text-sm text-gray-500">
                  {newComment.length}/500 caractères
                </span>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {submitting ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>Publier</span>
                      </>
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
            </div>
          )}

          {/* Liste des commentaires avec scroll */}
          {commentaires.length > 0 ? (
            <div className={`space-y-4 ${commentaires.length > 3 ? 'max-h-96 overflow-y-auto pr-2' : ''}`}>
              {commentaires.map((commentaire) => (
                <div key={commentaire.idCommentaire} className="border border-gray-200 rounded-xl p-4 lg:p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {isMyComment(commentaire) ? 'M' : `${commentaire.utilisateur.prenom[0]}${commentaire.utilisateur.nom[0]}`}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">
                            {isMyComment(commentaire) ? 'Moi' : `${commentaire.utilisateur.prenom} ${commentaire.utilisateur.nom}`}
                          </h5>
                          <p className="text-sm text-gray-500">
                            {formatTimeAgo(commentaire.createdAt)}
                          </p>
                        </div>
                        
                        {isMyComment(commentaire) && (
                          <div className="flex space-x-1 ml-auto">
                            <button
                              onClick={() => startEditing(commentaire)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(commentaire.idCommentaire)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {editingId === commentaire.idCommentaire ? (
                        <div className="space-y-3">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={3}
                            maxLength={500}
                          />
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <span className="text-sm text-gray-500">
                              {editContent.length}/500 caractères
                            </span>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditComment(commentaire.idCommentaire)}
                                disabled={!editContent.trim()}
                                className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                              >
                                Sauvegarder
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-700 leading-relaxed break-words">
                          {commentaire.contenu}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {pagination && pagination.hasNext && (
                <div className="text-center pt-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200 flex items-center space-x-2 mx-auto"
                  >
                    {loadingMore ? (
                      <div className="animate-spin h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full"></div>
                    ) : (
                      <>
                        <span>Charger plus</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-2">Aucun commentaire pour ce produit</p>
              {isAuthenticated && (
                <p className="text-sm text-gray-500">
                  Soyez le premier à partager votre expérience !
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCommentToDelete(null);
        }}
        onConfirm={handleDeleteComment}
      />
    </>
  );
}