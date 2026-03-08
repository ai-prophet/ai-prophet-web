'use client';

import Image from 'next/image';
import { useState } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  text?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-12 h-12', 
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
};

export default function LoadingSpinner({ 
  size = 'md', 
  className = '', 
  showText = false,
  text = 'Loading...'
}: LoadingSpinnerProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {!imageError ? (
        <Image
          src="/assets/loading.gif"
          alt="Loading..."
          width={size === 'sm' ? 24 : size === 'md' ? 48 : size === 'lg' ? 64 : 96}
          height={size === 'sm' ? 24 : size === 'md' ? 48 : size === 'lg' ? 64 : 96}
          className={`${sizeClasses[size]} object-contain`}
          onError={handleImageError}
          unoptimized // For GIF animations
          priority
        />
      ) : (
        // Fallback CSS spinner if GIF fails to load
        <div 
          className={`${sizeClasses[size]} animate-spin rounded-full border-b-2 border-accent-primary`}
        />
      )}
      
      {showText && (
        <p className="text-text-primary mt-3 text-sm font-medium">
          {text}
        </p>
      )}
    </div>
  );
} 