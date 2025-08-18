"use client";
import React from "react";
import Categories from "@/components/ui/Categories";
import Hero from "@/components/ui/Hero";
import BestOffers from "@/components/ui/BestOffers";
import FeaturedSection from "@/components/ui/FeaturedSection";
import Footer from "@/components/ui/Footer";

const categories = [
  { name: "Puericulture", path: "/category/puericulture" },
  { name: "Jouets 0-2 Ans", path: "/category/0-2" },
  { name: "Jouets 2-4 Ans", path: "/category/2-4" },
  { name: "Jouets 5-7 Ans", path: "/category/5-7" },
  { name: "Jouets 8-11 Ans", path: "/category/8-11" },
  { name: "Jouets +12 Ans", path: "/category/12+" },
  { name: "Promotion", path: "/category/promotion" },
  { name: "Scolaire", path: "/category/scolaire" },
];
const features = [
  { imageSrc: "https://img.daisyui.com/images/stock/photo-1567653418876-5bb0e566e1c2.webp", text: "Qualité supérieure" },
  { imageSrc: "https://img.daisyui.com/images/stock/photo-1567653418876-5bb0e566e1c2.webp", text: "Large variété" },
  { imageSrc: "https://img.daisyui.com/images/stock/photo-1567653418876-5bb0e566e1c2.webp", text: "Prix compétitifs" },
  { imageSrc: "https://img.daisyui.com/images/stock/photo-1567653418876-5bb0e566e1c2.webp", text: "Service client" },
];
const bestOffers = [
  {
    idProduit: 1,
    nom: "Peluche Ours",
    prix: 19.99,
    image: "/images/hero1.jpeg",
    description: "Une peluche douce et câline en forme d’ours.",
    quantiteStock: 10,
    marque: "TeddyCo",
    categorie: "Peluches"
  },
  {
    idProduit: 2,
    nom: "Voiture Télécommandée",
    prix: 29.99,
    image: "/images/hero2.jpeg",
    description: "Une voiture rapide contrôlable à distance.",
    quantiteStock: 5,
    marque: "SpeedToys",
    categorie: "Voitures"
  },
  {
    idProduit: 3,
    nom: "Peluche Ours",
    prix: 19.99,
    image: "/images/hero1.jpeg",
    description: "Une peluche douce et câline en forme d’ours.",
    quantiteStock: 12,
    marque: "TeddyCo",
    categorie: "Peluches"
  },
  {
    idProduit: 4,
    nom: "Voiture Télécommandée",
    prix: 29.99,
    image: "/images/hero2.jpeg",
    description: "Une voiture rapide contrôlable à distance.",
    quantiteStock: 4,
    marque: "SpeedToys",
    categorie: "Voitures"
  },
  {
    idProduit: 5,
    nom: "Peluche Ours",
    prix: 19.99,
    image: "/images/hero1.jpeg",
    description: "Une peluche douce et câline en forme d’ours.",
    quantiteStock: 15,
    marque: "TeddyCo",
    categorie: "Peluches"
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <Categories categories={categories} />
      <Hero
        title="Bienvenue chez Toy Universe !"
        description="Découvrez notre collection de jouets pour tous les âges."
        buttonText="Voir les produits"
        buttonLink="/products"
      />
      <BestOffers offers={bestOffers} />
       <FeaturedSection title="Pourquoi choisir Toy Universe?" features={features} />
<Footer />
    </div>
  );
}