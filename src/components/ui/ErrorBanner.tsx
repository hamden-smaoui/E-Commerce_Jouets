"use client";
import React from "react";

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry, className }) => (
  <div className={`bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg mb-4 flex items-center justify-between ${className || ""}`}>
    <span>{message}</span>
    {onRetry && (
      <button className="ml-4 px-3 py-1 bg-red-600 text-white rounded" onClick={onRetry}>
        Réessayer
      </button>
    )}
  </div>
);

export default ErrorBanner;