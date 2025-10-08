"use client";
import React from 'react';
import { ClockIcon } from '@heroicons/react/24/solid';
import { useCountdownTimer } from '@/hooks/useCountdownTimer';

interface CountdownTimerProps {
  endTime: Date;
  onExpired?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ endTime, onExpired }) => {
  const { hours, minutes, seconds, isExpired } = useCountdownTimer(endTime);

  React.useEffect(() => {
    if (isExpired && onExpired) {
      onExpired();
    }
  }, [isExpired, onExpired]);

  if (isExpired) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-2 justify-center rounded-xl bg-red-50 px-4 py-3 border border-red-200 shadow font-bold text-red-600 text-center">
        <ClockIcon className="w-6 h-6 flex-shrink-0" />
        <span className="text-base sm:text-lg">Délai d'annulation expiré</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 justify-center rounded-xl bg-orange-50 px-4 py-3 border border-orange-200 shadow text-orange-700 text-center">
      <ClockIcon className="w-6 h-6 flex-shrink-0" />
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <span className="font-bold text-base sm:text-lg">Temps restant pour annuler :</span>
        <div className="bg-orange-100 px-3 py-1 rounded-lg font-mono font-bold text-lg sm:text-xl tracking-widest shadow-inner">
          {String(hours).padStart(2, '0')}:
          {String(minutes).padStart(2, '0')}:
          {String(seconds).padStart(2, '0')}
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;