"use client";
import React, { useState, useEffect } from "react";
import Categories from "@/components/ui/Categories";
import Hero from "@/components/ui/Hero";
import BestOffers from "@/components/ui/BestOffers";
import FeaturedSection from "@/components/ui/FeaturedSection";
import Footer from "@/components/ui/Footer";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import ProduitsService, { BestSellingProduit } from "@/services/produits-service";
import CategoriesService, { Categorie } from "@/services/categories-service";
import KidsCornerLoader from "@/components/ui/KidsCornerLoader";
import PromotionsSection from "@/components/ui/PromotionsSection";
import {
  ShieldCheckIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: <ShieldCheckIcon className="w-full h-full" />,
    title: "Qualité Garantie",
    description: "Tous nos produits sont testés et certifiés selon les normes de sécurité les plus strictes pour garantir la sécurité de vos enfants.",
  },
  {
    icon: <CubeIcon className="w-full h-full" />,
    title: "Large Sélection",
    description: "Des milliers de jouets et produits de puériculture pour tous les âges, des plus petits aux adolescents.",
  },
  {
    icon: <CurrencyDollarIcon className="w-full h-full" />,
    title: "Prix Compétitifs",
    description: "Les meilleurs prix du marché avec des promotions régulières et un excellent rapport qualité-prix.",
  },
  {
    icon: <ChatBubbleLeftRightIcon className="w-full h-full" />,
    title: "Service Client",
    description: "Une équipe dédiée à votre service pour vous conseiller et répondre à toutes vos questions rapidement.",
  },
];

export default function Home() {
  const { storeInfo } = useStoreInfo();
  const [bestOffers, setBestOffers] = useState<BestSellingProduit[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch both BestOffers and Categories concurrently
        const [bestOffersData, categoriesData] = await Promise.all([
          ProduitsService.getTop10BestSellingProduits(),
          CategoriesService.getAllCategories(),
        ]);
        setBestOffers(bestOffersData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setBestOffers([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100">
        <KidsCornerLoader message="Chargement de la page..." size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {error ? (
        <div className="py-12 text-center text-red-600">
          <p>Erreur lors du chargement des données: {error}</p>
        </div>
      ) : (
        <>
          <Categories categories={categories} />
          <Hero
            buttonText="Voir les produits"
            buttonLink="/site/products"
          />
         
     {bestOffers.length > 0 && <BestOffers offers={bestOffers} />} 
       {/* Nouvelle section promotions */}
  {storeInfo?.promotionImages && storeInfo.promotionImages.length > 0 && (
    <PromotionsSection images={storeInfo.promotionImages} />
  )}
          <FeaturedSection title={`Pourquoi choisir ${storeInfo?.nom || 'Bamby Joy'} ?`} features={features} />
          <Footer/>
          
        </>
      )}
    </div>
  );
}     