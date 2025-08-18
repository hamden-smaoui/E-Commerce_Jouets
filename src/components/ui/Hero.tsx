"use client";

import { useState, useEffect } from "react";

interface HeroProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export default function Hero({ title, description, buttonText, buttonLink }: HeroProps) {
  const images = [
    "/images/hero1.jpeg",
    "/images/hero2.jpeg",
  ];

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="flex min-h-[calc(100vh-200px)] bg-base-100 relative">
      {/* Left side - Content with Mauve Background */}
      <div className="w-1/2 flex flex-col justify-center items-start p-8 md:p-16 z-10 bg-purple-300">
        <h1 className="text-4xl md:text-6xl font-bold text-base-content mb-4">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-base-content/80 mb-8 max-w-lg">
          {description}
        </p>
        <a
          href={buttonLink}
          className="btn btn-lg"
          style={{
            background: "linear-gradient(to right, #00aaff,rgb(0, 225, 255))",
            color: "white",
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)",
          }}
        >
          {buttonText}
        </a>
      </div>

      {/* Vertical Divider - Same Wave Design */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-full z-20">
        <svg
          className="w-full h-full"
          viewBox="0 0 20 100"
          preserveAspectRatio="none"
        >
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

      {/* Right side - Image */}
      <div className="w-1/2 relative overflow-hidden z-10">
        <div key={currentImage} className="absolute inset-0">
          <img
            src={images[currentImage]}
            alt={`Hero Image ${currentImage + 1}`}
            className="w-full h-full object-cover animate-ken-burns"
          />
        </div>
      </div>
    </div>
  );
}