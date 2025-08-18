// hooks/usePermissions.ts
import { useState, useEffect } from 'react';

export const usePromotionPermissions = () => {
  const [permissions, setPermissions] = useState({
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canToggleStatus: true,
    canViewStats: true,
    canGenerateCodes: true,
    canExport: true,
  });

  // Logique pour récupérer les permissions basées sur l'utilisateur connecté
  useEffect(() => {
    // Récupérer les permissions depuis l'API ou le contexte utilisateur
    // setPermissions(userPermissions);
  }, []);

  return permissions;
};