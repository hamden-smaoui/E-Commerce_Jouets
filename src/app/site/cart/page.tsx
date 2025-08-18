"use client";
import Image from "next/image";
import Footer from "@/components/ui/Footer";
import Link from 'next/link';

import { useState } from "react";
import { 
  TrashIcon, 
  ShieldCheckIcon, 
  TruckIcon, 
  ArrowUturnLeftIcon,
  ArrowLeftIcon,
  MinusIcon,
  PlusIcon
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
  {
    idProduit: 4,
    nom: "BARBIE - DREAMHOUSE 67890",
    image: "/images/hero2.jpeg",
    prixOriginal: 299.5,
    prixReduit: 179.7,
    quantite: 1,
    stock: 3,
  },{
    idProduit: 5,
    nom: "BARBIE - DREAMHOUSE 67890",
    image: "/images/hero2.jpeg",
    prixOriginal: 299.5,
    prixReduit: 179.7,
    quantite: 1,
    stock: 3,
  },
  {
    idProduit: 6,
    nom: "BARBIE - DREAMHOUSE 67890",
    image: "/images/hero2.jpeg",
    prixOriginal: 299.5,
    prixReduit: 179.7,
    quantite: 1,
    stock: 3,
  },
];

export default function Cart() {
  const [panier, setPanier] = useState(mockCart);

  const totalArticles = panier.reduce((sum, item) => sum + item.quantite, 0);
  const sousTotal = panier.reduce(
    (sum, item) => sum + item.quantite * item.prixReduit,
    0
  );
  const livraison = 7.9;
  const totalTTC = (sousTotal + livraison).toFixed(2);

  const handleIncrement = (id: number) => {
    setPanier((prev) =>
      prev.map((item) => {
        if (item.idProduit === id && item.quantite < item.stock) {
          return { ...item, quantite: item.quantite + 1 };
        }
        return item;
      })
    );
  };

  const handleDecrement = (id: number) => {
    setPanier((prev) =>
      prev.map((item) => {
        if (item.idProduit === id && item.quantite > 1) {
          return { ...item, quantite: item.quantite - 1 };
        }
        return item;
      })
    );
  };

  const handleQuantityChange = (
    id: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) return;
    
    setPanier((prev) =>
      prev.map((item) => {
        if (item.idProduit === id) {
          const newQuantity = Math.min(value, item.stock);
          return { ...item, quantite: newQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (idProduit: number) => {
    setPanier((prev) => prev.filter((item) => item.idProduit !== idProduit));
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 ">
      {/* Header */}
      <div className="flex justify-center items-center mb-4">
        <h2 className="text-3xl font-serif italic text-purple-500">
          Votre Panier
        </h2>
      </div>
      <hr className="mb-6 border-purple-300" />

      {/* Grid responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
        {/* Colonne gauche : Liste des produits + Continuer vos achats */}
        <div className="lg:col-span-2 space-y-4">
          {/* Card du panier avec hauteur fixe et scroll */}
          <div className="bg-white shadow-md rounded p-4 h-[400px] flex flex-col border-2 border-black">
            <h2 className="text-xl font-bold mb-4 flex-shrink-0">PANIER D&apos;ACHAT</h2>
            
            {/* Container avec scroll pour les produits */}
            <div className="flex-1 overflow-y-auto pr-2">
              {panier.length === 0 ? (
                <p className="text-gray-600">Votre panier est vide.</p>
              ) : (
                <div className="space-y-4">
                  {panier.map((item, index) => (
                    <div
                      key={item.idProduit}
                      className={`flex flex-col sm:flex-row items-center sm:items-start justify-between py-4 gap-4 ${
                        index !== panier.length - 1 ? 'border-b' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Image
                          src={item.image}
                          alt={item.nom}
                          width={100}
                          height={100}
                          className="rounded flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base">{item.nom}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="line-through text-gray-400 text-sm">
                              {item.prixOriginal.toFixed(2)} TND
                            </span>
                            <span className="bg-pink-200 text-pink-800 px-2 py-0.5 text-xs rounded">
                              -40%
                            </span>
                          </div>
                          <div className="text-orange-500 text-lg font-bold">
                            {item.prixReduit.toFixed(2)} TND
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        {/* Sélecteur de quantité */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDecrement(item.idProduit)}
                            disabled={item.quantite <= 1}
                            className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            value={item.quantite}
                            onChange={(e) => handleQuantityChange(item.idProduit, e)}
                            className="w-14 h-8 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            min="1"
                            max={item.stock}
                          />
                          <button
                            onClick={() => handleIncrement(item.idProduit)}
                            disabled={item.quantite >= item.stock}
                            className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-lg font-bold min-w-[100px] text-right">
                          {(item.quantite * item.prixReduit).toFixed(2)} TND
                        </div>
                        <button
                          onClick={() => removeFromCart(item.idProduit)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bouton Continuer vos achats - En dessous de la card */}
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors">
            <ArrowLeftIcon className="w-4 h-4" />
            Continuer vos achats
          </button>
        </div>

        {/* Colonne droite : Résumé panier + Garanties */}
        <div className="space-y-4">
          {/* Card du résumé avec hauteur fixe */}
          <div className="bg-gray-50 shadow-md rounded p-6 h-[400px] flex flex-col">
            <h2 className="text-lg font-bold mb-4 flex-shrink-0">
              {totalArticles} article{totalArticles > 1 ? "s" : ""}
            </h2>
            
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-2 text-gray-700">
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

              <div className="mt-6">
                <label className="block mb-1 font-medium">Code de réduction</label>
                <input
                  type="text"
                  className="border px-3 py-2 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Entrez votre code"
                />
              <Link href="/site/passerCmd">
  <button className="w-full bg-purple-600 text-white py-3 rounded hover:bg-purple-700 font-semibold transition-colors">
    Commander
  </button>
</Link>
              </div>
            </div>
          </div>

          {/* Section des garanties et politiques - En dessous de la card */}
          <div className="bg-white shadow-md rounded p-4 ">
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
      <Footer  />
    </div>
  );
}