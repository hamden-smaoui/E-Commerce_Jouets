"use client";
import React from "react";
import { 
  ShieldCheckIcon, 
  CubeIcon, 
  CurrencyDollarIcon, 
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FeaturedSectionProps {
  title: string;
  features: Feature[];
}

export default function FeaturedSection({ title, features }: FeaturedSectionProps) {
  return (
    <section className="py-16 bg-gradient-to-br from-pink-100 via-yellow-50 to-blue-100 text-blue-900">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-xl sm:text-3xl md:text-5xl font-extrabold text-pink-600 mb-4 font-[Comic_Sans_MS,sans-serif] drop-shadow-lg">
            {title}
          </h2>
          <div className="flex justify-center mt-2">
            {/* Playful divider with colored bubbles */}
            <svg width="120" height="16" viewBox="0 0 120 16" fill="none">
              <ellipse cx="8" cy="8" rx="8" ry="8" fill="#f472b6" />
              <rect x="16" y="7" width="88" height="2" rx="1" fill="url(#dividerGradient)" />
              <ellipse cx="112" cy="8" rx="8" ry="8" fill="#38bdf8" />
              <defs>
                <linearGradient id="dividerGradient" x1="16" y1="8" x2="104" y2="8" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f472b6" />
                  <stop offset="1" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 text-center group border-2 border-transparent hover:border-pink-200"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-100 via-yellow-100 to-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                <div className="w-10 h-10 text-pink-500 group-hover:text-blue-500 transition-colors duration-300">
                  {feature.icon}
                </div>
              </div>
              
              <h3 className="text-lg sm:text-xl font-bold text-pink-600 mb-2 font-[Comic_Sans_MS,sans-serif]">
                {feature.title}
              </h3>
              
              <p className="text-blue-900 leading-relaxed text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}