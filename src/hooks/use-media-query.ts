import { useState, useEffect } from 'react';

/**
 * Custom hook to detect media query matches
 * @param query - The media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Create a media query list
    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add event listener
    mediaQuery.addEventListener('change', handler);

    // Cleanup function
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}

/**
 * Hook to detect if the screen is mobile (max-width: 768px)
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

/**
 * Hook to detect if the screen is tablet (max-width: 1024px)
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(max-width: 1024px)');
}

/**
 * Hook to detect if the screen is desktop (min-width: 1025px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)');
}
