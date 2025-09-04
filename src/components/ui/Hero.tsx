"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useStoreInfo } from "@/hooks/useStoreInfo";

interface HeroProps {
  title?: string;
  description?: string;
  buttonText: string;
  buttonLink: string;
}

export default function Hero({ title, description, buttonText, buttonLink }: HeroProps) {
  const { storeInfo } = useStoreInfo();
  
  // Images par défaut si aucune image hero n'est disponible
  const defaultImages = [
    { src: "/images/hero1.jpeg", alt: "Hero Image 1" },
    { src: "/images/hero2.jpeg", alt: "Hero Image 2" }
  ];

  // Utiliser les images du store ou les images par défaut
  const images = storeInfo?.heroImages && storeInfo.heroImages.length > 0 
    ? storeInfo.heroImages
        .sort((a, b) => a.rang - b.rang)
        .map(img => ({ 
          src: `http://localhost:3001${img.url}`, 
          alt: `Hero Image ${img.rang}` 
        }))
    : defaultImages;

  // Utiliser le titre et la description du store ou les valeurs par défaut
  const heroTitle = title || `Bienvenue chez ${storeInfo?.nom || 'Toy Universe'} !`;
  const heroDescription = description || storeInfo?.descriptionHero || "Découvrez notre collection de jouets pour tous les âges.";

  const [currentImage, setCurrentImage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [images.length, isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentImage(index);
    setIsAutoPlaying(false);
    
    // Reprendre l'autoplay après 3 secondes
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  return (
    <div className="relative flex flex-col lg:flex-row min-h-[60vh] sm:min-h-[70vh] lg:min-h-[calc(100vh-200px)] bg-white overflow-hidden">
      {/* Mobile: Overlay text and button on image */}
      <div className="lg:hidden absolute inset-0 z-30 flex flex-col justify-center items-center text-center p-4">
        <div className=" inset-0 bg-black/10 "></div>
        <div className="relative z-10 max-w-lg mx-auto">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-4 text-white drop-shadow-lg">
            {heroTitle}
          </h1>
          <p className="text-lg mb-6 text-white/90 drop-shadow-md leading-relaxed">
            {heroDescription}
          </p>
          
           <a href={buttonLink}
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-yellow-500 text-white font-semibold rounded-full shadow-lg hover:from-blue-600 hover:to-yellow-600 transform hover:scale-105 transition-all duration-300"
          >
            {buttonText}
          </a>
        </div>
      </div>

      {/* Desktop: Left side - Content */}
      <div className="hidden lg:flex w-full lg:w-1/2 flex-col justify-center items-start p-8 lg:p-16 bg-gradient-to-br from-purple-50 to-blue-50 z-10">
        <div className="max-w-xl">
          <h1 className="text-4xl lg:text-6xl font-serif font-bold text-gray-800 mb-6 leading-tight">
            {heroTitle}
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {heroDescription}
          </p>
          
            <a href={buttonLink}
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-yellow-500 text-white font-semibold rounded-full shadow-lg hover:from-blue-600 hover:to-yellow-600 transform hover:scale-105 transition-all duration-300"
          >
            {buttonText}
          </a>
        </div>
      </div>

      {/* Vertical Divider - Wave Design (hidden on mobile) */}
      <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-6 h-full z-20">
        <svg className="w-full h-full" viewBox="0 0 20 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: "#00aaff" }} />
              <stop offset="100%" style={{ stopColor: "#ffd700" }} />
            </linearGradient>
          </defs>
          <path
            d="M0,25 Q10,10 20,25 Q30,40 40,25 Q50,10 60,25 Q70,40 80,25 Q90,10 100,25 V100 H0 Z"
            fill="url(#waveGradient)"
          />
        </svg>
      </div>

      {/* Image Carousel */}
      <div className="w-full lg:w-1/2 relative overflow-hidden z-10 h-[50vh] sm:h-[60vh] lg:h-auto">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImage ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        ))}

        {/* Image Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImage
                  ? "bg-white scale-110 shadow-lg"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation Arrows (Desktop only) */}
        <button
          onClick={() => goToSlide((currentImage - 1 + images.length) % images.length)}
          className="hidden lg:block absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
          aria-label="Previous image"
        >
          ←
        </button>
        <button
          onClick={() => goToSlide((currentImage + 1) % images.length)}
          className="hidden lg:block absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
          aria-label="Next image"
        >
          →
        </button>
      </div>
    </div>
  );
}