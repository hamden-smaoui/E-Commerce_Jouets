// hooks/useStoreInfo.ts
"use client";
import { useState, useEffect } from 'react';
import StoreInfoService, { StoreInfo } from '@/services/storeInfo-service';

export const useStoreInfo = () => {
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        setLoading(true);
        const data = await StoreInfoService.getStoreInfo();
        setStoreInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreInfo();
  }, []);

  return { storeInfo, loading, error };
};