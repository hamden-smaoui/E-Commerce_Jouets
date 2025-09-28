'use client';
import { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { Tag, Edit, Save, X, Upload, Trash2, MapPin, Phone, Mail, Globe, Clock, Facebook, Instagram, Youtube, Camera, Truck } from 'lucide-react';
import StoreInfoService, { StoreInfo, StoreInfoFormData } from '@/services/storeInfo-service';
import Image from 'next/image';
import Notification from '@/components/layout/Notification';
import KidsCornerLoader from '@/components/ui/KidsCornerLoader';
import { useSession } from "next-auth/react";

const StoreInfoPage: NextPage = () => {
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [formData, setFormData] = useState<StoreInfoFormData>({
    nom: '',
    adresse: '',
    ville: '',
    codePostal: '',
    pays: '',
    emailPrincipal: '',
    emailSecondaire: '',
    telephonePrincipal: '',
    telephoneSecondaire: '',
    heuresOuverture: '',
    latitude: 0,
    longitude: 0,
    logo1: '',
    logo2: '',
    descriptionHero: '',
    topDescription: '',
    urlFacebook: '',
    urlInstagram: '',
    urlTiktok: '',
    urlYoutube: '',
    heroImages: [],
    promotionImages: [],
    imagesToDelete: [],
    promotionImagesToDelete: [],
    imageRangs: {},
    promotionImageRangs: {},
    tauxTVA:19,
    fraisLivraison:7,
    seuilLivraisonGratuite:100,
    entrepriseSiret: '',
  });
   const { data: session, status } = useSession();
    const token = session?.customToken;
  // Ajout pour images promotion
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [newPromotionImages, setNewPromotionImages] = useState<File[]>([]);
  const [promotionImagesToDelete, setPromotionImagesToDelete] = useState<number[]>([]);
  const [logo1File, setLogo1File] = useState<File | undefined>(undefined);
  const [logo2File, setLogo2File] = useState<File | undefined>(undefined);

  useEffect(() => {
    loadStoreInfo();
  }, []);

  const loadStoreInfo = async () => {
    try {
      setIsLoading(true);
      const data = await StoreInfoService.getStoreInfo();
      setStoreInfo(data);
      setFormData({
        nom: data.nom || '',
        adresse: data.adresse || '',
        ville: data.ville || '',
        codePostal: data.codePostal || '',
        pays: data.pays || '',
        emailPrincipal: data.emailPrincipal || '',
        emailSecondaire: data.emailSecondaire || '',
        telephonePrincipal: data.telephonePrincipal || '',
        telephoneSecondaire: data.telephoneSecondaire || '',
        heuresOuverture: data.heuresOuverture || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        logo1: data.logo1 || '',
        logo2: data.logo2 || '',
        descriptionHero: data.descriptionHero || '',
        topDescription: data.topDescription || '',
        urlFacebook: data.urlFacebook || '',
        urlInstagram: data.urlInstagram || '',
        urlTiktok: data.urlTiktok || '',
        urlYoutube: data.urlYoutube || '',
        heroImages: [],
        promotionImages: [],
        imagesToDelete: [],
        promotionImagesToDelete: [],
        imageRangs: {},
        promotionImageRangs: {},
        tauxTVA: data.tauxTVA || 19,
        fraisLivraison: data.fraisLivraison || 7,
        seuilLivraisonGratuite: data.seuilLivraisonGratuite || 100,
        entrepriseSiret: data.entrepriseSiret || '',
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erreur lors du chargement'
      });
      setStoreInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // HERO
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImages(prev => [...prev, ...files]);
    }
  };

  // PROMOTION
  const handlePromotionImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewPromotionImages(prev => [...prev, ...files]);
    }
  };

  const handleLogoUpload = (logoType: 'logo1' | 'logo2', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (logoType === 'logo1') {
        setLogo1File(file);
      } else {
        setLogo2File(file);
      }
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };
  const removeNewPromotionImage = (index: number) => {
    setNewPromotionImages(prev => prev.filter((_, i) => i !== index));
  };

  const markImageForDeletion = (imageId: number) => {
    setImagesToDelete(prev => [...prev, imageId]);
  };
  const markPromotionImageForDeletion = (imageId: number) => {
    setPromotionImagesToDelete(prev => [...prev, imageId]);
  };

  const unmarkImageForDeletion = (imageId: number) => {
    setImagesToDelete(prev => prev.filter(id => id !== imageId));
  };
  const unmarkPromotionImageForDeletion = (imageId: number) => {
    setPromotionImagesToDelete(prev => prev.filter(id => id !== imageId));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      const submitData: StoreInfoFormData = {
        ...formData,
        heroImages: newImages,
        promotionImages: newPromotionImages,
        imagesToDelete: imagesToDelete,
        promotionImagesToDelete: promotionImagesToDelete,
        logo1File: logo1File,
        logo2File: logo2File,
      };

      let result: StoreInfo;
      if (storeInfo?.idStoreInfo) {
        result = await StoreInfoService.updateStoreInfo(storeInfo.idStoreInfo, submitData,token);
      } else {
        result = await StoreInfoService.createStoreInfo(submitData,token);
      }

      setStoreInfo(result);
      setIsEditing(false);
      setNewImages([]);
      setNewPromotionImages([]);
      setImagesToDelete([]);
      setPromotionImagesToDelete([]);
      setLogo1File(undefined);
      setLogo2File(undefined);
      setNotification({
        type: 'success',
        message: 'Informations sauvegardées avec succès !'
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erreur lors de la sauvegarde'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewImages([]);
    setNewPromotionImages([]);
    setImagesToDelete([]);
    setPromotionImagesToDelete([]);
    setLogo1File(undefined);
    setLogo2File(undefined);
    loadStoreInfo();
  };


if (isLoading && !storeInfo) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <KidsCornerLoader 
        message="Chargement des informations..."
        size="lg"
        showMessage={true}
      />
    </div>
  );
}

  return (
    <div className=" w-full h-screen flex flex-col relative bg-base-400">
      <div className="container mx-auto px-4 py-6 lg:px-6 xl:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-primary flex items-center gap-3">
              <Tag className="w-7 h-7 lg:w-8 lg:h-8" />
              Informations du Magasin
            </h1>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="btn btn-primary gap-2 w-full sm:w-auto"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </button>
            )}
            {isEditing && (
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={handleSave}
                  disabled={isLoading}
                  className="btn btn-success gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button 
                  onClick={handleCancel}
                  className="btn btn-outline gap-2"
                >
                  <X className="w-4 h-4" />
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="space-y-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* General Information */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl lg:text-2xl flex items-center gap-2 mb-6">
                  <MapPin className="w-5 h-5 lg:w-6 lg:h-6" />
                  Informations Générales
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Nom du magasin</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        value={formData.nom}
                        onChange={(e) => handleInputChange('nom', e.target.value)}
                        placeholder="Nom de votre magasin"
                      />
                    ) : (
                      <div className="p-3 bg-base-200 rounded-lg">
                        {storeInfo?.nom || 'Non défini'}
                      </div>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Adresse complète</span>
                    </label>
                    {isEditing ? (
                      <textarea
                        className="textarea textarea-bordered w-full"
                        value={formData.adresse}
                        onChange={(e) => handleInputChange('adresse', e.target.value)}
                        placeholder="Adresse complète du magasin"
                        rows={2}
                      />
                    ) : (
                      <div className="p-3 bg-base-200 rounded-lg">
                        {storeInfo?.adresse || 'Non défini'}
                      </div>
                    )}
                  </div></div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Ville</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={formData.ville}
                          onChange={(e) => handleInputChange('ville', e.target.value)}
                          placeholder="Ville"
                        />
                      ) : (
                        <div className="p-3 bg-base-200 rounded-lg">
                          {storeInfo?.ville || 'Non défini'}
                        </div>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Code postal</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={formData.codePostal}
                          onChange={(e) => handleInputChange('codePostal', e.target.value)}
                          placeholder="Code postal"
                        />
                      ) : (
                        <div className="p-3 bg-base-200 rounded-lg">
                          {storeInfo?.codePostal || 'Non défini'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Pays</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        value={formData.pays}
                        onChange={(e) => handleInputChange('pays', e.target.value)}
                        placeholder="Pays"
                      />
                    ) : (
                      <div className="p-3 bg-base-200 rounded-lg">
                        {storeInfo?.pays || 'Non défini'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl lg:text-2xl flex items-center gap-2 mb-6">
                  <Phone className="w-5 h-5 lg:w-6 lg:h-6" />
                  Contact & Communication
                </h2>
                
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email principal
                      </span>
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        className="input input-bordered w-full"
                        value={formData.emailPrincipal}
                        onChange={(e) => handleInputChange('emailPrincipal', e.target.value)}
                        placeholder="contact@monmagasin.com"
                      />
                    ) : (
                      <div className="p-3 bg-base-200 rounded-lg">
                        {storeInfo?.emailPrincipal || 'Non défini'}
                      </div>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Email secondaire</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        className="input input-bordered w-full"
                        value={formData.emailSecondaire}
                        onChange={(e) => handleInputChange('emailSecondaire', e.target.value)}
                        placeholder="info@monmagasin.com"
                      />
                    ) : (
                      <div className="p-3 bg-base-200 rounded-lg">
                        {storeInfo?.emailSecondaire || 'Non défini'}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Téléphone principal</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          className="input input-bordered w-full"
                          value={formData.telephonePrincipal}
                          onChange={(e) => handleInputChange('telephonePrincipal', e.target.value)}
                          placeholder="+33 1 23 45 67 89"
                        />
                      ) : (
                        <div className="p-3 bg-base-200 rounded-lg">
                          {storeInfo?.telephonePrincipal || 'Non défini'}
                        </div>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Téléphone secondaire</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          className="input input-bordered w-full"
                          value={formData.telephoneSecondaire}
                          onChange={(e) => handleInputChange('telephoneSecondaire', e.target.value)}
                          placeholder="+33 6 12 34 56 78"
                        />
                      ) : (
                        <div className="p-3 bg-base-200 rounded-lg">
                          {storeInfo?.telephoneSecondaire || 'Non défini'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Heures d'ouverture
                      </span>
                    </label>
                    {isEditing ? (
                      <textarea
                        className="textarea textarea-bordered w-full"
                        rows={3}
                        value={formData.heuresOuverture}
                        onChange={(e) => handleInputChange('heuresOuverture', e.target.value)}
                        placeholder="Lun-Ven: 9h-18h&#10;Sam: 10h-16h&#10;Dim: Fermé"
                      />
                    ) : (
                      <div className="p-3 bg-base-200 rounded-lg whitespace-pre-line">
                        {storeInfo?.heuresOuverture || 'Non défini'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Settings */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Business Information */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl lg:text-2xl flex items-center gap-2 mb-6">
                  <Tag className="w-5 h-5 lg:w-6 lg:h-6" />
                  Informations Commerciales
                </h2>
                
                <div className="space-y-4">
                 
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Taux TVA (%)</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          className="input input-bordered w-full"
                          value={formData.tauxTVA}
                          onChange={(e) => handleInputChange('tauxTVA', parseFloat(e.target.value) || 0)}
                          placeholder="19"
                        />
                      ) : (
                        <div className="p-3 bg-base-200 rounded-lg">
                          {storeInfo?.tauxTVA ? `${storeInfo.tauxTVA}%` : 'Non défini'}
                        </div>
                      )}
                    </div>
                     <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">SIRET</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        value={formData.entrepriseSiret}
                        onChange={(e) => handleInputChange('entrepriseSiret', e.target.value)}
                        placeholder="SIRET de votre entreprise"
                      />
                    ) : (
                      <div className="p-3 bg-base-200 rounded-lg">
                        {storeInfo?.entrepriseSiret || 'Non défini'}
                      </div>
                    )}
                  </div>
                    </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold flex items-center gap-2">
                          <Truck className="w-4 h-4" />
                          Frais de livraison 
                        </span>
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="input input-bordered w-full"
                          value={formData.fraisLivraison}
                          onChange={(e) => handleInputChange('fraisLivraison', parseFloat(e.target.value) || 0)}
                          placeholder="7.00"
                        />
                      ) : (
                        <div className="p-3 bg-base-200 rounded-lg">
                          {storeInfo?.fraisLivraison ? `${storeInfo.fraisLivraison}` : 'Non défini'}
                        </div>
                      )}
                    </div>
                     <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Seuil de la livraison gratuite</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1000"
                          className="input input-bordered w-full"
                          value={formData.seuilLivraisonGratuite}
                          onChange={(e) => handleInputChange('seuilLivraisonGratuite', parseFloat(e.target.value) || 100)}
                          placeholder="valeur minimale pour avoir la livraison gratuite"
                        />
                      ) : (
                        <div className="p-3 bg-base-200 rounded-lg">
                          {storeInfo?.seuilLivraisonGratuite ? `${storeInfo.seuilLivraisonGratuite}` : 'Non défini'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl lg:text-2xl flex items-center gap-2 mb-6">
                  <MapPin className="w-5 h-5 lg:w-6 lg:h-6" />
                  Géolocalisation
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Latitude</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        step="any"
                        className="input input-bordered w-full"
                        value={formData.latitude}
                        onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value) || 0)}
                        placeholder="48.8566"
                      />
                    ) : (
                      <div className="p-3 bg-base-200 rounded-lg">
                        {storeInfo?.latitude || 'Non défini'}
                      </div>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Longitude</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        step="any"
                        className="input input-bordered w-full"
                        value={formData.longitude}
                        onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value) || 0)}
                        placeholder="2.3522"
                      />
                    ) : (
                      <div className="p-3 bg-base-200 rounded-lg">
                        {storeInfo?.longitude || 'Non défini'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Branding & Description */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl lg:text-2xl mb-6">
                Description & Branding
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Description Hero</span>
                  </label>
                  {isEditing ? (
                    <textarea
                      className="textarea textarea-bordered w-full"
                      rows={4}
                      value={formData.descriptionHero}
                      onChange={(e) => handleInputChange('descriptionHero', e.target.value)}
                      placeholder="Description qui apparaît sur la page d'accueil de votre magasin..."
                    />
                  ) : (
                    <div className="p-3 bg-base-200 rounded-lg">
                      {storeInfo?.descriptionHero || 'Non défini'}
                    </div>
                  )}
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Description Top</span>
                  </label>
                  {isEditing ? (
                    <textarea
                      className="textarea textarea-bordered w-full"
                      rows={4}
                      value={formData.topDescription}
                      onChange={(e) => handleInputChange('topDescription', e.target.value)}
                      placeholder="Description qui apparaît en haut de la page d'accueil de votre magasin..."
                    />
                  ) : (
                    <div className="p-3 bg-base-200 rounded-lg">
                      {storeInfo?.topDescription || 'Non défini'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Logos */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl lg:text-2xl flex items-center gap-2 mb-6">
                <Camera className="w-5 h-5 lg:w-6 lg:h-6" />
                Logos du Magasin
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Logo 1 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Logo Principal</h3>
                  {(storeInfo?.logo1 || logo1File) && (
                    <div className="aspect-square w-32 h-32 relative rounded-lg overflow-hidden border-2 border-base-300">
                      <Image
                        src={logo1File ? URL.createObjectURL(logo1File) : `http://localhost:3001${storeInfo?.logo1}`}
                        alt="Logo principal"
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  )}
                  {isEditing && (
                    <div className="form-control">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload('logo1', e)}
                        className="file-input file-input-bordered file-input-primary w-full"
                      />
                      <div className="label">
                        <span className="label-text-alt">Format recommandé: PNG, JPG (carré)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Logo 2 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Logo Secondaire</h3>
                  {(storeInfo?.logo2 || logo2File) && (
                    <div className="aspect-square w-32 h-32 relative rounded-lg overflow-hidden border-2 border-base-300">
                      <Image
                        src={logo2File ? URL.createObjectURL(logo2File) : `http://localhost:3001${storeInfo?.logo2}`}
                        alt="Logo secondaire"
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  )}
                  {isEditing && (
                    <div className="form-control">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload('logo2', e)}
                        className="file-input file-input-bordered file-input-primary w-full"
                      />
                      <div className="label">
                        <span className="label-text-alt">Format recommandé: PNG, JPG (carré)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl lg:text-2xl flex items-center gap-2 mb-6">
                <Globe className="w-5 h-5 lg:w-6 lg:h-6" />
                Réseaux Sociaux
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </span>
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      className="input input-bordered w-full"
                      value={formData.urlFacebook}
                      onChange={(e) => handleInputChange('urlFacebook', e.target.value)}
                      placeholder="https://facebook.com/votrepage"
                    />
                  ) : (
                    <div className="p-3 bg-base-200 rounded-lg">
                      {storeInfo?.urlFacebook ? (
                        <a href={storeInfo.urlFacebook} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                          {storeInfo.urlFacebook}
                        </a>
                      ) : (
                        'Non défini'
                      )}
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </span>
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      className="input input-bordered w-full"
                      value={formData.urlInstagram}
                      onChange={(e) => handleInputChange('urlInstagram', e.target.value)}
                      placeholder="https://instagram.com/votrecompte"
                    />
                  ) : (
                    <div className="p-3 bg-base-200 rounded-lg">
                      {storeInfo?.urlInstagram ? (
                        <a href={storeInfo.urlInstagram} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                          {storeInfo.urlInstagram}
                        </a>
                      ) : (
                        'Non défini'
                      )}
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">TikTok</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      className="input input-bordered w-full"
                      value={formData.urlTiktok}
                      onChange={(e) => handleInputChange('urlTiktok', e.target.value)}
                      placeholder="https://tiktok.com/@votrecompte"
                    />
                  ) : (
                    <div className="p-3 bg-base-200 rounded-lg">
                      {storeInfo?.urlTiktok ? (
                        <a href={storeInfo.urlTiktok} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                          {storeInfo.urlTiktok}
                        </a>
                      ) : (
                        'Non défini'
                      )}
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <Youtube className="w-4 h-4" />
                      YouTube
                    </span>
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      className="input input-bordered w-full"
                      value={formData.urlYoutube}
                      onChange={(e) => handleInputChange('urlYoutube', e.target.value)}
                      placeholder="https://youtube.com/channel/votrechaine"
                    />
                  ) : (
                    <div className="p-3 bg-base-200 rounded-lg">
                      {storeInfo?.urlYoutube ? (
                        <a href={storeInfo.urlYoutube} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                          {storeInfo.urlYoutube}
                        </a>
                      ) : (
                        'Non défini'
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Hero Images Section */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl lg:text-2xl flex items-center gap-2 mb-6">
                <Upload className="w-5 h-5 lg:w-6 lg:h-6" />
                Images Hero de la Page d'Accueil
              </h2>
              
              {/* Existing Images */}
              {storeInfo?.heroImages && storeInfo.heroImages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Images actuelles</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {storeInfo.heroImages
                      .filter(img => !imagesToDelete.includes(img.idImage))
                      .map((image) => (
                      <div key={image.idImage} className="relative group">
                        <div className="aspect-video relative rounded-lg overflow-hidden bg-base-300">
                          <Image
                            src={`http://localhost:3001${image.url}`}
                            alt={`Hero image ${image.rang}`}
                            fill
                            className="object-cover"
                          />
                          {isEditing && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                onClick={() => markImageForDeletion(image.idImage)}
                                className="btn btn-error btn-sm gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Supprimer
                                </button>
                            </div>
                          )}
                        </div>
                        <div className="badge badge-primary mt-2">Rang: {image.rang}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Images marked for deletion */}
              {imagesToDelete.length > 0 && isEditing && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-error">Images à supprimer:</h3>
                  <div className="flex flex-wrap gap-3">
                    {imagesToDelete.map(imageId => {
                      const image = storeInfo?.heroImages?.find(img => img.idImage === imageId);
                      return image ? (
                        <div key={imageId} className="relative">
                          <div className="aspect-video w-24 relative rounded-lg overflow-hidden opacity-50 bg-base-300">
                            <Image
                              src={`http://localhost:3001${image.url}`}
                              alt={`To delete ${image.rang}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <button
                            onClick={() => unmarkImageForDeletion(imageId)}
                            className="absolute -top-2 -right-2 btn btn-xs btn-circle btn-primary"
                            title="Annuler la suppression"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* New Images */}
              {newImages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-success">Nouvelles images à ajouter:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {newImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video relative rounded-lg overflow-hidden bg-base-300">
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={`New image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <button
                              onClick={() => removeNewImage(index)}
                              className="btn btn-error btn-xs btn-circle"
                              title="Retirer cette image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="badge badge-success mt-2">Nouvelle image</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload new images */}
              {isEditing && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Ajouter des images hero</span>
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="file-input file-input-bordered file-input-primary w-full"
                  />
                  <div className="label">
                    <span className="label-text-alt">
                      Formats acceptés: JPG, PNG, WebP. Taille recommandée: 1920x1080px ou ratio 16:9
                    </span>
                  </div>
                </div>
              )}

              {/* Info message when no images */}
              {(!storeInfo?.heroImages || storeInfo.heroImages.length === 0) && newImages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-base-300 flex items-center justify-center">
                    <Upload className="w-12 h-12 text-base-content opacity-50" />
                  </div>
                  <p className="text-base-content opacity-70">
                    {isEditing ? 
                      "Ajoutez des images hero pour personnaliser votre page d'accueil" : 
                      "Aucune image hero configurée"
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
           {/* Promotion Images Section */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-xl lg:text-2xl flex items-center gap-2 mb-6">
              <Upload className="w-5 h-5 lg:w-6 lg:h-6" />
              Images Promotionnelles
            </h2>
            {/* Existing Promotion Images */}
            {storeInfo?.promotionImages && storeInfo.promotionImages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Images promotionnelles actuelles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {storeInfo.promotionImages
                    .filter(img => !promotionImagesToDelete.includes(img.idImage))
                    .map((image) => (
                    <div key={image.idImage} className="relative group">
                      <div className="aspect-video relative rounded-lg overflow-hidden bg-base-300">
                        <Image
                          src={`http://localhost:3001${image.url}`}
                          alt={`Promotion image ${image.rang}`}
                          fill
                          className="object-cover"
                        />
                        {isEditing && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              onClick={() => markPromotionImageForDeletion(image.idImage)}
                              className="btn btn-error btn-sm gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="badge badge-primary mt-2">Rang: {image.rang}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Promotion Images marked for deletion */}
            {promotionImagesToDelete.length > 0 && isEditing && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-error">Images à supprimer:</h3>
                <div className="flex flex-wrap gap-3">
                  {promotionImagesToDelete.map(imageId => {
                    const image = storeInfo?.promotionImages?.find(img => img.idImage === imageId);
                    return image ? (
                      <div key={imageId} className="relative">
                        <div className="aspect-video w-24 relative rounded-lg overflow-hidden opacity-50 bg-base-300">
                          <Image
                            src={`http://localhost:3001${image.url}`}
                            alt={`Promotion to delete ${image.rang}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          onClick={() => unmarkPromotionImageForDeletion(imageId)}
                          className="absolute -top-2 -right-2 btn btn-xs btn-circle btn-primary"
                          title="Annuler la suppression"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* New Promotion Images */}
            {newPromotionImages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-success">Nouvelles images promotion à ajouter:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {newPromotionImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video relative rounded-lg overflow-hidden bg-base-300">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`New promo image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={() => removeNewPromotionImage(index)}
                            className="btn btn-error btn-xs btn-circle"
                            title="Retirer cette image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="badge badge-success mt-2">Nouvelle image</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload new promotion images */}
            {isEditing && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Ajouter des images promotion</span>
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePromotionImageUpload}
                  className="file-input file-input-bordered file-input-primary w-full"
                />
                <div className="label">
                  <span className="label-text-alt">
                    Formats acceptés: JPG, PNG, WebP. Taille recommandée: 1920x1080px ou ratio 16:9
                  </span>
                </div>
              </div>
            )}

            {/* Info message when no promo images */}
            {(!storeInfo?.promotionImages || storeInfo.promotionImages.length === 0) && newPromotionImages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-base-300 flex items-center justify-center">
                  <Upload className="w-12 h-12 text-base-content opacity-50" />
                </div>
                <p className="text-base-content opacity-70">
                  {isEditing ? 
                    "Ajoutez des images promotion pour personnaliser votre page d'accueil" : 
                    "Aucune image promotion configurée"
                  }
                </p>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Fixed action buttons for mobile */}
        {isEditing && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 lg:hidden">
            <div className="flex gap-2 bg-base-100 p-3 rounded-full shadow-xl border">
              <button 
                onClick={handleSave}
                disabled={isLoading}
                className="btn btn-success btn-sm gap-2"
              >
                <Save className="w-4 h-4" />
                {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button 
                onClick={handleCancel}
                className="btn btn-outline btn-sm gap-2"
              >
                <X className="w-4 h-4" />
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notification Component */}
      <Notification
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
};

export default StoreInfoPage;