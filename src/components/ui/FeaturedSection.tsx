"use client";
import React from "react";

interface Feature {
  imageSrc: string;
  text: string;
}

interface FeaturedSectionProps {
  title: string;
  features: Feature[];
}

export default function FeaturedSection({ title, features }: FeaturedSectionProps) {
  return (
    <section className="py-16 bg-purple-300">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-gray-100 mb-12 border-b-2 border-gray-200 pb-4">
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center">
              <img
                className="mask mask-pentagon w-48 h-48 object-cover"
                src={feature.imageSrc}
                alt={`Feature ${index + 1}`}
              />
              <p className="mt-4 text-lg text-gray-700">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}