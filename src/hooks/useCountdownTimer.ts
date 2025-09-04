// hooks/useCountdownTimer.ts
import { useState, useEffect, useCallback } from 'react';

interface CountdownTimer {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  totalSeconds: number;
}

export const useCountdownTimer = (endTime: Date) => {
  const calculateTimeLeft = useCallback((): CountdownTimer => {
    const now = new Date().getTime();
    const targetTime = endTime.getTime();
    const difference = targetTime - now;

    if (difference <= 0) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        totalSeconds: 0
      };
    }

    const totalSeconds = Math.floor(difference / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours,
      minutes,
      seconds,
      isExpired: false,
      totalSeconds
    };
  }, [endTime]);

  const [timeLeft, setTimeLeft] = useState<CountdownTimer>(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.isExpired) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  return timeLeft;
};