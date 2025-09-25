"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import CommandesService, { CommandeResponse } from '@/services/commandes-service';
import UsersService, { User, FormData } from '@/services/users-service';
import NewsletterService from '@/services/newsletter-service';
import KidsCornerLoader from '@/components/ui/KidsCornerLoader';
import { toast } from 'react-hot-toast';

import {
  UserCircleIcon,
  PencilIcon,
  ShoppingBagIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  EnvelopeOpenIcon as MailIcon
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'orders' ? 'orders' : 'profile';
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>(initialTab);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<CommandeResponse[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<CommandeResponse[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileData, setProfileData] = useState<FormData>({
    idUtilisateur: null,
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    adresseRue: '',
    adresseVille: '',
    adresseCodePostal: '',
    adressePays: 'Tunisie',
    role: 'client',
  });

  // Newsletter state
  const [newsletterStatus, setNewsletterStatus] = useState<'unknown' | 'subscribed' | 'not_subscribed' | 'loading'>('unknown');
  const [newsletterEmail, setNewsletterEmail] = useState(user?.email || '');
  const [newsletterMsg, setNewsletterMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        idUtilisateur: user.idUtilisateur,
        prenom: user.prenom || '',
        nom: user.nom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        adresseRue: user.adresseRue || '',
        adresseVille: user.adresseVille || '',
        adresseCodePostal: user.adresseCodePostal || '',
        adressePays: user.adressePays || 'Tunisie',
        role: user.role || 'client',
      });
      setNewsletterEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'orders' && user?.idUtilisateur) {
      fetchUserOrders();
    }
  }, [activeTab, user]);

  useEffect(() => {
    const filtered = orders.filter((order) => {
      const searchLower = searchQuery.toLowerCase();
      const orderIdMatch = order.idCommande.toString().includes(searchLower);
      const productMatch = order.lignesCommandes?.some((item) =>
        item.produit?.nom.toLowerCase().includes(searchLower)
      );
      return orderIdMatch || productMatch;
    });
    setFilteredOrders(filtered.slice(0, 5));
  }, [searchQuery, orders]);

  // Newsletter effect
  useEffect(() => {
    const checkNewsletter = async () => {
      if (!user?.email) {
        setNewsletterStatus('not_subscribed');
        return;
      }
      try {
        setNewsletterStatus('loading');
        const all = await NewsletterService.getAllEntries();
        const found = all.some(entry => entry.email === user.email);
        setNewsletterStatus(found ? 'subscribed' : 'not_subscribed');
      } catch {
        setNewsletterStatus('not_subscribed');
      }
    };
    checkNewsletter();
  }, [user]);

  const fetchUserOrders = async () => {
    if (!user?.idUtilisateur) return;

    try {
      setOrdersLoading(true);
      const userOrders = await CommandesService.getCommandesByClient(user.idUtilisateur);
      setOrders(userOrders);
      setFilteredOrders(userOrders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.idUtilisateur) return;

    try {
      setLoading(true);
      const updatedUser = await UsersService.updateUser(user.idUtilisateur, profileData);

      await updateUser({
        prenom: profileData.prenom,
        nom: profileData.nom,
        email: profileData.email,
        telephone: profileData.telephone,
        adresseRue: profileData.adresseRue,
        adresseVille: profileData.adresseVille,
        adresseCodePostal: profileData.adresseCodePostal,
        adressePays: profileData.adressePays,
      });

      setIsEditing(false);
      toast.success('Profil mis à jour avec succès!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setProfileData({
        idUtilisateur: user.idUtilisateur,
        prenom: user.prenom || '',
        nom: user.nom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        adresseRue: user.adresseRue || '',
        adresseVille: user.adresseVille || '',
        adresseCodePostal: user.adresseCodePostal || '',
        adressePays: user.adressePays || 'Tunisie',
        role: user.role || 'client',
      });
    }
    setIsEditing(false);
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      const updatedOrder = await CommandesService.updateCommande(orderId, { statut: 'annulée' });
      setOrders(orders.map((order) =>
        order.idCommande === orderId ? { ...order, statut: updatedOrder.statut } : order
      ));
      setFilteredOrders(filteredOrders.map((order) =>
        order.idCommande === orderId ? { ...order, statut: updatedOrder.statut } : order
      ));
      toast.success('Commande annulée avec succès!');
    } catch (error) {
      console.error('Error canceling order:', error);
      toast.error('Erreur lors de l\'annulation de la commande');
    }
  };

  // Newsletter subscribe/unsubscribe
  const handleNewsletterSubscribe = async () => {
    setNewsletterMsg(null);
    try {
      setNewsletterStatus('loading');
      await NewsletterService.subscribe({ email: newsletterEmail });
      setNewsletterStatus('subscribed');
      setNewsletterMsg("Vous êtes maintenant abonné à la newsletter !");
    } catch (e: any) {
      setNewsletterStatus('not_subscribed');
      setNewsletterMsg(e.message || "Erreur lors de l'inscription.");
    }
  };

  const handleNewsletterUnsubscribe = async () => {
    setNewsletterMsg(null);
    try {
      setNewsletterStatus('loading');
      await NewsletterService.unsubscribe(newsletterEmail);
      setNewsletterStatus('not_subscribed');
      setNewsletterMsg("Vous avez été désinscrit de la newsletter.");
    } catch (e: any) {
      setNewsletterStatus('subscribed');
      setNewsletterMsg(e.message || "Erreur lors de la désinscription.");
    }
  };

  const isRecentOrder = (createdAt: string) => {
    const orderDate = new Date(createdAt);
    const now = new Date();
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    return now.getTime() - orderDate.getTime() < twoHoursInMs;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'en attente':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'en traitement':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'expédiée':
        return <TruckIcon className="h-5 w-5 text-purple-500" />;
      case 'livrée':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'annulée':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'en attente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'en traitement': 'bg-blue-100 text-blue-800 border-blue-200',
      'expédiée': 'bg-purple-100 text-purple-800 border-purple-200',
      'livrée': 'bg-green-100 text-green-800 border-green-200',
      'annulée': 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} TND`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès non autorisé</h2>
          <p className="text-gray-600">Vous devez être connecté pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg mb-6">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-purple-600">
                  {user.prenom?.[0]}{user.nom?.[0]}
                </span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {user.prenom} {user.nom}
                </h1>
                <p className="text-sm text-gray-500">{user.email || user.telephone}</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-4 sm:px-6">
            <nav className="flex space-x-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-3 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === 'profile'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-purple-600 hover:border-purple-300'
                }`}
              >
                <UserCircleIcon className="h-5 w-5" />
                <span>Informations personnelles</span>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-3 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === 'orders'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-purple-600 hover:border-purple-300'
                }`}
              >
                <ShoppingBagIcon className="h-5 w-5" />
                <span>Mes commandes</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'profile' ? (
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Informations personnelles
              </h2>
              <button
                onClick={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
                className="btn btn-outline btn-sm flex items-center space-x-2 text-gray-600 hover:text-purple-600 hover:border-purple-300"
              >
                <PencilIcon className="h-4 w-4" />
                <span>{isEditing ? 'Annuler' : 'Modifier'}</span>
              </button>
            </div>

            <div className="px-4 sm:px-6 py-6">
              {isEditing ? (
                <form onSubmit={handleSaveProfile}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        value={profileData.prenom}
                        onChange={(e) => setProfileData({ ...profileData, prenom: e.target.value })}
                        className="input input-bordered w-full text-sm focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={profileData.nom}
                        onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })}
                        className="input input-bordered w-full text-sm focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileData.email || ''}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="input input-bordered w-full text-sm focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        value={profileData.telephone}
                        onChange={(e => setProfileData({ ...profileData, telephone: e.target.value }))}
                        className="input input-bordered w-full text-sm focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse
                      </label>
                      <input
                        type="text"
                        value={profileData.adresseRue || ''}
                        onChange={(e) => setProfileData({ ...profileData, adresseRue: e.target.value })}
                        className="input input-bordered w-full text-sm focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Rue et numéro"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville
                      </label>
                      <input
                        type="text"
                        value={profileData.adresseVille || ''}
                        onChange={(e) => setProfileData({ ...profileData, adresseVille: e.target.value })}
                        className="input input-bordered w-full text-sm focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Code postal
                      </label>
                      <input
                        type="text"
                        value={profileData.adresseCodePostal || ''}
                        onChange={(e) => setProfileData({ ...profileData, adresseCodePostal: e.target.value })}
                        className="input input-bordered w-full text-sm focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pays
                      </label>
                      <input
                        type="text"
                        value={profileData.adressePays || ''}
                        onChange={(e) => setProfileData({ ...profileData, adressePays: e.target.value })}
                        className="input input-bordered w-full text-sm focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="btn btn-ghost text-sm text-gray-600 hover:bg-gray-100"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary text-sm bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <KidsCornerLoader
                          message="Sauvegarde en cours..."
                          size="sm"
                          showMessage={true}
                        />
                      ) : (
                        'Sauvegarder'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="flex items-center space-x-3">
                      <UserCircleIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Nom complet</p>
                        <p className="font-medium text-sm sm:text-base text-gray-900">{profileData.prenom} {profileData.nom}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-sm sm:text-base text-gray-900">{profileData.email || 'Non renseigné'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Téléphone</p>
                        <p className="font-medium text-sm sm:text-base text-gray-900">{profileData.telephone}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <MapPinIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Adresse</p>
                        <p className="font-medium text-sm sm:text-base text-gray-900">
                          {profileData.adresseRue ? (
                            <>
                              {profileData.adresseRue}<br />
                              {profileData.adresseVille && `${profileData.adresseVille}, `}
                              {profileData.adresseCodePostal}<br />
                              {profileData.adressePays}
                            </>
                          ) : (
                            'Non renseignée'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SECTION NEWSLETTER */}
                  <div className="mt-10 border-t border-gray-100 pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <MailIcon className="h-6 w-6 text-blue-400" />
                      <h3 className="text-md font-bold text-gray-900">Abonnement à la Newsletter</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      Soyez notifié des nouvelles offres, promos et événements. Recevez toutes les nouveautés par email !
                    </p>
                    {newsletterStatus === 'unknown' || newsletterStatus === 'loading' ? (
                      <div className="text-gray-400 text-sm">Chargement…</div>
                    ) : newsletterStatus === 'subscribed' ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                          <CheckCircleIcon className="h-5 w-5" /> Vous êtes abonné(e) à la newsletter.
                        </span>
                        <button
                          className="btn btn-sm btn-outline btn-error"
                          onClick={handleNewsletterUnsubscribe}
                        >
                          <XCircleIcon className="h-4 w-4 mr-1" /> Se désinscrire
                        </button>
                      </div>
                    ) : (
                      <form
                        className="flex flex-col sm:flex-row gap-2 w-full max-w-md"
                        onSubmit={e => {
                          e.preventDefault();
                          handleNewsletterSubscribe();
                        }}
                      >
                        <input
                          type="email"
                          className="input input-bordered w-full"
                          placeholder="Votre email"
                          value={newsletterEmail}
                          onChange={e => setNewsletterEmail(e.target.value)}
                          required
                          
                        />
                        <button
                          type="submit"
                          className="btn btn-primary"
                          
                        >
                          S'abonner
                        </button>
                      </form>
                    )}
                    {newsletterMsg && (
                      <div className={`mt-2 text-sm ${
                        newsletterMsg.includes('désinscrit') ? 'text-orange-500' :
                        newsletterMsg.includes('abonné') ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {newsletterMsg}
                      </div>
                    )}
                  </div>
                  {/* END SECTION NEWSLETTER */}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-2">
                <ShoppingBagIcon className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Mes commandes</h2>
              </div>
              <div className="relative w-full sm:w-64">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher"
                  className="input input-bordered w-full pl-10 text-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <div className="px-4 sm:px-6 py-6">
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <KidsCornerLoader
                    message="Chargement des commandes..."
                    size="lg"
                    showMessage={true}
                  />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBagIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-sm sm:text-base font-medium">
                    {searchQuery ? 'Aucune commande ne correspond à votre recherche' : 'Vous n\'avez pas encore passé de commande'}
                  </p>
                  {!searchQuery && (
                    <p className="text-gray-500 text-sm mt-2">Découvrez nos produits et passez votre première commande!</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.idCommande}
                      className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <span className="font-semibold text-gray-900 text-sm sm:text-base">
                            Commande #{order.idCommande}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.statut)}`}>
                              {getStatusIcon(order.statut)}
                              <span className="ml-1 capitalize">{order.statut}</span>
                            </div>
                            {isRecentOrder(order.createdAt) && order.statut !== 'annulée' && (
                              <button
                                onClick={() => handleCancelOrder(order.idCommande)}
                                className="btn btn-sm bg-red-500 hover:bg-red-600 text-white border-none flex items-center space-x-1 px-3 py-1"
                              >
                                <XMarkIcon className="h-4 w-4" />
                                <span className="text-xs">Annuler</span>
                              </button>
                            )}
                            <a
                              href={`/site/confirmCmd/${order.idCommande}`}
                              className="btn btn-xs bg-purple-600 hover:bg-purple-700 text-white border-none flex items-center space-x-1 px-2 py-1 ml-2"
                              title="Voir détails de la commande"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </a>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-600 text-sm sm:text-base">{formatPrice(order.montantTotal)}</p>
                          <p className="text-xs sm:text-sm text-gray-500 flex items-center justify-end">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {formatDate(order.dateCommande)}
                          </p>
                        </div>
                      </div>

                      {order.lignesCommandes && order.lignesCommandes.length > 0 && (
                        <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                          {order.lignesCommandes.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              {item.produit?.images && item.produit.images.length > 0 && (
                                <img
                                  src={`http://localhost:3001${item.produit.images.sort((a, b) => a.rang - b.rang)[0].url}`}
                                  alt={item.produit.nom}
                                  className="h-12 w-12 sm:h-14 sm:w-14 object-cover rounded-lg border border-gray-100"
                                />
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {item.produit?.nom || 'Produit non disponible'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Quantité: {item.quantite} × {formatPrice(item.prixUnitaire)}
                                </p>
                              </div>
                              <p className="text-sm font-medium text-gray-900">
                                {formatPrice(item.sousTotal)}
                              </p>
                            </div>
                          ))}

                          {order.lignesCommandes.length > 3 && (
                            <p className="text-xs text-gray-500 text-center pt-2">
                              +{order.lignesCommandes.length - 3} autre(s) article(s)
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}