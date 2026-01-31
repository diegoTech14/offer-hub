import { useState, useEffect } from 'react'

export const useMobileFavorites = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return {
    isMobile,
    mobileProps: isMobile ? {
      variant: 'ghost' as const,
      size: 'sm' as const,
      className: 'h-10 w-10'
    } : {
      variant: 'outline' as const,
      size: 'md' as const,
      className: 'h-12 w-12'
    }
  }
}