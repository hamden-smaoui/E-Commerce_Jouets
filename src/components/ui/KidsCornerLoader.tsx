'use client';
import React from 'react';

interface KidsCornerLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  showMessage?: boolean;
}

const KidsCornerLoader: React.FC<KidsCornerLoaderProps> = ({ 
  message = "Chargement...", 
  size = 'md',
  showMessage = true 
}) => {
  const sizeConfig = {
    sm: { container: 80, orbit: 32, shape: 16, triangle: 12 },
    md: { container: 128, orbit: 48, shape: 24, triangle: 18 },
    lg: { container: 176, orbit: 68, shape: 32, triangle: 24 }
  };

  const config = sizeConfig[size];

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div 
        className="relative flex items-center justify-center"
        style={{ width: config.container, height: config.container }}
      >
        {/* Green Triangle */}
        <div 
          className="absolute"
          style={{
            animation: 'spin-orbit 2s linear infinite',
            '--orbit-radius': `${config.orbit}px`
          } as React.CSSProperties}
        >
          <div 
            style={{
              width: 0,
              height: 0,
              borderLeft: `${config.triangle}px solid transparent`,
              borderRight: `${config.triangle}px solid transparent`,
              borderBottom: `${config.triangle * 1.5}px solid #7ED4AD`
            }}
          />
        </div>

        {/* Yellow Circle */}
        <div 
          className="absolute bg-yellow-400 rounded-full"
          style={{
            width: config.shape,
            height: config.shape,
            animation: 'spin-orbit 2s linear infinite',
            animationDelay: '0.66s',
            '--orbit-radius': `${config.orbit}px`
          } as React.CSSProperties}
        />

        {/* Blue Square */}
        <div 
          className="absolute bg-blue-400 rounded-sm"
          style={{
            width: config.shape,
            height: config.shape,
            animation: 'spin-orbit 2s linear infinite',
            animationDelay: '1.33s',
            '--orbit-radius': `${config.orbit}px`
          } as React.CSSProperties}
        />
      </div>

      {showMessage && (
        <div className="text-center">
          <p className={`${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'} text-gray-600 font-medium animate-pulse`}>
            {message}
          </p>
          <div className="flex space-x-1 justify-center mt-2">
            <div className="w-2 h-2 bg-[#7ED4AD] rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KidsCornerLoader;