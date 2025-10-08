"use client";
import React, { useState, useEffect, useRef } from 'react';

interface DualRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  minValue: number;
  maxValue: number;
  onChange: (min: number, max: number) => void;
  label: string;
  color: string;
  valueFormatter: (value: number) => string;
}

const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  min,
  max,
  step = 1,
  minValue,
  maxValue,
  onChange,
  label,
  color,
  valueFormatter
}) => {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getPercentage = (value: number) => ((value - min) / (max - min)) * 100;

  const getValueFromPosition = (position: number, sliderWidth: number) => {
    const percentage = Math.max(0, Math.min(100, (position / sliderWidth) * 100));
    const value = min + (percentage / 100) * (max - min);
    return Math.round(value / step) * step;
  };

  const handleMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(type);
  };

  const handleTouchStart = (type: 'min' | 'max') => (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(type);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const position = e.clientX - rect.left;
    const newValue = getValueFromPosition(position, rect.width);

    if (isDragging === 'min') {
      const clampedValue = Math.max(min, Math.min(newValue, maxValue));
      onChange(clampedValue, maxValue);
    } else {
      const clampedValue = Math.min(max, Math.max(newValue, minValue));
      onChange(minValue, clampedValue);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    // Prend le premier doigt (pour le multi-touch)
    const touch = e.touches[0];
    const rect = sliderRef.current.getBoundingClientRect();
    const position = touch.clientX - rect.left;
    const newValue = getValueFromPosition(position, rect.width);

    if (isDragging === 'min') {
      const clampedValue = Math.max(min, Math.min(newValue, maxValue));
      onChange(clampedValue, maxValue);
    } else {
      const clampedValue = Math.min(max, Math.max(newValue, minValue));
      onChange(minValue, clampedValue);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const handleTouchEnd = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.body.style.userSelect = '';
    };
    // eslint-disable-next-line
  }, [isDragging, minValue, maxValue]);

  const minPercent = getPercentage(minValue);
  const maxPercent = getPercentage(maxValue);

  return (
    <div className="mb-6">
      <h3 className={`text-sm font-semibold mb-3 text-${color}-600`}>{label}</h3>
      
      <div className="px-4">
        <div className="flex justify-between mb-3 text-sm text-gray-700 font-medium">
          <span>{valueFormatter(minValue)}</span>
          <span>{valueFormatter(maxValue)}</span>
        </div>
        
        <div 
          ref={sliderRef}
          className="relative h-8 mb-6 cursor-pointer"
        >
          {/* Track background */}
          <div className="absolute w-full h-2 bg-gray-200 rounded-full top-3"></div>
          
          {/* Active track */}
          <div 
            className={`absolute h-2 bg-${color}-500 rounded-full top-3 transition-all duration-150`}
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`
            }}
          />

          {/* Min thumb */}
          <div
            className={`absolute w-6 h-6 bg-white border-3 border-${color}-500 rounded-full shadow-lg cursor-pointer transform -translate-x-3 top-1 transition-all duration-150 hover:scale-110 ${isDragging === 'min' ? 'scale-110 shadow-xl' : ''}`}
            style={{ left: `${minPercent}%` }}
            onMouseDown={handleMouseDown('min')}
            onTouchStart={handleTouchStart('min')}
          >
            <div className={`w-2 h-2 bg-${color}-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`} />
          </div>
          
          {/* Max thumb */}
          <div
            className={`absolute w-6 h-6 bg-white border-3 border-${color}-500 rounded-full shadow-lg cursor-pointer transform -translate-x-3 top-1 transition-all duration-150 hover:scale-110 ${isDragging === 'max' ? 'scale-110 shadow-xl' : ''}`}
            style={{ left: `${maxPercent}%` }}
            onMouseDown={handleMouseDown('max')}
            onTouchStart={handleTouchStart('max')}
          >
            <div className={`w-2 h-2 bg-${color}-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DualRangeSlider;