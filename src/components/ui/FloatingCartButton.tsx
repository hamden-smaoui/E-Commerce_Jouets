"use client";
import { useState } from "react";
import { ShoppingCartIcon } from "@heroicons/react/24/solid";
import { useCart } from "@/hooks/useCart";
import CartModal from "./CartModal";

export default function CartButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { totalItems, loading } = useCart();

  if (loading) {
    return (
      <button 
        disabled
        className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-full shadow-md font-bold text-sm font-[Comic_Sans_MS,sans-serif] cursor-not-allowed"
      >
        <div className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full"></div>
        <span>Panier</span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all font-bold text-sm font-[Comic_Sans_MS,sans-serif]"
      >
        <ShoppingCartIcon className="h-5 w-5" />
        <span>Panier</span>
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-yellow-400 text-purple-900 text-xs font-extrabold rounded-full h-6 w-6 flex items-center justify-center shadow-md border-2 border-white">
            {totalItems}
          </span>
        )}
      </button>

      <CartModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}