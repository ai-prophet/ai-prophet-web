'use client';

import React from 'react';

interface LiveStatusIndicatorProps {
  closeTime: string | null;
  eventResult: string | { [key: string]: number } | null;
  variant?: 'default' | 'badge';
  size?: 'sm' | 'md';
}

export default function LiveStatusIndicator({ 
  closeTime, 
  eventResult, 
  variant = 'default',
  size = 'md'
}: LiveStatusIndicatorProps) {
  // Check if event closed more than a month ago
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const closedOverAMonthAgo = closeTime ? new Date(closeTime) < oneMonthAgo : false;
  
  const isLive = (!eventResult || eventResult === 'null') && !closedOverAMonthAgo;
  const isOpen = closeTime ? new Date(closeTime) > new Date() : true;
  const showLive = isLive && isOpen;
  const isResolved = eventResult && eventResult !== 'null';

  // Size classes
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  if (variant === 'badge') {
    return showLive ? (
      <div className="flex items-center gap-2">
        <div className={`${dotSize} bg-green-500 rounded-full animate-pulse`}></div>
        <span className={`text-green-600 font-medium ${textSize}`}>
          LIVE
        </span>
      </div>
    ) : (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          isResolved
            ? "bg-heat-green text-primary"
            : "bg-heat-red text-primary"
        }`}
      >
        {isResolved ? "Resolved" : "Closed"}
      </span>
    );
  }

  // Default variant
  return showLive ? (
    <>
      <div className={`${dotSize} bg-green-500 rounded-full animate-pulse`}></div>
      <span className="text-green-600 font-medium">LIVE</span>
    </>
  ) : (
    <span className="text-primary">CLOSED</span>
  );
} 