'use client';

import React, { useState, ReactNode } from 'react';
import { getTooltipConfig, TooltipConfig } from '@/config/tooltips';

interface TooltipProps {
  /** The tooltip key from the tooltip configuration, or a custom tooltip config */
  content: string | TooltipConfig;
  /** The element that triggers the tooltip */
  children: ReactNode;
  /** Position of the tooltip relative to the trigger */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Additional CSS classes for styling */
  className?: string;
  /** Delay before showing tooltip (in ms) */
  delay?: number;
}



const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'right',
  className = '',
  delay = 200
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTimeout, setShowTimeout] = useState<NodeJS.Timeout | null>(null);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  // Get tooltip config
  const tooltipConfig = typeof content === 'string' 
    ? getTooltipConfig(content) 
    : content;

  const handleMouseEnter = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
    
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    setShowTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (showTimeout) {
      clearTimeout(showTimeout);
      setShowTimeout(null);
    }
    
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 100);
    
    setHideTimeout(timeout);
  };

  // Position-specific classes
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  // Arrow classes for each position
  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800'
  };

  if (!tooltipConfig) {
    return <>{children}</>;
  }

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-help"
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          className={`absolute z-50 px-4 py-3 text-sm bg-gray-800 text-white rounded-lg shadow-lg max-w-md transition-opacity duration-200 ${positionClasses[position]} ${className}`}
          style={{ minWidth: '300px', maxWidth: '400px' }}
        >
          <div className="font-semibold mb-2 flex items-center gap-1">
            <span>💡</span>
            {tooltipConfig.title}
          </div>
          <div 
            className="text-gray-200 leading-snug"
            dangerouslySetInnerHTML={{ __html: tooltipConfig.description }}
          />
          
          {/* Tooltip arrow */}
          <div
            className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip; 