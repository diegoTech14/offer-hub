import { useState, useEffect } from 'react';

/**
 * Hook to track the current scroll position of the window
 * @returns {number} The current scroll position in pixels from the top
 */
const useScrollPosition = (): number => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    // Function to handle scroll events
    const handleScroll = (): void => {
      setScrollPosition(window.scrollY);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Cleanup function to remove event listener
    return (): void => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return scrollPosition;
};

export { useScrollPosition };
export default useScrollPosition;