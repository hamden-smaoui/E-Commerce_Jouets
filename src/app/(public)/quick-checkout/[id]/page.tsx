"use client";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import Footer from "@/components/ui/Footer";
import { usePromotions } from "@/hooks/usePromotion";
import PromotionBadge from "@/components/ui/PromotionBadge";
import ProduitsService, { ProduitResponse, ImageData, ProduitVariation } from "@/services/produits-service";
import CommandesService from "@/services/commandes-service";
import KidsCornerLoader from '@/components/ui/KidsCornerLoader';
import { toast } from "react-hot-toast";
import CodePromoInput from "@/components/layout/CodePromo";
import AvisComponent from '@/components/ui/avis';
import CommentaireComponent from '@/components/ui/commentaireSection';
import * as fbq from "@/lib/fpixel";
import { 
  ShoppingBagIcon,
  TruckIcon,
  ShieldCheckIcon,
  MinusIcon,
  SparklesIcon,
  PlusIcon,
} from '@heroicons/react/24/solid';
import Link from 'next/link';

interface Product {
  idProduit: number;
  nom: string;
  prix: number;
  description: string;
  quantiteStock: number;
  marque?: { idMarque: number; nom: string };
  categorie?: { idCategorie: number; nom: string };
  images?: ImageData[];
  type?: { idType: number; nom: string };
  genre?: 'fille' | 'garçon' | 'enfant' | null;
  variations?: ProduitVariation[];
  livraisonGratuite?: boolean;
}

interface FormData {
  clientPrenom: string;
  clientNom: string;
  clientEmail: string;
  clientTelephone: string;
  clientAdresseRue: string;
  clientAdresseVille: string;
  clientAdresseCodePostal: string;
  clientAdressePays: string;
  notesLivraison: string;
}

interface FormErrors {
  [key: string]: boolean;
}

export default function QuickCheckout() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [produit, setProduit] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("/images/placeholder.jpg");
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [pixelTracked, setPixelTracked] = useState(false);
  const [activeTab, setActiveTab] = useState<'avis' | 'commentaires'>('avis');

  // Variations
  const [selectedVariation, setSelectedVariation] = useState<ProduitVariation | null>(null);
  const [selectedCouleur, setSelectedCouleur] = useState<number | null>(null);
  const [selectedTaille, setSelectedTaille] = useState<number | null>(null);
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const [availableVariations, setAvailableVariations] = useState<ProduitVariation[]>([]);

  // Code promo
  const [codePromo, setCodePromo] = useState<{ code: string; valeurPourcentage: number } | null>(null);

  // Form
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    clientPrenom: '',
    clientNom: '',
    clientEmail: '',
    clientTelephone: '',
    clientAdresseRue: '',
    clientAdresseVille: '',
    clientAdresseCodePostal: '',
    clientAdressePays: 'Tunisie',
    notesLivraison: ''
  });

  const { promotions, calculatePriceWithPromotion, hasPromotions } = usePromotions(produit?.idProduit || 0);
  const priceData = produit ? calculatePriceWithPromotion(produit.prix) : null;

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await ProduitsService.getProduitById(parseInt(id as string));
        const updatedProduct: Product = {
          ...productData,
          images: productData.images || [],
        };
        setProduit(updatedProduct);

        if (updatedProduct.variations && updatedProduct.variations.length > 0) {
          setAvailableVariations(updatedProduct.variations);

          const uniqueCouleurs = Array.from(new Set(updatedProduct.variations.map(v => v.idCouleur).filter(Boolean)));
          const uniqueTailles = Array.from(new Set(updatedProduct.variations.map(v => v.idTaille).filter(Boolean)));
          const uniqueAges = Array.from(new Set(updatedProduct.variations.map(v => v.idAge).filter(Boolean)));

          if (uniqueCouleurs.length === 1) setSelectedCouleur(uniqueCouleurs[0] as number);
          if (uniqueTailles.length === 1) setSelectedTaille(uniqueTailles[0] as number);
          if (uniqueAges.length === 1) setSelectedAge(uniqueAges[0] as number);
        }

        const sortedImages = updatedProduct.images?.sort((a, b) => a.rang - b.rang) || [];
        if (sortedImages.length > 0) {
          setSelectedImage(sortedImages[0].url);
          setCurrentImageIndex(0);
        }

        setLoading(false);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        setError(`Erreur lors du chargement du produit: ${message}`);
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
      setPixelTracked(false);
    }
  }, [id]);

  // Facebook Pixel tracking
  useEffect(() => {
    if (produit && !pixelTracked) {
      const priceData = calculatePriceWithPromotion(produit.prix);

      fbq.event('ViewContent', {
        content_ids: [produit.idProduit.toString()],
        content_name: produit.nom,
        content_type: 'product',
        content_category: produit.categorie?.nom || '',
        value: priceData ? priceData.prixFinal : produit.prix,
        currency: 'TND'
      });

      setPixelTracked(true);
    }
  }, [produit, pixelTracked, calculatePriceWithPromotion]);

  // Update available variations based on selections
  useEffect(() => {
    if (!produit?.variations) return;

    const needsTaille = produit.variations.some(v => v.idTaille !== null);
    const needsAge = produit.variations.some(v => v.idAge !== null);

    const allRequiredSelected = selectedCouleur && 
      (!needsTaille || selectedTaille) && 
      (!needsAge || selectedAge);

    if (allRequiredSelected) {
      const exactMatch = produit.variations.find(v =>
        v.idCouleur === selectedCouleur &&
        (!needsTaille || v.idTaille === selectedTaille) &&
        (!needsAge || v.idAge === selectedAge)
      );

      if (exactMatch) {
        setSelectedVariation(exactMatch);
        setQuantity(1);
      } else {
        setSelectedVariation(null);
      }
    } else {
      setSelectedVariation(null);
    }
  }, [selectedCouleur, selectedTaille, selectedAge, produit]);

  // Price calculations
  const prixUnitaire = useMemo(() => {
    if (!produit) return 0;
    return priceData ? priceData.prixFinal : produit.prix;
  }, [produit, priceData]);

  const sousTotal = useMemo(() => {
    return prixUnitaire * quantity;
  }, [prixUnitaire, quantity]);

  const totalAvecPromo = useMemo(() => {
    let total = sousTotal;
    if (codePromo?.valeurPourcentage) {
      total *= (1 - codePromo.valeurPourcentage / 100);
    }
    return total;
  }, [sousTotal, codePromo]);

  const fraisLivraison = useMemo(() => {
    if (produit?.livraisonGratuite) return 0;
    return 7.9;
  }, [produit]);

  const totalTTC = useMemo(() => {
    return totalAvecPromo + fraisLivraison;
  }, [totalAvecPromo, fraisLivraison]);

  const economiesCodePromo = sousTotal - totalAvecPromo;

  // Quantity handlers
  const handleIncrement = () => {
    const maxStock = selectedVariation ? selectedVariation.quantiteStock : produit?.quantiteStock || 0;
    if (quantity < maxStock) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const maxStock = selectedVariation ? selectedVariation.quantiteStock : produit?.quantiteStock || 0;
    if (!isNaN(value) && value >= 1 && value <= maxStock) {
      setQuantity(value);
    }
  };

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (value.trim() && errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };
  const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
const validateField = (name: any, value: any) => {
  switch (name) {
    case 'clientPrenom':
    case 'clientNom':
      return value.trim().length < 2;
    case 'clientTelephone':
      return !/^[24579]\d{7}$/.test(value.replace(/\s/g, ''));
    case 'clientEmail':
      return value && !isValidEmail(value);
    case 'clientAdresseRue':
      return value.trim().length < 4;
    case 'clientAdresseVille':
      return value.trim().length < 2;
    case 'clientAdresseCodePostal':
      return !/^\d{4}$/.test(value.trim());
    case 'notesLivraison':
      return value.length > 300;
    default:
      return false;
  }
};
const handleBlur = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  setErrors(prev => ({
    ...prev,
    [name]: validateField(name, value)
  }));
};
 const validateForm = (): boolean => {
  const requiredFields = [
    { key: 'clientPrenom', label: 'Prénom' },
    { key: 'clientNom', label: 'Nom' },
    { key: 'clientTelephone', label: 'Téléphone' },
    { key: 'clientAdresseRue', label: 'Adresse' },
    { key: 'clientAdresseVille', label: 'Ville' },
    { key: 'clientAdresseCodePostal', label: 'Code postal' }
  ];

  const newErrors: FormErrors = {};
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (!formData[field.key as keyof FormData].trim()) {
      newErrors[field.key] = true;
      missingFields.push(field.label);
    } else {
      // Valider le format
      const isInvalid = validateField(field.key, formData[field.key as keyof FormData]);
      if (isInvalid) {
        newErrors[field.key] = true;
      }
    }
  }

  // Valider l'email s'il est fourni (optionnel)
  if (formData.clientEmail && !isValidEmail(formData.clientEmail)) {
    newErrors.clientEmail = true;
    toast.error("L'adresse email n'est pas valide");
    setErrors(newErrors);
    return false;
  }

  // Vérifier le téléphone
  if (formData.clientTelephone && !/^[24579]\d{7}$/.test(formData.clientTelephone.replace(/\s/g, ''))) {
    newErrors.clientTelephone = true;
    toast.error("Le numéro doit commencer par 2, 4, 5, 7 ou 9 et contenir 8 chiffres");
    setErrors(newErrors);
    return false;
  }

  // Vérifier le code postal
  if (formData.clientAdresseCodePostal && !/^\d{4}$/.test(formData.clientAdresseCodePostal.trim())) {
    newErrors.clientAdresseCodePostal = true;
    toast.error("Le code postal doit contenir exactement 4 chiffres");
    setErrors(newErrors);
    return false;
  }

  if (missingFields.length > 0) {
    setErrors(newErrors);
    toast.error(`Veuillez remplir les champs obligatoires: ${missingFields.join(', ')}`);
    return false;
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return false;
  }

  setErrors({});
  return true;
};
  // Variations selection handlers
  const handleCouleurSelect = (idCouleur: number) => {
    setSelectedCouleur(idCouleur);
    setSelectedTaille(null);
    setSelectedAge(null);
    setQuantity(1);
  };

  const handleTailleSelect = (idTaille: number) => {
    setSelectedTaille(idTaille);
    setSelectedAge(null);
    setQuantity(1);
  };

  const handleAgeSelect = (idAge: number) => {
    setSelectedAge(idAge);
    setQuantity(1);
  };

  const isOrderButtonDisabled = () => {
    if (!produit) return true;
    if (produit.variations && produit.variations.length > 0) {
      return !selectedVariation || selectedVariation.quantiteStock === 0;
    }
    return produit.quantiteStock === 0;
  };

  // Image navigation handlers
  const handleImageSelect = (imageUrl: string) => {
    const index = produit?.images?.findIndex((img) => img.url === imageUrl) || 0;
    setSelectedImage(imageUrl);
    setCurrentImageIndex(index);
  };

  const handleNextImage = () => {
    const sortedImages = produit?.images?.sort((a, b) => a.rang - b.rang) || [];
    const nextIndex = (currentImageIndex + 1) % sortedImages.length;
    setCurrentImageIndex(nextIndex);
    setSelectedImage(sortedImages[nextIndex].url);
  };

  const handlePrevImage = () => {
    const sortedImages = produit?.images?.sort((a, b) => a.rang - b.rang) || [];
    const prevIndex = currentImageIndex === 0 ? sortedImages.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(prevIndex);
    setSelectedImage(sortedImages[prevIndex].url);
  };

  // Stock status logic
  const getStockStatus = () => {
    if (!produit) return { text: "Sélectionnez vos options", class: "bg-white/60 backdrop-blur-md text-gray-600 font-bold", available: false };

    if (!selectedCouleur && !selectedTaille && !selectedAge) {
      return { 
        text: "Sélectionnez vos options", 
        class: "bg-white/60 backdrop-blur-md text-gray-600 font-bold", 
        available: false 
      };
    }

    if (selectedVariation) {
      const stock = selectedVariation.quantiteStock;
      if (stock === 0) {
        return { 
          text: "Rupture", 
          class: "bg-white/60 backdrop-blur-md text-red-600 font-bold", 
          available: false 
        };
      } else if (stock <= 5) {
        return { 
          text: "Limité", 
          class: "bg-white/60 backdrop-blur-md text-amber-600 font-bold", 
          available: true 
        };
      } else {
        return { 
          text: "En stock", 
          class: "bg-white/60 backdrop-blur-md text-green-600 font-bold", 
          available: true 
        };
      }
    }

    let filtered = produit.variations ?? [];
    if (selectedCouleur) filtered = filtered.filter(v => v.idCouleur === selectedCouleur);
    if (selectedTaille) filtered = filtered.filter(v => v.idTaille === selectedTaille);
    if (selectedAge) filtered = filtered.filter(v => v.idAge === selectedAge);

    if (filtered.length > 0) {
      const someStock = filtered.some(v => v.quantiteStock > 0);
      if (someStock) {
        return { 
          text: "En stock", 
          class: "bg-white/60 backdrop-blur-md text-green-600 font-bold", 
          available: true 
        };
      } else {
        return { 
          text: "Rupture", 
          class: "bg-white/60 backdrop-blur-md text-red-600 font-bold", 
          available: false 
        };
      }
    }

    return { 
      text: "Sélectionnez vos options", 
      class: "bg-white/60 backdrop-blur-md text-gray-600 font-bold", 
      available: false 
    };
  };

  const stockStatus = getStockStatus();

  // Submit order
  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!produit) return;

    setSubmitting(true);
    try {
      const commandeData = {
        ...formData,
        statut: 'en attente' as const,
        montantTotal: totalTTC,
        lignesCommandes: [
          {
            idProduit: produit.idProduit,
            quantite: quantity,
            prixUnitaire: prixUnitaire,
            idProduitVariation: selectedVariation?.idProduitVariation ?? null,
            sousTotal: prixUnitaire * quantity,
          }
        ],
        codePromo: codePromo?.code,
        fraisLivraison: fraisLivraison,
      };

      const response = await CommandesService.createCommandeGuest(commandeData);

      fbq.event('Purchase', {
        content_ids: [produit.idProduit.toString()],
        content_name: produit.nom,
        content_type: 'product',
        value: totalTTC,
        currency: 'TND',
        num_items: quantity
      });

      toast.success('Commande créée avec succès !');

      router.push(`/order-confirmation-guest/${response.data.idCommande}?token=${response.data.guestToken}`);

    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création de la commande');
    } finally {
      setSubmitting(false);
    }
  };

  // Get unique options for variations
  const getUniqueCouleurs = () => {
    if (!produit?.variations) return [];
    const couleurs = produit.variations
      .map(v => v.couleur)
      .filter((c, index, self) => c && self.findIndex(sc => sc?.idCouleur === c.idCouleur) === index);
    return couleurs as any[];
  };

  const getUniqueTailles = () => {
    if (!produit?.variations) return [];
    const tailles = produit.variations
      .map(v => v.taille)
      .filter((t, index, self) => t && self.findIndex(st => st?.idTaille === t.idTaille) === index);
    return tailles as any[];
  };

  const getUniqueAges = () => {
    if (!produit?.variations) return [];
    const ages = produit.variations
      .map(v => v.age)
      .filter((a, index, self) => a && self.findIndex(sa => sa?.idAge === a.idAge) === index);
    return ages as any[];
  };

  const uniqueCouleurs = getUniqueCouleurs();
  const uniqueTailles = getUniqueTailles();
  const uniqueAges = getUniqueAges();

  const sortedImages = produit?.images?.sort((a, b) => a.rang - b.rang) || [];

  const tabs = [
    { 
      id: 'avis', 
      label: 'Avis', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    },
    { 
      id: 'commentaires', 
      label: 'Commentaires', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
  ] as const;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50">
        <KidsCornerLoader message="Chargement du produit..." size="lg" showMessage={true} />
      </div>
    );
  }

  if (error || !produit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Produit non trouvé</h2>
          <Link href="/products">
                <button className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-4 rounded-full hover:from-red-600 hover:to-pink-700 transition-all transform hover:scale-105 font-extrabold shadow-2xl flex items-center gap-2 mx-auto">
                  <SparklesIcon className="w-5 h-5" />
                  Découvrir nos produits
                </button>
              </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50 font-[Comic_Sans_MS,sans-serif]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ShoppingBagIcon className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-purple-600 drop-shadow-lg">
              Commande Rapide
            </h1>
          </div>
          <p className="text-gray-600 text-xs">Remplissez vos informations et commandez en un clic !</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Product Info */}
          <div className="space-y-6">
            {/* Product Card */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-pink-200 overflow-hidden">
              <div className="p-6">
                {/* Product Images */}
                <div className="flex flex-col lg:flex-row gap-4">
                  {sortedImages.length > 1 && (
                    <div className="flex lg:flex-col gap-2 order-2 lg:order-1 w-full lg:w-25 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto lg:max-h-96">
                      {sortedImages.slice(0, 15).map((image, index) => (
                        <button
                          key={image.idImage}
                          onClick={() => handleImageSelect(image.url)}
                          className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            selectedImage === image.url 
                              ? "border-pink-400 shadow-md" 
                              : "border-gray-200 hover:border-pink-200"
                          }`}
                        >
                          <Image
                            src={`${image.url || '/images/placeholder.jpg'}`}
                            alt={`${produit.nom} thumbnail ${image.rang}`}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex-1 order-1 lg:order-2">
                    <div className="relative w-full bg-white rounded-xl overflow-hidden border-2 border-pink-200" style={{ aspectRatio: "1/1" }}>
                      <Image
                        src={`${selectedImage || '/images/placeholder.jpg'}`}
                        alt={produit.nom}
                        fill
                        className="object-cover"
                      />
                      {priceData && priceData.reduction > 0 && (
                        <PromotionBadge pourcentageReduction={priceData.pourcentageReduction} />
                      )}
                      {/* Stock Status Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <div className={`${stockStatus.class} text-xs px-3 py-1 rounded-full shadow-md font-[Comic_Sans_MS,sans-serif]`}>
                          {stockStatus.text}
                        </div>
                      </div>
                      {sortedImages.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevImage}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white/90 hover:bg-pink-50 rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
                          >
                            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={handleNextImage}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white/90 hover:bg-pink-50 rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
                          >
                            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </>
                      )}
                      {sortedImages.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 lg:hidden">
                          {sortedImages.map((_, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentImageIndex ? 'bg-pink-500' : 'bg-pink-200'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="space-y-4 mt-6">
                  <h2 className="text-xl font-extrabold text-gray-800">{produit.nom}</h2>

                  {/* Price */}
                  <div className="flex items-center gap-3">
                    {priceData && priceData.reduction > 0 ? (
                      <>
                        <span className="text-xl font-extrabold text-pink-600">
                          {priceData.prixFinal.toFixed(2)} TND
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {produit.prix.toFixed(2)} TND
                        </span>
                      </>
                    ) : (
                      <span className="text-xl font-extrabold text-pink-600">
                        {produit.prix.toFixed(2)} TND
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {produit.description && (
                    <p className="text-gray-600 text-sm">{produit.description}</p>
                  )}

                  {/* Variations */}
                  {produit.variations && produit.variations.length > 0 && (
                    <div className="space-y-4 border-t border-pink-100 pt-4">
                      {uniqueCouleurs.length > 0 && (
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Couleur *
                          </label>
                          <div className="flex flex-wrap gap-2">
          {uniqueCouleurs.map((couleur) => {
  const couleurVariations = produit.variations?.filter(
    v => v.idCouleur === couleur.idCouleur
  ) || [];
  const hasStock = couleurVariations.some(v => v.quantiteStock > 0);

  return (
    <button
      key={couleur.idCouleur}
      onClick={() => {
        if (hasStock) {
          handleCouleurSelect(couleur.idCouleur); // ou setSelectedCouleur(...)
        }
      }}
      disabled={!hasStock}
      title={couleur.nom}
      className={`relative w-12 h-12 rounded-full border-4 transition-all duration-200 
        ${!hasStock
          ? 'opacity-50 cursor-not-allowed grayscale border-gray-300'
          : selectedCouleur === couleur.idCouleur
            ? 'scale-125 shadow-xl' // ← Effet discret : plus grand + ombre
            : 'border-gray-300 hover:scale-110 hover:border-gray-400'
        }`}
      style={{
        backgroundColor: couleur.ref || '#CCCCCC',
      }}
    >
      {/* Petit point rouge si rupture */}
      {!hasStock && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        </div>
      )}

      {/* Optionnel : petit cercle blanc au centre si sélectionné */}
      {hasStock && selectedCouleur === couleur.idCouleur && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
        </div>
      )}
    </button>
  );
})}
                          </div>
                        </div>
                      )}

                      {uniqueTailles.length > 0 && selectedCouleur && (
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Taille *
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {uniqueTailles.map((taille) => {
                              const tailleVariation = produit.variations?.find(
                                v => v.idCouleur === selectedCouleur && v.idTaille === taille.idTaille
                              );
                              const stock = tailleVariation ? tailleVariation.quantiteStock : 0;
                              const isDisabled = stock === 0;

                              return (
                                <button
                                  key={taille.idTaille}
                                  onClick={() => handleTailleSelect(taille.idTaille)}
                                  disabled={isDisabled}
                                  className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                                    isDisabled
                                      ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                                      : selectedTaille === taille.idTaille
                                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                                        : 'border-gray-200 hover:border-pink-300'
                                  }`}
                                >
                                  {taille.nom}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {uniqueAges.length > 0 && selectedCouleur && (
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Âge *
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {uniqueAges.map((age) => {
                              const ageVariation = produit.variations?.find(
                                v => v.idCouleur === selectedCouleur &&
                                     (!selectedTaille || v.idTaille === selectedTaille) &&
                                     v.idAge === age.idAge
                              );
                              const stock = ageVariation ? ageVariation.quantiteStock : 0;
                              const isDisabled = stock === 0;

                              return (
                                <button
                                  key={age.idAge}
                                  onClick={() => handleAgeSelect(age.idAge)}
                                  disabled={isDisabled}
                                  className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                                    isDisabled
                                      ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                                      : selectedAge === age.idAge
                                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                                        : 'border-gray-200 hover:border-pink-300'
                                  }`}
                                >
                                  {age.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quantity Selector */}
                  {selectedVariation || (!produit.variations || produit.variations.length === 0) ? (
                    <div className="border-t border-pink-100 pt-4">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Quantité
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleDecrement}
                          disabled={quantity <= 1}
                          className="w-10 h-10 rounded-lg border-2 border-pink-200 flex items-center justify-center hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <MinusIcon className="w-4 h-4 text-gray-700" />
                        </button>

                        <input
                          type="number"
                          value={quantity}
                          onChange={handleQuantityChange}
                          className="placeholder:text-gray-500 dark:placeholder:text-gray-400 dark:text-gray-700 w-20 h-10 text-center border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                          min="1"
                          max={selectedVariation?.quantiteStock || produit.quantiteStock}
                        />

                        <button
                          onClick={handleIncrement}
                          disabled={quantity >= (selectedVariation?.quantiteStock || produit.quantiteStock)}
                          className="w-10 h-10 rounded-lg border-2 border-pink-200 flex items-center justify-center hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <PlusIcon className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Selection Warning */}
                  {produit.variations && produit.variations.length > 0 && !selectedVariation && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Veuillez sélectionner toutes les options requises
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

           
          </div>

          {/* Right Column - Order Form */}
          <div className="space-y-6">
            {/* Customer Info Form */}
            {/* Customer Info Form */}
<div className="bg-white rounded-2xl shadow-xl border-2 border-pink-200 p-6">
  <h3 className="text-xl font-extrabold text-pink-600 mb-6">Informations de livraison</h3>

  <form className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Prénom *
          {errors.clientPrenom && <span className="text-red-500 ml-1 text-xs">- Au moins 2 caractères</span>}
        </label>
        <input
          type="text"
          name="clientPrenom"
          value={formData.clientPrenom}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={`placeholder:text-gray-500 dark:placeholder:text-gray-400 dark:text-gray-700 w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition-colors ${
            errors.clientPrenom ? 'border-red-500 bg-red-50' : 'border-pink-200'
          }`}
          placeholder="Votre prénom"
          maxLength={50}
        />
        {errors.clientPrenom && (
          <p className="text-red-500 text-xs mt-1">Le prénom doit contenir au moins 2 caractères</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Nom *
          {errors.clientNom && <span className="text-red-500 ml-1 text-xs">- Au moins 2 caractères</span>}
        </label>
        <input
          type="text"
          name="clientNom"
          value={formData.clientNom}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={`placeholder:text-gray-500 dark:placeholder:text-gray-400 dark:text-gray-700 w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition-colors ${
            errors.clientNom ? 'border-red-500 bg-red-50' : 'border-pink-200'
          }`}
          placeholder="Votre nom"
          maxLength={50}
        />
        {errors.clientNom && (
          <p className="text-red-500 text-xs mt-1">Le nom doit contenir au moins 2 caractères</p>
        )}
      </div>
    </div>

    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">
        Email (optionnel)
        {errors.clientEmail && <span className="text-red-500 ml-1 text-xs">- Format invalide</span>}
      </label>
      <input
        type="email"
        name="clientEmail"
        value={formData.clientEmail}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className={`placeholder:text-gray-500 dark:placeholder:text-gray-400 dark:text-gray-700 w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition-colors ${
          errors.clientEmail ? 'border-red-500 bg-red-50' : 'border-pink-200'
        }`}
        placeholder="votre@email.com (optionnel)"
        maxLength={80}
      />
      {errors.clientEmail && (
        <p className="text-red-500 text-xs mt-1">Format d'email invalide</p>
      )}
    </div>

    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">
        Téléphone *
        {errors.clientTelephone && <span className="text-red-500 ml-1 text-xs">- Format invalide</span>}
      </label>
      <input
        type="tel"
        name="clientTelephone"
        value={formData.clientTelephone}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className={`placeholder:text-gray-500 dark:placeholder:text-gray-400 dark:text-gray-700 w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition-colors ${
          errors.clientTelephone ? 'border-red-500 bg-red-50' : 'border-pink-200'
        }`}
        placeholder="2X XXX XXX ou 9X XXX XXX"
        maxLength={20}
      />
      {errors.clientTelephone && (
        <p className="text-red-500 text-xs mt-1">Le numéro doit commencer par 2, 4, 5, 7 ou 9 et contenir 8 chiffres</p>
      )}
    </div>

    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">
        Adresse *
        {errors.clientAdresseRue && <span className="text-red-500 ml-1 text-xs">- Au moins 4 caractères</span>}
      </label>
      <input
        type="text"
        name="clientAdresseRue"
        value={formData.clientAdresseRue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className={`placeholder:text-gray-500 dark:placeholder:text-gray-400 dark:text-gray-700 w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition-colors ${
          errors.clientAdresseRue ? 'border-red-500 bg-red-50' : 'border-pink-200'
        }`}
        placeholder="Rue, numéro, bâtiment..."
        maxLength={100}
      />
      {errors.clientAdresseRue && (
        <p className="text-red-500 text-xs mt-1">L'adresse doit contenir au moins 4 caractères</p>
      )}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Ville *
          {errors.clientAdresseVille && <span className="text-red-500 ml-1 text-xs">- Au moins 2 caractères</span>}
        </label>
        <input
          type="text"
          name="clientAdresseVille"
          value={formData.clientAdresseVille}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={` placeholder:text-gray-500 dark:placeholder:text-gray-400 dark:text-gray-700 w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition-colors ${
            errors.clientAdresseVille ? 'border-red-500 bg-red-50' : 'border-pink-200'
          }`}
          placeholder="Tunis"
          maxLength={50}
        />
        {errors.clientAdresseVille && (
          <p className="text-red-500 text-xs mt-1">La ville doit contenir au moins 2 caractères</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Code postal *
          {errors.clientAdresseCodePostal && <span className="text-red-500 ml-1 text-xs">- Exactement 4 chiffres</span>}
        </label>
        <input
          type="text"
          name="clientAdresseCodePostal"
          value={formData.clientAdresseCodePostal}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={`placeholder:text-gray-500 dark:placeholder:text-gray-400 dark:text-gray-700 w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition-colors ${
            errors.clientAdresseCodePostal ? 'border-red-500 bg-red-50' : 'border-pink-200'
          }`}
          placeholder="1000"
          maxLength={4}
        />
        {errors.clientAdresseCodePostal && (
          <p className="text-red-500 text-xs mt-1">Le code postal doit contenir exactement 4 chiffres</p>
        )}
      </div>
    </div>

    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">
        Notes de livraison (optionnel)
        {errors.notesLivraison && <span className="text-red-500 ml-1 text-xs">- Maximum 300 caractères</span>}
      </label>
      <textarea
        name="notesLivraison"
        value={formData.notesLivraison}
        onChange={handleInputChange}
        onBlur={handleBlur}
        rows={3}
        className={`placeholder:text-gray-500 dark:placeholder:text-gray-400 dark:text-gray-700 w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none transition-colors ${
          errors.notesLivraison ? 'border-red-500 bg-red-50' : 'border-pink-200'
        }`}
        placeholder="Instructions spéciales pour la livraison..."
        maxLength={300}
      />
      {errors.notesLivraison && (
        <p className="text-red-500 text-xs mt-1">Les notes ne peuvent pas dépasser 300 caractères</p>
      )}
      <p className="text-xs text-gray-500 mt-1">
        {formData.notesLivraison.length}/300 caractères
      </p>
    </div>
  </form>
</div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-pink-200 p-6">
              <h3 className="text-xl font-extrabold text-pink-600 mb-6">Récapitulatif</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Sous-total ({quantity} article{quantity > 1 ? 's' : ''})</span>
                  <span className="font-bold">{sousTotal.toFixed(2)} TND</span>
                </div>

                {codePromo && economiesCodePromo > 0 && (
                  <div className="flex justify-between text-pink-500 font-bold">
                    <span>Code promo ({codePromo.code})</span>
                    <span>-{economiesCodePromo.toFixed(2)} TND</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-700">
                  <span>Livraison</span>
                  <span className={`font-bold ${fraisLivraison === 0 ? 'text-green-600' : ''}`}>
                    {fraisLivraison === 0 ? 'Gratuite' : `${fraisLivraison.toFixed(2)} TND`}
                  </span>
                </div>

                <div className="border-t-2 border-pink-100 pt-3">
                  <div className="flex justify-between font-extrabold text-lg text-gray-700">
                    <span>Total TTC</span>
                    <span className="text-pink-600">{totalTTC.toFixed(2)} TND</span>
                  </div>
                </div>

                {economiesCodePromo > 0 && (
                  <div className="bg-green-50 text-green-700 p-3 rounded-lg text-center font-bold text-sm">
                    🎉 Vous économisez {economiesCodePromo.toFixed(2)} TND !
                  </div>
                )}
              </div>

              {/* Code Promo */}
              <div className="mt-6">
                <CodePromoInput
                  montantPanier={sousTotal}
                  idUtilisateur={undefined}
                  onCodeApplique={({ code, valeurPourcentage }) => {
                    setCodePromo({ code, valeurPourcentage });
                    toast.success(`Code promo "${code}" appliqué !`);
                  }}
                  onCodeSupprime={() => {
                    setCodePromo(null);
                    toast.success('Code promo supprimé');
                  }}
                  codeActuel={codePromo?.code}
                />
              </div>

              {/* Order Button */}
              <button
                onClick={handleSubmit}
                disabled={submitting || isOrderButtonDisabled()}
                className={`w-full mt-6 py-4 rounded-xl font-extrabold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 ${
                  submitting || isOrderButtonDisabled()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Traitement...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBagIcon className="w-5 h-5" />
                    <span>Commander maintenant</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Paiement à la livraison - Vous payez lors de la réception
              </p>
            </div>
          </div>
        </div>

        {/* Reviews and Comments Section */}
        <div className="mt-12">
          <div className="border-b-2 border-pink-200 mb-6">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-extrabold text-base whitespace-nowrap transition-colors font-[Comic_Sans_MS,sans-serif] ${
                    activeTab === tab.id
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-pink-600 hover:border-pink-300'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div className="space-y-6">
            {activeTab === 'avis' && (
              <AvisComponent idProduit={produit.idProduit} />
            )}

            {activeTab === 'commentaires' && (
              <CommentaireComponent idProduit={produit.idProduit} />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}