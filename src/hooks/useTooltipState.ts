import { useState, useCallback, useRef, useEffect } from 'react'
import { TooltipVariant, TooltipSize, TooltipPosition } from '@/components/ui/tooltip-types'

interface UseTooltipStateOptions {
  variant?: TooltipVariant
  size?: TooltipSize
  position?: TooltipPosition
  delayDuration?: number
  disabled?: boolean
  onOpenChange?: (open: boolean) => void
}

export const useTooltipState = (options: UseTooltipStateOptions = {}) => {
  const {
    variant = 'default',
    size = 'md',
    position = 'top',
    delayDuration = 200,
    disabled = false,
    onOpenChange
  } = options

  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  
  const triggerRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Open tooltip with delay
  const openTooltip = useCallback(() => {
    if (disabled) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      if (isHovered || isFocused) {
        setIsOpen(true)
        onOpenChange?.(true)
      }
    }, delayDuration)
  }, [disabled, isHovered, isFocused, delayDuration, onOpenChange])

  // Close tooltip
  const closeTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    setIsOpen(false)
    setIsHovered(false)
    setIsFocused(false)
    onOpenChange?.(false)
  }, [onOpenChange])

  // Handle hover enter
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    openTooltip()
  }, [openTooltip])

  // Handle hover leave
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    closeTooltip()
  }, [closeTooltip])

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true)
    openTooltip()
  }, [openTooltip])

  // Handle blur
  const handleBlur = useCallback(() => {
    setIsFocused(false)
    closeTooltip()
  }, [closeTooltip])

  // Handle escape key
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault()
      closeTooltip()
    }
  }, [isOpen, closeTooltip])

  // Set up event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return {
    // State
    isOpen,
    isHovered,
    isFocused,
    variant,
    size,
    position,
    
    // Refs
    triggerRef,
    contentRef,
    
    // Actions
    openTooltip,
    closeTooltip,
    
    // Event handlers
    handleMouseEnter,
    handleMouseLeave,
    handleFocus,
    handleBlur
  }
}
