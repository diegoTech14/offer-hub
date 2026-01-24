import { useState, useCallback } from 'react';

/**
 * useLoading - React hook to manage loading state for async operations.
 *
 * @returns [isLoading, withLoading]
 *   - isLoading: boolean indicating if loading is in progress
 *   - withLoading: function to wrap async functions and manage loading state automatically
 *
 * Example usage:
 *   const [isLoading, withLoading] = useLoading();
 *   const handleClick = () => withLoading(async () => { ... });
 *
 * Concurrent calls are not expected currently and this is intentional for simplicity.
 */
export function useLoading(): [boolean, <T>(fn: () => Promise<T>) => Promise<T>] {
  const [isLoading, setIsLoading] = useState(false);

  const withLoading = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    try {
      const result = await fn();
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return [isLoading, withLoading];
}
