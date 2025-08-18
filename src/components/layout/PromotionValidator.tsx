// components/PromotionValidator.tsx
'use client';

import React, { useState } from 'react';
import CodesPromoService from '@/services/codes-promo-service';

interface PromotionValidatorProps {
  onValidationResult?: (result: any) => void;
}

const PromotionValidator: React.FC<PromotionValidatorProps> = ({ onValidationResult }) => {
  const [code, setCode] = useState('');
  const [montantPanier, setMontantPanier] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleValidation = async () => {
    if (!code.trim()) return;

    setLoading(true);
    try {
      const validationResult = await CodesPromoService.validerCode(code, {
        montantPanier: montantPanier > 0 ? montantPanier : undefined
      });
      
      setResult(validationResult);
      if (onValidationResult) {
        onValidationResult(validationResult);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setResult({
        valide: false,
        message: message
      });
    }
    setLoading(false);
  };

  const handleReset = () => {
    setCode('');
    setMontantPanier(0);
    setResult(null);
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Testeur de Code Promo</h2>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Code promo</span>
          </label>
          <input
            type="text"
            className="input input-bordered"
            placeholder="Saisir le code promo"
            value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
           onKeyPress={(e) => e.key === 'Enter' && handleValidation()}
         />
       </div>

       <div className="form-control">
         <label className="label">
           <span className="label-text">Montant du panier (TND)</span>
         </label>
         <input
           type="number"
           className="input input-bordered"
           placeholder="0.00"
           min="0"
           step="0.01"
           value={montantPanier || ''}
           onChange={(e) => setMontantPanier(parseFloat(e.target.value) || 0)}
         />
       </div>

       <div className="card-actions justify-end gap-2">
         <button 
           className="btn btn-ghost" 
           onClick={handleReset}
           disabled={loading}
         >
           Reset
         </button>
         <button 
           className="btn btn-primary" 
           onClick={handleValidation}
           disabled={!code.trim() || loading}
         >
           {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Valider'}
         </button>
       </div>

       {result && (
         <div className={`alert ${result.valide ? 'alert-success' : 'alert-error'} mt-4`}>
           <div>
             <h3 className="font-bold">
               {result.valide ? '✅ Code valide' : '❌ Code invalide'}
             </h3>
             <p>{result.message}</p>
             
             {result.valide && result.data && (
               <div className="mt-2 text-sm">
                 <div><strong>Promotion:</strong> {result.data.promotion.nom}</div>
                 <div><strong>Type:</strong> {result.data.promotion.typePromotion}</div>
                 <div><strong>Valeur:</strong> {result.data.promotion.valeurPromotion}
                   {result.data.promotion.typePromotion === 'pourcentage' ? '%' : 
                    result.data.promotion.typePromotion === 'montant_fixe' ? ' TND' : ''}
                 </div>
                 {result.data.promotion.description && (
                   <div><strong>Description:</strong> {result.data.promotion.description}</div>
                 )}
               </div>
             )}

             {!result.valide && result.montantMinimum && (
               <div className="mt-2 text-sm">
                 <strong>Montant minimum requis:</strong> {result.montantMinimum} TND
               </div>
             )}
           </div>
         </div>
       )}
     </div>
   </div>
 );
};

export default PromotionValidator;