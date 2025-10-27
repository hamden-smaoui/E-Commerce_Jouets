"use client";
import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";

interface PromotionImage {
  idImage: number;
  url: string;
  rang: number;
}

interface PromotionsSectionProps {
  images: PromotionImage[];
}

export default function PromotionsSection({ images }: PromotionsSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive image sizing
  const [imgStyle, setImgStyle] = useState({
    width: "85vw",
    maxWidth: "800px",
    minWidth: "560px",
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 640) {
        setImgStyle({
          width: "85vw",
          maxWidth: "400px",
          minWidth: "280px",
        });
      } else {
        setImgStyle({
          width: "85vw",
          maxWidth: "800px",
          minWidth: "560px",
        });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <section className="py-8 w-full bg-white">
      <div className="mx-auto px-[10px] w-full">
        {/* HEADER - style BestOffers */}
        <div className="text-center mb-10">
          <h2
            className="text-xl sm:text-4xl font-black tracking-wide text-pink-500 drop-shadow-lg flex items-center justify-center gap-2"
            style={{ fontFamily: "'Comic Neue', 'Comic Sans MS', cursive, sans-serif" }}
          >
            <span role="img" aria-label="star">🌟</span>
            Promotions Spéciales
            <span role="img" aria-label="balloon">🎈</span>
          </h2>
          <div className="flex justify-center mt-2">
            {/* playful divider with dots (rose/bleu) */}
            <svg width="140" height="16" viewBox="0 0 140 16" fill="none">
              <ellipse cx="8" cy="8" rx="8" ry="8" fill="#f472b6" />
              <rect x="16" y="7" width="108" height="2" rx="1" fill="url(#gradient)" />
              <ellipse cx="132" cy="8" rx="8" ry="8" fill="#38bdf8" />
              <defs>
                <linearGradient id="gradient" x1="16" y1="8" x2="124" y2="8" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f472b6" />
                  <stop offset="1" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        {/* CAROUSEL */}
        <div className="relative">
          <div
            ref={containerRef}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 custom-scrollbar-promotion"
            tabIndex={0}
            style={{
              overscrollBehaviorX: "contain",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {images.map((image) => (
              <div
                key={image.idImage}
                className="snap-start shrink-0"
                style={imgStyle}
              >
                <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl bg-white p-2 transform hover:scale-105 transition-all duration-300">
                  <Image
                    src={`${image.url}`}  
                    alt={`Promotion ${image.rang}`}
                    fill
                    className="object-contain rounded-lg"
                    sizes="(max-width: 640px) 85vw, (max-width: 1024px) 800px, 800px"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Custom scrollbar style */}
      <style>{`
        .custom-scrollbar-promotion {
          scrollbar-width: thin;
          scrollbar-color: #f472b6 #fdf2f8;
        }
        .custom-scrollbar-promotion::-webkit-scrollbar {
          height: 12px;
          border-radius: 8px;
          background: #fdf2f8;
        }
        .custom-scrollbar-promotion::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, #f472b6 30%, #38bdf8 70%);
          border-radius: 8px;
        }
        .custom-scrollbar-promotion::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(90deg, #f472b6 10%, #38bdf8 90%);
        }
      `}</style>
    </section>
  );
}