'use client';

import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import commandesService, { CommandeStats } from '@/services/commandes-service';
import produitsService, { BestSellingProduit } from '@/services/produits-service';
import usersService from '@/services/users-service';
import { useSession } from "next-auth/react";


// Interface pour les données du dashboard
interface DashboardData {
  totalSales: number;
  totalOrders: number;
  uniqueCustomers: number;
  averageOrderValue: number;
  activeProducts: number;
  outOfStockProducts: number;
  customerReviews: number;
  pendingOrders: number;
  returnRequests: number;
  conversionRate: number;
  visitorTraffic: number;
}

const Dashboard: NextPage = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSales: 0,
    totalOrders: 0,
    uniqueCustomers: 0,
    averageOrderValue: 0,
    activeProducts: 0,
    outOfStockProducts: 0,
    customerReviews: 0,
    pendingOrders: 0,
    returnRequests: 0,
    conversionRate: 0,
    visitorTraffic: 0,
  });

  const [bestSellingProducts, setBestSellingProducts] = useState<BestSellingProduit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

const { data: session, status } = useSession();
const token = session?.customToken;
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Récupération parallèle des données
        const [
          commandeStats,
          allCommandes,
          allProducts,
          allUsers,
          bestSellers
        ] = await Promise.all([
          commandesService.getCommandeStats(token),
          commandesService.getAllCommandes({ limit: 1000 },token), // Ajustez selon vos besoins
          produitsService.getAllProduits(token),
          usersService.getAllUsers(token),
          produitsService.getTop10BestSellingProduits(token)
        ]);

        // Calcul des statistiques des commandes
        const totalSales = commandeStats.reduce((sum: number, stat: CommandeStats) => sum + stat.total, 0);
        const totalOrders = commandeStats.reduce((sum: number, stat: CommandeStats) => sum + stat.count, 0);
        const pendingOrders = commandeStats.find((stat: CommandeStats) => stat.statut === 'en attente')?.count || 0;
        const returnRequests = commandeStats.find((stat: CommandeStats) => stat.statut === 'retournée')?.count || 0;

        // Calcul des statistiques produits
        const activeProducts = allProducts.filter(product => product.quantiteStock > 0).length;
        const outOfStockProducts = allProducts.filter(product => product.quantiteStock === 0).length;

        // Calcul des clients uniques
        const uniqueCustomers = allUsers.filter(user => user.role === 'client').length;

        // Calcul de la valeur moyenne des commandes
        const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

        // Pour ces données, vous devrez peut-être les calculer différemment selon votre backend
        const customerReviews = 85; // À remplacer par une vraie API
        const visitorTraffic = 2000; // À remplacer par une vraie API de analytics
        const conversionRate = totalOrders > 0 ? (totalOrders / visitorTraffic) * 100 : 0;

        setDashboardData({
          totalSales,
          totalOrders,
          uniqueCustomers,
          averageOrderValue,
          activeProducts,
          outOfStockProducts,
          customerReviews,
          pendingOrders,
          returnRequests,
          conversionRate,
          visitorTraffic,
        });

        setBestSellingProducts(bestSellers);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        console.error('Erreur lors du chargement des données du dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-96">
          <div className="loading loading-spinner loading-lg"></div>
          <span className="ml-2">Chargement du dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Erreur: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen    container mx-auto p-6">
      {/* Titre du Dashboard */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard E-commerce</h1>
        <p className="text-gray-600">Vue d'ensemble de votre boutique</p>
      </div>

      {/* Statistiques Financières */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-6 border-2 border-primary">
        <div className="stat">
          <div className="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-title">Ventes Totales</div>
          <div className="stat-value text-primary">${dashboardData.totalSales.toFixed(2)}</div>
          <div className="stat-desc">Chiffre d'affaires total</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="stat-title">Commandes Totales</div>
          <div className="stat-value">{dashboardData.totalOrders}</div>
          <div className="stat-desc">Achats finalisés</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-success">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v11.494m0 0a2.373 2.373 0 004.746 0M12 17.747a2.373 2.373 0 01-4.746 0M12 17.747v-2.247M6.253 15.374V6.253m0 0L3.5 8.5m2.753-2.247L8.5 3.5M17.747 8.626V17.747m0 0l2.753-2.247m-2.753 2.247l-2.247 2.753" />
            </svg>
          </div>
          <div className="stat-title">Panier Moyen</div>
          <div className="stat-value">${dashboardData.averageOrderValue.toFixed(2)}</div>
          <div className="stat-desc">Par transaction</div>
        </div>
      </div>

      {/* Statistiques Clients et Produits */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-6 border-2 border-primary">
        <div className="stat">
          <div className="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="stat-title">Clients Uniques</div>
          <div className="stat-value">{dashboardData.uniqueCustomers}</div>
          <div className="stat-desc">Acheteurs totaux</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-title">Produits Actifs</div>
          <div className="stat-value">{dashboardData.activeProducts}</div>
          <div className="stat-desc">{dashboardData.outOfStockProducts} en rupture</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-success">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div className="stat-title">Avis Clients</div>
          <div className="stat-value">{dashboardData.customerReviews}</div>
          <div className="stat-desc">Commentaires reçus</div>
        </div>
      </div>

      {/* Métriques Clés et Activité */}
      <div className="flex flex-col lg:flex-row lg:space-x-6 mb-6">
        {/* Métriques Clés */}
        <div className="w-full lg:w-1/2 mb-6 lg:mb-0">
          <h2 className="text-2xl font-semibold mb-4">Métriques Clés</h2>
          <div className="stats shadow w-full border-2 border-primary">
            <div className="stat">
              <div className="stat-figure text-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="stat-title">Taux de Conversion</div>
              <div className="stat-value">{dashboardData.conversionRate.toFixed(1)}%</div>
              <div className="stat-desc">{dashboardData.totalOrders} commandes / {dashboardData.visitorTraffic} visites</div>
            </div>
          </div>
        </div>

        {/* Activité Visiteurs */}
        <div className="w-full lg:w-1/2">
          <h2 className="text-2xl font-semibold mb-4">Activité Visiteurs</h2>
          <div className="stats shadow w-full border-2 border-primary">
            <div className="stat">
              <div className="stat-figure text-accent">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="stat-title">Trafic Visiteurs</div>
              <div className="stat-value">{dashboardData.visitorTraffic}</div>
              <div className="stat-desc">Visites totales du site</div>
            </div>
          </div>
        </div>
      </div>

      {/* Gestion des Commandes */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-6 border-2 border-primary">
        <div className="stat">
          <div className="stat-figure text-warning">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="stat-title">Commandes en Attente</div>
          <div className="stat-value">{dashboardData.pendingOrders}</div>
          <div className="stat-desc">À traiter</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div className="stat-title">Demandes de Retour</div>
          <div className="stat-value">{dashboardData.returnRequests}</div>
          <div className="stat-desc">En cours</div>
        </div>
      </div>

      {/* Produits les Plus Vendus */}
      {bestSellingProducts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Top 10 des Meilleures Ventes</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Prix</th>
                  <th>Stock</th>
                  <th>Total Vendu</th>
                </tr>
              </thead>
              <tbody>
                {bestSellingProducts.map((product, index) => (
                  <tr key={product.idProduit}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="badge badge-primary">{index + 1}</div>
                        <div>
                          <div className="font-bold">{product.nom}</div>
                          <div className="text-sm opacity-50">{product.categorie?.nom}</div>
                        </div>
                      </div>
                    </td>
                    <td>${product.prix.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${product.quantiteStock > 0 ? 'badge-success' : 'badge-error'}`}>
                        {product.quantiteStock}
                      </span>
                    </td>
                    <td className="font-bold">{product.totalVendu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;