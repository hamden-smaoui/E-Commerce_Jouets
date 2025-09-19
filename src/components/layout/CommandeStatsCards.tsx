// components/commandes/CommandeStatsCards.tsx
'use client';

import React from 'react';
import { CommandeStats } from '@/services/commandes-service';

interface CommandeStatsCardsProps {
  stats: CommandeStats[];
  loading?: boolean;
}

const CommandeStatsCards: React.FC<CommandeStatsCardsProps> = ({ stats, loading }) => {
  const formatPrice = (prix: any): string => {
    if (prix === null || prix === undefined || prix === '' || isNaN(Number(prix))) {
      return '0.00 TND';
    }
    return `${Number(prix).toFixed(2)} TND`;
  };

  const getStatusBadge = (statut: string): string => {
    const badges = {
      'en attente': 'badge-warning',
      'en traitement': 'badge-info',
      'expédiée': 'badge-primary',
      'livrée': 'badge-success',
      'annulée': 'badge-error',
    };
    return badges[statut as keyof typeof badges] || 'badge-neutral';
  };

  const getStatusIcon = (statut: string): string => {
    const icons = {
      'en attente': '⏳',
      'en traitement': '🔄',
      'expédiée': '📦',
      'livrée': '✅',
      'annulée': '❌',
    };
    return icons[statut as keyof typeof icons] || '📊';
  };

  const getStatusColor = (statut: string): string => {
    const colors = {
      'en attente': 'text-warning',
      'en traitement': 'text-info',
      'expédiée': 'text-primary',
      'livrée': 'text-success',
      'annulée': 'text-error',
    };
    return colors[statut as keyof typeof colors] || 'text-neutral';
  };

  if (loading) {
    return (
      <div className="mb-6">
        {/* Desktop Loading */}
        <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="stat bg-base-100 shadow rounded-lg animate-pulse">
              <div className="stat-title h-4 bg-base-300 rounded mb-2"></div>
              <div className="stat-value h-8 bg-base-300 rounded mb-2"></div>
              <div className="stat-desc h-3 bg-base-300 rounded"></div>
            </div>
          ))}
        </div>

        {/* Mobile Loading */}
        <div className="sm:hidden">
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-base-300">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex-shrink-0 w-48 bg-base-100 shadow rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-base-300 rounded mb-3"></div>
                <div className="h-8 bg-base-300 rounded mb-2"></div>
                <div className="h-3 bg-base-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* Desktop Grid */}
      <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="stat bg-base-100 shadow rounded-lg hover:shadow-lg transition-shadow duration-200">
            <div className="stat-figure text-2xl opacity-80">
              {getStatusIcon(stat.statut)}
            </div>
            <div className={`stat-title text-xs font-medium ${getStatusColor(stat.statut)}`}>
              {stat.statut.charAt(0).toUpperCase() + stat.statut.slice(1)}
            </div>
            <div className="stat-value text-2xl lg:text-3xl font-bold">{stat.count}</div>
            <div className="stat-desc text-xs opacity-70">{formatPrice(stat.total)}</div>
          </div>
        ))}
      </div>

      {/* Mobile Horizontal Scroll */}
      <div className="sm:hidden">
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-base-300 snap-x snap-mandatory">
          {stats.map((stat, index) => (
            <div key={index} className="flex-shrink-0 w-38 bg-base-100 shadow rounded-lg p-4 hover:shadow-lg transition-shadow duration-200 snap-center">
              <div className="flex items-center justify-between mb-3">
                <div className={`text-xs font-medium ${getStatusColor(stat.statut)} uppercase tracking-wide`}>
                  {stat.statut.charAt(0).toUpperCase() + stat.statut.slice(1)}
                </div>
                <div className="text-xl opacity-80">
                  {getStatusIcon(stat.statut)}
                </div>
              </div>
              <div className="text-3xl font-bold mb-2">{stat.count}</div>
              <div className="text-xs opacity-70 font-medium">{formatPrice(stat.total)}</div>
              
              
            </div>
          ))}
        </div>
        
        {/* Scroll indicator */}
        <div className="flex justify-center mt-2">
          <div className="flex space-x-1">
            {stats.map((_, index) => (
              <div key={index} className="w-2 h-2 bg-base-300 rounded-full"></div>
            ))}
          </div>
        </div>
        
      </div>

     
    </div>
  );
};

export default CommandeStatsCards;