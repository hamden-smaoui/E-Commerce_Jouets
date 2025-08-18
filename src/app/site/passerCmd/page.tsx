"use client";
import Image from "next/image";
import Footer from "@/components/ui/Footer";
import Link from 'next/link';

import { useState } from "react";
import { 
  ShieldCheckIcon, 
  TruckIcon, 
  ArrowUturnLeftIcon,
  ArrowLeftIcon,
  CreditCardIcon,
  BanknotesIcon
} from '@heroicons/react/24/solid';

const mockCart = [
  {
    idProduit: 1,
    nom: "SMOBY - PREMIER GARAGE 140202",
    image: "/images/hero1.jpeg",
    prixOriginal: 219.8,
    prixReduit: 131.88,
    quantite: 1,
    stock: 10,
  },
  {
    idProduit: 2,
    nom: "EDUCA - BABY BODIES 16222",
    image: "/images/hero2.jpeg",
    prixOriginal: 39.7,
    prixReduit: 23.82,
    quantite: 3,
    stock: 5,
  },
  {
    idProduit: 3,
    nom: "LEGO - CONSTRUCTION SET 12345",
    image: "/images/hero1.jpeg",
    prixOriginal: 159.9,
    prixReduit: 95.94,
    quantite: 2,
    stock: 8,
  },
];

export default function Checkout() {
  const [panier] = useState(mockCart);
  const [formData, setFormData] = useState({
    // Informations personnelles
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    
    // Adresse de livraison
    adresse: '',
    ville: '',
    codePostal: '',
    gouvernorat: '',
    
    // Mode de paiement
    modePaiement: 'card',
    
    // Informations carte (si paiement par carte)
    numeroCarteCard: '',
    expirationCard: '',
    cvvCard: '',
    nomCarteCard: '',
    
    // Notes
    notes: ''
  });

  const totalArticles = panier.reduce((sum, item) => sum + item.quantite, 0);
  const sousTotal = panier.reduce(
    (sum, item) => sum + item.quantite * item.prixReduit,
    0
  );
  const livraison = 7.9;
  const totalTTC = (sousTotal + livraison).toFixed(2);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Commande soumise:', formData);
    // Ici vous pouvez traiter la commande
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      {/* Header */}
      <div className="flex justify-center items-center mb-4">
        <h2 className="text-3xl font-serif italic text-purple-500">
          Finaliser la Commande
        </h2>
      </div>
      <hr className="mb-6 border-purple-300" />

      {/* Grid responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
        {/* Colonne gauche : Formulaire de commande */}
        <div className="lg:col-span-2 space-y-4">
          {/* Card du formulaire avec hauteur fixe et scroll */}
          <div className="bg-white shadow-md rounded p-6 h-[600px] flex flex-col border-2 border-black">
            <h2 className="text-xl font-bold mb-4 flex-shrink-0">INFORMATIONS DE COMMANDE</h2>
            
            {/* Container avec scroll pour le formulaire */}
            <div className="flex-1 overflow-y-auto pr-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations personnelles */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-purple-600">Informations personnelles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Prénom *</label>
                      <input
                        type="text"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nom *</label>
                      <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Téléphone *</label>
                      <input
                        type="tel"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Adresse de livraison */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-purple-600">Adresse de livraison</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Adresse complète *</label>
                      <input
                        type="text"
                        name="adresse"
                        value={formData.adresse}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Rue, numéro, appartement..."
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Ville *</label>
                        <input
                          type="text"
                          name="ville"
                          value={formData.ville}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Code postal *</label>
                        <input
                          type="text"
                          name="codePostal"
                          value={formData.codePostal}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Gouvernorat *</label>
                      <select
                        name="gouvernorat"
                        value={formData.gouvernorat}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      >
                        <option value="">Sélectionnez un gouvernorat</option>
                        <option value="tunis">Tunis</option>
                        <option value="ariana">Ariana</option>
                        <option value="ben-arous">Ben Arous</option>
                        <option value="manouba">Manouba</option>
                        <option value="nabeul">Nabeul</option>
                        <option value="zaghouan">Zaghouan</option>
                        <option value="bizerte">Bizerte</option>
                        <option value="beja">Béja</option>
                        <option value="jendouba">Jendouba</option>
                        <option value="kef">Le Kef</option>
                        <option value="siliana">Siliana</option>
                        <option value="kairouan">Kairouan</option>
                        <option value="kasserine">Kasserine</option>
                        <option value="sidi-bouzid">Sidi Bouzid</option>
                        <option value="sousse">Sousse</option>
                        <option value="monastir">Monastir</option>
                        <option value="mahdia">Mahdia</option>
                        <option value="sfax">Sfax</option>
                        <option value="gafsa">Gafsa</option>
                        <option value="tozeur">Tozeur</option>
                        <option value="kebili">Kébili</option>
                        <option value="gabes">Gabès</option>
                        <option value="medenine">Médenine</option>
                        <option value="tataouine">Tataouine</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Mode de paiement */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-purple-600">Mode de paiement</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="card"
                        name="modePaiement"
                        value="card"
                        checked={formData.modePaiement === 'card'}
                        onChange={handleInputChange}
                        className="text-purple-600"
                      />
                      <label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                        <CreditCardIcon className="w-5 h-5 text-blue-600" />
                        Paiement par carte bancaire
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="cash"
                        name="modePaiement"
                        value="cash"
                        checked={formData.modePaiement === 'cash'}
                        onChange={handleInputChange}
                        className="text-purple-600"
                      />
                      <label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
                        <BanknotesIcon className="w-5 h-5 text-green-600" />
                        Paiement à la livraison
                      </label>
                    </div>
                  </div>

                  {/* Informations carte bancaire */}
                  {formData.modePaiement === 'card' && (
                    <div className="mt-4 p-4 bg-gray-50 rounded">
                      <h4 className="font-medium mb-3">Informations de la carte</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Numéro de carte *</label>
                          <input
                            type="text"
                            name="numeroCarteCard"
                            value={formData.numeroCarteCard}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="1234 5678 9012 3456"
                            required={formData.modePaiement === 'card'}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Date d'expiration *</label>
                            <input
                              type="text"
                              name="expirationCard"
                              value={formData.expirationCard}
                              onChange={handleInputChange}
                              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="MM/AA"
                              required={formData.modePaiement === 'card'}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">CVV *</label>
                            <input
                              type="text"
                              name="cvvCard"
                              value={formData.cvvCard}
                              onChange={handleInputChange}
                              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="123"
                              required={formData.modePaiement === 'card'}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Nom sur la carte *</label>
                          <input
                            type="text"
                            name="nomCarteCard"
                            value={formData.nomCarteCard}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Nom comme sur la carte"
                            required={formData.modePaiement === 'card'}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes additionnelles */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-purple-600">Notes additionnelles</h3>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="Instructions de livraison, commentaires..."
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Bouton Retour au panier */}
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors">
            <ArrowLeftIcon className="w-4 h-4" />
            Retour au panier
          </button>
        </div>

        {/* Colonne droite : Résumé panier + Garanties (identique à la page panier) */}
        <div className="space-y-4">
          {/* Card du résumé avec hauteur fixe */}
          <div className="bg-gray-50 shadow-md rounded p-6 h-[400px] flex flex-col">
            <h2 className="text-lg font-bold mb-4 flex-shrink-0">
              {totalArticles} article{totalArticles > 1 ? "s" : ""}
            </h2>
            
            {/* Aperçu des produits */}
            <div className="flex-1 overflow-y-auto mb-4">
              <div className="space-y-2">
                {panier.map((item) => (
                  <div key={item.idProduit} className="flex items-center gap-2 py-2 border-b border-gray-200 last:border-b-0">
                    <Image
                      src={item.image}
                      alt={item.nom}
                      width={40}
                      height={40}
                      className="rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.nom}</p>
                      <p className="text-xs text-gray-600">Qté: {item.quantite}</p>
                    </div>
                    <span className="text-sm font-bold text-orange-500">
                      {(item.quantite * item.prixReduit).toFixed(2)} TND
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-shrink-0">
              <div className="space-y-2 text-gray-700 mb-4">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{sousTotal.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span>{livraison.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between font-bold text-black text-lg border-t pt-2">
                  <span>Total TTC</span>
                  <span>{totalTTC} TND</span>
                </div>
              </div>
             <Link href="/site/confirmCmd">
              <button 
                onClick={handleSubmit}
                className="w-full bg-purple-600 text-white py-3 rounded hover:bg-purple-700 font-semibold transition-colors"
              >
                Confirmer la commande
              </button>
              </Link>
            </div>
          </div>

          {/* Section des garanties et politiques */}
          <div className="bg-white shadow-md rounded p-4">
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                <span>Garanties sécurité</span>
              </div>
              <div className="flex items-center gap-3">
                <TruckIcon className="w-5 h-5 text-blue-600" />
                <span>Politique de livraison</span>
              </div>
              <div className="flex items-center gap-3">
                <ArrowUturnLeftIcon className="w-5 h-5 text-orange-600" />
                <span>Politique retours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}