'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { niceName, isModelConfigured } from "@/config/models";
import LiveStatusIndicator from "@/components/arena/LiveStatusIndicator";

// Add fetchUnsplashImageClient function
const UNSPLASH_ACCESS_KEY = "eEHiw4CWDSz9swFt162d2liFAOYeCuO-QyY9PYGlIpg";

interface UnsplashResponse {
  results: {
    urls: {
      thumb: string;
      regular: string;
      small: string;
      [key: string]: string;
    };
    [key: string]: unknown;
  }[];
  [key: string]: unknown;
}

async function fetchUnsplashImageClient(
  query: string,
): Promise<string | null> {
  try {
    const UNSPLASH_URL = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_ACCESS_KEY}`;

    const response = await fetch(UNSPLASH_URL);
    if (!response.ok) {
      return "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f";
    }

    const data = (await response.json()) as UnsplashResponse;
    if (data.results.length === 0) {
      console.log("No images found for:", query);
      return null;
    }

    return data.results[0].urls.thumb;
  } catch (error) {
    console.error("Error fetching image:", error);
    return "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f";
  }
}

export interface Event {
  event_ticker: string;
  series_ticker: string;
  title?: string;
  question?: string;
  topic: string;
  close_time: string | null;
  event_result: string | null;
  markets: string;
  options?: string[];
  top_markets?: Array<{
    market: string;
    avg_probability: number;
    predictors: Array<{
      predictor_name: string;
      probability: number;
    }>;
  }>;
}

interface EventCardProps {
  event: Event;
  imageUrl?: string;
  index?: number;
}

export default function EventCard({ event, imageUrl, index = 0 }: EventCardProps) {
  const [image, setImage] = useState<string | null>(imageUrl || null);
  const [isVisible, setIsVisible] = useState(false);

  // Trigger animation after component mounts
  useEffect(() => {
    // Skip animation for negative indices (existing cards from load more)
    if (index < 0) {
      setIsVisible(true);
      return;
    }
    
    // For initial load (first 30 cards), use staggered animation
    // For load more cards (index >= 30), use minimal delay to avoid long waits
    const delay = index < 30 ? index * 75 : 50; // Max 50ms delay for load more cards
    
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [index]);

  // Fetch the image if not provided
  useEffect(() => {
    const loadImage = async () => {
      if (!imageUrl) {
        const displayTitle = event.title || event.question || event.event_ticker;
        const fetchedImage = await fetchUnsplashImageClient(displayTitle);
        setImage(fetchedImage);
      }
    };

    loadImage();
  }, [imageUrl, event.title, event.question, event.event_ticker]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Add a function to format date simply (just date, no time)
  const formatDateSimple = (dateString: string | null) => {
    if (!dateString) return 'No date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Helper function to calculate how close a predictor was to the actual outcome
  const calculateAccuracy = (predictor: any, eventResult: string | null, marketName: string) => {
    if (!eventResult || eventResult === 'null') return predictor.probability;
    
    try {
      let parsedResult: any;
      if (typeof eventResult === 'string') {
        parsedResult = JSON.parse(eventResult);
      } else {
        parsedResult = eventResult;
      }
      
      // Find the actual outcome for this market
      // Look for exact market name match first, then partial matches
      let actualOutcome = null;
      
      // Try exact match first
      if (parsedResult[marketName] !== undefined) {
        actualOutcome = parsedResult[marketName];
      } else {
        // Try to find a partial match (case insensitive)
        const marketLower = marketName.toLowerCase();
        for (const [key, value] of Object.entries(parsedResult)) {
          if (key.toLowerCase().includes(marketLower) || marketLower.includes(key.toLowerCase())) {
            actualOutcome = value;
            break;
          }
        }
      }
      
      if (actualOutcome !== null) {
        // Calculate accuracy based on how close the prediction was to the actual outcome
        // For binary outcomes: actual outcome is 0 or 1, predictor.probability is between 0 and 1
        const accuracy = 1 - Math.abs(actualOutcome - predictor.probability);
        return accuracy;
      }
      
      // If we can't match the market to the result, fall back to probability for sorting
      return predictor.probability;
    } catch {
      // If parsing fails, fall back to probability for sorting
      return predictor.probability;
    }
  };

  const displayTitle = event.title || event.question || event.event_ticker;

  // Determine if event is closed/historical
  const closeTime = event.close_time ? new Date(event.close_time) : null;
  const now = new Date();
  const isClosed = closeTime ? now > closeTime : false;
  const isResolved = event.event_result && event.event_result !== 'null';
  const isClosedOrResolved = isClosed || isResolved;

  return (
    <Link 
      href={`/market/${event.event_ticker}`}
      className={`block bg-bg-primary rounded-2xl shadow-lg shadow-gray-300/60 hover:shadow-xl hover:shadow-gray-400/70 border border-gray-100/50 group min-h-[280px] transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className="relative h-full flex flex-col p-6">
        {/* Content Area */}
        <div className="flex-grow">
          {/* Top row: Image and Title */}
          <div className="flex gap-3 mb-3 items-center">
            <div className="flex-shrink-0">
              <Image
                alt={displayTitle}
                className="object-cover w-14 h-14 rounded-md shadow-sm"
                src={
                  image ||
                  "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=600"
                }
                width={56}
                height={56}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=600";
                }}
              />
            </div>

            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent-primary transition-colors duration-200 line-clamp-2">
                {displayTitle}
              </h3>
            </div>
          </div>

        {isClosedOrResolved ? (
          // Historical/Closed Event Layout
          <div className="space-y-4">
            {/* Result Section */}
            {event.event_result && event.event_result !== 'null' && (
              <div>
                <div className="text-sm text-text-primary">
                  <span className="font-medium">Result: </span>
                  <span className="text-accent-primary font-medium">
                    {(() => {
                      let resultText = '';
                      
                      // Handle both string and object event_result
                      if (typeof event.event_result === 'string') {
                        try {
                          // Try to parse as JSON
                          const parsed = JSON.parse(event.event_result);
                          // Find all winning options (value = 1)
                          const winners = Object.entries(parsed).filter(([, value]) => value === 1);
                          if (winners.length > 0) {
                            resultText = winners.map(([name]) => name).join(', ');
                          } else {
                            resultText = 'Resolved';
                          }
                        } catch {
                          // If parsing fails, return the string as-is
                          resultText = event.event_result;
                        }
                      } else if (typeof event.event_result === 'object' && event.event_result !== null) {
                        // If it's already an object, find all winning options
                        const winners = Object.entries(event.event_result).filter(([, value]) => value === 1);
                        if (winners.length > 0) {
                          resultText = winners.map(([name]) => name).join(', ');
                        } else {
                          resultText = 'Resolved';
                        }
                      } else {
                        resultText = 'Resolved';
                      }
                      
                      // Truncate if too long (keep it to ~40 characters to fit on one line)
                      return resultText.length > 40 ? `${resultText.substring(0, 30)}...` : resultText;
                    })()}
                  </span>
                </div>
                <div className="border-t border-accent-secondary/30 mt-2"></div>
              </div>
            )}

                          {/* Top Predictions Section */}
              {event.top_markets && event.top_markets.length > 0 && (
                <div  className="mb-4">
                  <div className="text-sm font-medium text-text-primary mb-1">
                    {(() => {
                      // Check if there are multiple outcomes in the result
                      if (event.event_result && event.event_result !== 'null') {
                        try {
                          let parsed;
                          if (typeof event.event_result === 'string') {
                            parsed = JSON.parse(event.event_result);
                          } else {
                            parsed = event.event_result;
                          }
                          
                          // Find all winning options (value = 1)
                          const winners = Object.entries(parsed).filter(([, value]) => value === 1);
                          if (winners.length > 0) {
                            const firstOutcome = winners[0][0];
                            return `Top predictions for ${firstOutcome}:`;
                          }
                        } catch {
                          // If parsing fails, fall back to default
                        }
                      }
                      return 'Top Predictions:';
                    })()}
                  </div>
                <div className="space-y-1">
                                     {(() => {
                     // Collect all predictors from all markets
                     const allPredictors = event.top_markets.flatMap(market => 
                       market.predictors
                         .filter(predictor => isModelConfigured(predictor.predictor_name))
                         .map(predictor => ({
                           ...predictor,
                           market: market.market
                         }))
                     );
                     
                     // Deduplicate by predictor_name, keeping highest probability for each model
                     const seenModels = new Set<string>();
                     const uniquePredictors = allPredictors
                       .sort((a, b) => b.probability - a.probability)
                       .filter(predictor => {
                         if (seenModels.has(predictor.predictor_name)) {
                           return false;
                         }
                         seenModels.add(predictor.predictor_name);
                         return true;
                       });
                     
                     // Take top 3 unique models
                     return uniquePredictors
                       .slice(0, 3)
                       .map((predictor, index) => (
                         <div key={index} className="flex justify-between items-center">
                           <span className="text-sm text-text-primary">
                             {niceName(predictor.predictor_name) || predictor.predictor_name}
                           </span>
                           <span className="text-sm font-medium text-accent-primary">
                             {(predictor.probability * 100).toFixed(0)}%
                           </span>
                         </div>
                       ));
                   })()}
                </div>
                <div className="border-accent-secondary/30 mt-2"></div>
              </div>
            )}
          </div>
        ) : (
          // Live Event Layout (existing)
          <>
            {/* Options/Markets */}
            {event.options && event.options.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {event.options.slice(0, 3).map((option, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-accent-secondary/20 text-text-primary"
                    >
                      {option.trim()}
                    </span>
                  ))}
                  {event.options.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-accent-secondary/20 text-text-primary">
                      +{event.options.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Markets - Show first two markets with models */}
            {event.top_markets && event.top_markets.length > 0 && (
              <div className="mb-2">
                {/* Single header for all predictions */}
                <div className="text-sm font-medium text-text-primary mb-2">Top predictions for:</div>
                <div className="border-t border-accent-secondary/30 mb-3"></div>
                
                <div className="space-y-3">
                  {event.top_markets.slice(0, 2).map((market, marketIndex) => (
                    <div key={marketIndex}>
                      {/* Market bucket name */}
                      <div className="text-sm text-text-primary font-medium mb-1">
                        {market.market.length > 25 ? `${market.market.substring(0, 25)}...` : market.market}
                      </div>
                      
                      {/* Live events: Show models sorted by highest probability */}
                      <div className="space-y-1 mb-3">
                        {market.predictors
                          .filter(predictor => isModelConfigured(predictor.predictor_name))
                          .sort((a, b) => b.probability - a.probability)
                          .slice(0, 2)
                          .map((predictor, predIndex) => (
                            <div key={predIndex} className="flex justify-between items-center px-1 py-0">
                              <span className="text-xs text-text-primary">
                                {niceName(predictor.predictor_name) || predictor.predictor_name}
                              </span>
                              <span className="text-xs font-medium text-accent-primary">
                                {(predictor.probability * 100).toFixed(0)}%
                              </span>
                            </div>
                          ))}
                      </div>
                      
                      {/* Divider between markets (except for last one) */}

                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        </div>

        {/* Fixed Footer with Live Status and Close Time */}
        <div className="flex items-center justify-between text-sm text-text-secondary pt-1 mt-auto border-t border-accent-secondary/30">
          {/* Live Signal - only show when event is actually live */}
          <div className="flex items-center gap-2">
            {!isClosedOrResolved && (
              <LiveStatusIndicator 
                closeTime={event.close_time}
                eventResult={event.event_result}
                variant="default"
                size="md"
              />
            )}
          </div>
          
          {/* Close Time */}
          <span>
            {event.close_time ? (() => {
              const isClosed = isClosedOrResolved;
              return `${isClosed ? 'Closed' : 'Closes'} ${formatDateSimple(event.close_time)}`;
            })() : 'No close date'}
          </span>
        </div>
      </div>
    </Link>
  );
} 