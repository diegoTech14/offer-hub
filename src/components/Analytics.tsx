"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view on mount and when pathname changes
    const track = async () => {
      await trackPageView(pathname);
    };

    track();
  }, [pathname]);

  // This component renders nothing
  return null;
}
