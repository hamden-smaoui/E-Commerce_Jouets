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

  const defaultImages = [
    { src: "/images/hero1.jpeg", alt: "Jouets colorés pour enfants" },
    { src: "/images/hero2.jpeg", alt: "Enfant jouant avec des jouets" },
  ];

  const images =
    storeInfo?.heroImages && storeInfo.heroImages.length > 0
      ? storeInfo.heroImages
          .sort((a, b) => a.rang - b.rang)
          .map((img) => ({
            src: `${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}${img.url}`,
            alt: `Image ${img.rang} de la boutique`,
          }))
      : defaultImages;

  const heroTitle = title || `Bienvenue chez ${storeInfo?.nom || "Toy Universe"} !`;
  const heroDescription =
    description ||
    storeInfo?.descriptionHero ||
    "Découvrez notre collection magique de jouets pour tous les âges !";

  const [currentImage, setCurrentImage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(
      () => setCurrentImage((prev) => (prev + 1) % images.length),
      5000
    );
    return () => clearInterval(interval);
  }, [images.length, isAutoPlaying]);

  const goToSlide = (idx: number) => {
    setCurrentImage(idx);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  return (
    <section className="relative w-full bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50 overflow-hidden font-[Comic_Sans_MS,sans-serif]">
      {/* MOBILE: Image on top, text below */}
<div className="relative w-full h-[50vh] min-h-[350px] flex items-end lg:hidden">
  {/* Carousel as background */}
  <div className="absolute inset-0 w-full h-full z-0">
    {images.map((image, idx) => (
      <div
        key={idx}
        className={`absolute inset-0 transition-opacity duration-1000 ${
          idx === currentImage ? "opacity-100" : "opacity-0"
        }`}
        style={{ height: "100%" }}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover"
          priority={idx === 0}
          sizes="100vw"
          style={{
            height: "100%",
            width: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    ))}
    {/* Optionally, add a gradient overlay for text readability */}
    <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent" />
  </div>

  {/* Text content above background */}
  <div className="relative z-10 w-full flex flex-col items-center justify-end px-5 pb-8 pt-24 text-center">
    <h1 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold font-[Comic_Sans_MS,sans-serif] text-pink-600 mb-4 leading-tight drop-shadow-lg rounded-xl px-3 py-2">
      {heroTitle}
    </h1>
    <p className="text-base xs:text-lg sm:text-xl text-blue-800 mb-6 leading-relaxed font-semibold bg-white/40 rounded-xl px-3 py-2 inline-block drop-shadow">
      {heroDescription}
    </p>
    <a
      href={buttonLink}
      className="inline-block px-6 py-3 bg-gradient-to-r from-pink-400 to-sky-400 text-white text-lg font-bold rounded-full shadow-xl hover:from-pink-500 hover:to-sky-500 transition-all transform hover:scale-105 duration-300"
    >
      {buttonText}
    </a>
  </div>
</div>

      {/* DESKTOP: Side-by-side, indicators */}
      <div className="hidden lg:flex w-full min-h-[60vh] lg:min-h-[calc(100vh-160px)]">
        {/* Left: Text */}
        <div className="w-1/2 flex items-center justify-center bg-gradient-to-br from-pink-100/80 via-yellow-50/60 to-blue-100/80 p-16">
          <div className="w-full max-w-xl text-left">
            <h1 className="text-4xl xl:text-5xl font-extrabold font-[Comic_Sans_MS,sans-serif] text-pink-600 mb-6 leading-tight drop-shadow-lg">
              {heroTitle}
            </h1>
            <p className="text-xl xl:text-2xl text-blue-800 mb-8 leading-relaxed font-semibold bg-white/80 rounded-xl px-3 py-3 inline-block drop-shadow">
              {heroDescription}
            </p>
            <a
              href={buttonLink}
className="inline-block px-8 py-4 bg-gradient-to-r from-pink-400 to-sky-400 text-white text-lg font-bold rounded-full shadow-xl hover:from-pink-500 hover:to-sky-500 transition-all transform hover:scale-105 duration-300"            >
              {buttonText}
            </a>
          </div>
        </div>
        {/* Right: Image carousel (takes full height and width) */}
        <div className="relative w-1/2 h-auto flex items-stretch min-h-[60vh]">
          {images.map((image, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                idx === currentImage ? "opacity-100" : "opacity-0"
              }`}
              style={{ height: "100%" }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                priority={idx === 0}
                sizes="50vw"
                style={{
                  height: "100%",
                  width: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          ))}
          {/* Bubbles indicators ONLY on desktop */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`w-4 h-4 rounded-full ring-2 ring-white transition-all duration-300 shadow-xl
                  ${idx === currentImage
                    ? "bg-gradient-to-r from-pink-400 to-blue-400 scale-125"
                    : "bg-white/60 hover:bg-yellow-200"}
                `}
                aria-label={`Aller à l'image ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}