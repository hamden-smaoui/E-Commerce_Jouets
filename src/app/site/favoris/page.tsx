"use client"
import { useState } from "react";
import ProductCard from "@/components/ui/ProductCard";
import Footer from "@/components/ui/Footer";

export default function Favoris() {
  const [products, setProducts] = useState([
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
  {
    idProduit: 6,
    nom: "Voiture Télécommandée",
    prix: 29.99,
    image: "/images/hero2.jpeg",
    description: "Une voiture rapide contrôlable à distance.",
    quantiteStock: 3,
    marque: "SpeedToys",
    categorie: "Voitures"
  },
  {
    idProduit: 7,
    nom: "Peluche Ours",
    prix: 19.99,
    image: "/images/hero1.jpeg",
    description: "Une peluche douce et câline en forme d’ours.",
    quantiteStock: 8,
    marque: "TeddyCo",
    categorie: "Peluches"
  },
  {
    idProduit: 8,
    nom: "Voiture Télécommandée",
    prix: 29.99,
    image: "/images/hero2.jpeg",
    description: "Une voiture rapide contrôlable à distance.",
    quantiteStock: 6,
    marque: "SpeedToys",
    categorie: "Voitures"
  },
  {
    idProduit: 9,
    nom: "Peluche Ours",
    prix: 19.99,
    image: "/images/hero1.jpeg",
    description: "Une peluche douce et câline en forme d’ours.",
    quantiteStock: 11,
    marque: "TeddyCo",
    categorie: "Peluches"
  },
  {
    idProduit: 10,
    nom: "Voiture Télécommandée",
    prix: 29.99,
    image: "/images/hero2.jpeg",
    description: "Une voiture rapide contrôlable à distance.",
    quantiteStock: 7,
    marque: "SpeedToys",
    categorie: "Voitures"
  },
    // ...etc
  ]);

  const [visibleProducts, setVisibleProducts] = useState(4);
  const [sortBy, setSortBy] = useState("");

  const handleSortChange = (e:any) => {
    const value = e.target.value;
    setSortBy(value);

    let sortedProducts = [...products];

    if (value === "a-z") {
      sortedProducts.sort((a, b) => a.nom.localeCompare(b.nom));
    } else if (value === "z-a") {
      sortedProducts.sort((a, b) => b.nom.localeCompare(a.nom));
    } else if (value === "price-asc") {
      sortedProducts.sort((a, b) => a.prix - b.prix);
    } else if (value === "price-desc") {
      sortedProducts.sort((a, b) => b.prix - a.prix);
    }

    setProducts(sortedProducts);
  };

  const handleShowMore = () => {
    setVisibleProducts((prev) => prev + 4);
  };

  return (
    <div>
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex justify-center items-center mb-4">
        <h2 className="text-3xl font-serif italic text-purple-500">
          Votre Favoris
        </h2>
      </div>
      <hr className="mb-6 border-purple-300" />
      <div className="flex justify-between items-center mb-4 border-b pb-4">
        <p>Nous avons trouvé {products.length} produits favoris pour vous.</p>
        <select
          className="select select-bordered"
          value={sortBy}
          onChange={handleSortChange}
        >
          <option value="">Trier par</option>
          <option value="a-z">A-Z</option>
          <option value="z-a">Z-A</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
        </select>
      </div>

      <div className="h-screen overflow-y-auto overflow-x-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-4">
          {products.slice(0, visibleProducts).map((product) => (
            <ProductCard key={product.idProduit} product={product} />
          ))}
        </div>

        {visibleProducts < products.length && (
          <div className="flex flex-col items-center mt-4">
            <p>Il reste {products.length - visibleProducts} produits</p>
            <button className="btn btn-link" onClick={handleShowMore}>
              Afficher plus de produits
            </button>
          </div>
        )}
      </div>
    </div>
  <Footer />
</div>
  );
}
