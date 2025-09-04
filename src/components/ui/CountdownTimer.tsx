// components/ui/CountdownTimer.tsx
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-red-600">
        <ClockIcon className="w-5 h-5 flex-shrink-0" />
        <span className="font-bold text-sm sm:text-base">Délai d'annulation expiré</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-orange-600">
      <ClockIcon className="w-5 h-5 flex-shrink-0" />
      <div className="flex flex-col sm:flex-row sm:items-center gap-1">
        <span className="font-bold text-sm sm:text-base">Temps restant pour annuler:</span>
        <div className="bg-orange-100 px-2 sm:px-3 py-1 rounded-lg font-mono font-bold text-base sm:text-lg inline-block">
          {String(hours).padStart(2, '0')}:
          {String(minutes).padStart(2, '0')}:
          {String(seconds).padStart(2, '0')}
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;