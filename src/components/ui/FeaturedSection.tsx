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
    <section className="py-20 bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            {title}
          </h2>
          <div className="w-24 h-1 bg-purple-600 mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center group"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-300">
                <div className="w-10 h-10 text-purple-600 group-hover:text-purple-700 transition-colors duration-300">
                  {feature.icon}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}