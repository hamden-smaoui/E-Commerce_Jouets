'use client';

import React from 'react';
import { FactureStats } from '@/services/facture-service';

interface FactureStatsCardsProps {
  stats: FactureStats;
  loading?: boolean;
}

const FactureStatsCards: React.FC<FactureStatsCardsProps> = ({ stats, loading }) => {
  const formatPrice = (prix: any): string => {
    if (prix === null || prix === undefined || prix === '' || isNaN(Number(prix))) {
      return '0.00 TND';
    }
    return `${Number(prix).toFixed(2)} TND`;
  };

  const getStatusIcon = (statut: string): string => {
    const icons = {
      brouillon: '📝',
      envoyée: '📨',
      payée: '✅',
      en_retard: '⏰',
      annulée: '❌',
    };
    return icons[statut as keyof typeof icons] || '📊';
  };

  const getStatusColor = (statut: string): string => {
    const colors = {
      brouillon: 'text-warning',
      envoyée: 'text-info',
      payée: 'text-success',
      en_retard: 'text-error',
      annulée: 'text-neutral',
    };
    return colors[statut as keyof typeof colors] || 'text-neutral';
  };

  const statsData = [
    { statut: 'Total', count: stats.totalFactures, total: stats.montantTotal },
    { statut: 'Payées', count: stats.facturesPayees, total: stats.montantTotal },
    { statut: 'En retard', count: stats.facturesEnRetard, total: 0 },
    { statut: 'Taux de paiement', count: `${stats.tauxPaiement}%`, total: 0 },
  ];

  if (loading) {
    return (
      <div className="mb-6">
        {/* Desktop Loading */}
        <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
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
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-48 bg-base-100 shadow rounded-lg p-4 animate-pulse"
              >
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
      <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className="stat bg-base-100 shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
          >
            <div className="stat-figure text-2xl opacity-80">
              {getStatusIcon(stat.statut.toLowerCase())}
            </div>
            <div className={`stat-title text-xs font-medium ${getStatusColor(stat.statut.toLowerCase())}`}>
              {stat.statut}
            </div>
            <div className="stat-value text-2xl lg:text-3xl font-bold">{stat.count}</div>
            {stat.total > 0 && (
              <div className="stat-desc text-xs opacity-70">{formatPrice(stat.total)}</div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Horizontal Scroll */}
      <div className="sm:hidden">
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-base-300 snap-x snap-mandatory">
          {statsData.map((stat, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-38 bg-base-100 shadow rounded-lg p-4 hover:shadow-lg transition-shadow duration-200 snap-center"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`text-xs font-medium ${getStatusColor(
                    stat.statut.toLowerCase()
                  )} uppercase tracking-wide`}
                >
                  {stat.statut}
                </div>
                <div className="text-xl opacity-80">
                  {getStatusIcon(stat.statut.toLowerCase())}
                </div>
              </div>
              <div className="text-3xl font-bold mb-2">{stat.count}</div>
              {stat.total > 0 && (
                <div className="text-xs opacity-70 font-medium">{formatPrice(stat.total)}</div>
              )}
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="flex justify-center mt-2">
          <div className="flex space-x-1">
            {statsData.map((_, index) => (
              <div key={index} className="w-2 h-2 bg-base-300 rounded-full"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactureStatsCards;