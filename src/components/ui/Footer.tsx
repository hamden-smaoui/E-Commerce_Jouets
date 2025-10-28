"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import NewsletterSubscribe from '@/components/layout/NewsletterSubscribe';
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import CategoriesService, { Categorie } from "@/services/categories-service";

export default function Footer() {
  const { storeInfo } = useStoreInfo();
  const [categories, setCategories] = useState<Categorie[]>([]);

  // Logo loading states
  const [logoLoading, setLogoLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    CategoriesService.getAllCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  return (
    <footer className="bg-gray-800 text-white font-[Comic_Sans_MS,sans-serif] pt-12">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 text-center md:text-left">

          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-6 flex justify-center md:justify-start">
              <div className="relative w-48 h-36 drop-shadow-2xl">
                {logoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 bg-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
                  </div>
                )}
                {storeInfo?.logo2 && !logoError ? (
                  <Image
                    src={`${storeInfo.logo2}`}
                    alt={storeInfo.nom || "Logo"}
                    fill
                    className={`object-contain transition-opacity duration-500 ${logoLoading ? "opacity-0" : "opacity-100"}`}
                    priority
                    onLoad={() => setLogoLoading(false)}
                    onError={() => {
                      setLogoLoading(false);
                      setLogoError(true);
                    }}
                  />
                ) : (
                  !logoLoading && (
                    <img
                      className="w-48 h-36 object-contain drop-shadow-2xl transition-opacity duration-500 opacity-100"
                      src="/images/logoBamby.png"
                      alt="Bamby Joy Logo"
                    />
                  )
                )}
              </div>
            </div>
            {/* Contact Info */}
            <div className="space-y-3 bg-white/10 rounded-xl p-4 shadow">
              <div className="flex items-center justify-center md:justify-start text-purple-200">
                <MapPinIcon className="w-5 h-5 mr-3 text-pink-300" />
                <span className="text-sm font-semibold">
                  {storeInfo?.adresse ?
                    `${storeInfo.adresse}, ${storeInfo.ville || ''}` :
                    '123 Avenue des Jouets, Tunis'
                  }
                </span>
              </div>
              <div className="flex items-center justify-center md:justify-start text-purple-200">
                <PhoneIcon className="w-5 h-5 mr-3 text-yellow-300" />
                <span className="text-sm font-semibold">
                  {storeInfo?.telephonePrincipal || '+216 XX XXX XXX'}
                </span>
              </div>
              <div className="flex items-center justify-center md:justify-start text-purple-200">
                <EnvelopeIcon className="w-5 h-5 mr-3 text-blue-300" />
                <span className="text-sm font-semibold">
                  {storeInfo?.emailPrincipal || 'contact@toyuniverse.tn'}
                </span>
              </div>
              <div className="flex items-center justify-center md:justify-start text-purple-200">
                <ClockIcon className="w-5 h-5 mr-3 text-purple-300" />
                <span className="text-sm font-semibold">
                  {storeInfo?.heuresOuverture || 'Lun-Sam: 9h-19h'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-extrabold mb-6 text-pink-400 drop-shadow-lg">
              Liens Rapides
            </h3>
            <ul className="space-y-3">
              <li><a href="site/contact" className="text-purple-100 hover:text-pink-400 font-semibold transition-colors duration-300">À Propos</a></li>
              <li><a href="site/products" className="text-purple-100 hover:text-pink-400 font-semibold transition-colors duration-300">Nos Produits</a></li>
              <li><a href="site/products" className="text-purple-100 hover:text-pink-400 font-semibold transition-colors duration-300">Promotions</a></li>
              <li><a href="site/contact" className="text-purple-100 hover:text-pink-400 font-semibold transition-colors duration-300">Contact</a></li>
            </ul>
          </div>

          {/* Categories dynamiques */}
          <div>
            <h3 className="text-xl font-extrabold mb-6 text-yellow-300 drop-shadow-lg">
              Catégories
            </h3>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat.idCategorie}>
                  <a
                    href={`/products?categories=${cat.idCategorie}`}
                    className="text-purple-100 hover:text-yellow-300 font-semibold transition-colors duration-300"
                  >
                    {cat.nom}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div>
            <h3 className="text-xl font-extrabold mb-6 text-blue-300 drop-shadow-lg">
              Newsletter
            </h3>
            <p className="text-purple-100 mb-4 text-base">
              Inscrivez-vous pour recevoir nos dernières offres et nouveautés.
            </p>
            <NewsletterSubscribe />
            {/* Social Media */}
            <div>
              <h4 className="text-md font-bold mb-4 text-purple-300 drop-shadow-lg">Suivez-nous</h4>
              <div className="flex space-x-4 justify-center md:justify-start">
                {storeInfo?.urlFacebook && !!storeInfo.urlFacebook.trim() && (
                  <a
                    href={storeInfo.urlFacebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-pink-400 hover:bg-pink-500 rounded-full flex items-center justify-center transition-all duration-300 group shadow"
                    aria-label="Facebook"
                  >
                    <svg className="w-5 h-5 text-white group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {storeInfo?.urlInstagram && !!storeInfo.urlInstagram.trim() && (
                  <a
                    href={storeInfo.urlInstagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-yellow-300 hover:bg-yellow-400 rounded-full flex items-center justify-center transition-all duration-300 group shadow"
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5 text-pink-700 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
                {storeInfo?.urlYoutube && !!storeInfo.urlYoutube.trim() && (
                  <a
                    href={storeInfo.urlYoutube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-blue-400 hover:bg-blue-500 rounded-full flex items-center justify-center transition-all duration-300 group shadow"
                    aria-label="YouTube"
                  >
                    <svg className="w-5 h-5 text-white group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
                {storeInfo?.urlTiktok && !!storeInfo.urlTiktok.trim() && (
                  <a
                    href={storeInfo.urlTiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-black hover:bg-gray-900 rounded-full flex items-center justify-center transition-all duration-300 group shadow"
                    aria-label="TikTok"
                  >
                    {/* TikTok SVG */}
                    <svg className="w-5 h-5 text-white group-hover:text-pink-400" viewBox="0 0 32 32" fill="currentColor">
                      <path d="M20.4 2h-4.35v19.12c0 1.41-1.15 2.56-2.56 2.56s-2.56-1.15-2.56-2.56 1.15-2.56 2.56-2.56c.2 0 .4.03.59.07v-4.37c-.19-.03-.39-.05-.59-.05-3.81 0-6.9 3.09-6.9 6.9s3.09 6.9 6.9 6.9 6.9-3.09 6.9-6.9V10.48c1.24.77 2.69 1.22 4.25 1.22v-4.04c-.65 0-1.28-.1-1.87-.29-.82-.27-1.56-.69-2.18-1.25-.62-.56-1.12-1.23-1.45-2.01-.22-.48-.37-.99-.45-1.51z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700 bg-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-center md:text-left">
            <div className="text-purple-200 text-sm font-semibold">
              © 2024 {storeInfo?.nom || 'Bamby Joy'}. Tous droits réservés.
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-6 text-sm">
              <a href="/privacy-policy" className="text-purple-200 hover:text-pink-400 transition-colors duration-300 font-semibold">
                Politique de Confidentialité
              </a>
              <a href="/mentions-legales" className="text-purple-200 hover:text-pink-400 transition-colors duration-300 font-semibold">
                  Mentions Legales
              </a>
              <a href="/cookie-policy" className="text-purple-200 hover:text-pink-400 transition-colors duration-300 font-semibold">
                Politique des Cookies
              </a>
              
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}