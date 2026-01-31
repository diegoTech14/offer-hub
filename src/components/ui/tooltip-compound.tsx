import React from 'react'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip'
import { useTooltipState } from '@/hooks/useTooltipState'
import { TooltipProps, TooltipVariant, TooltipSize, TooltipPosition } from './tooltip-types'
import { cn } from '@/lib/utils'

// Main Tooltip compound component
interface TooltipCompoundProps extends TooltipProps {
  children: React.ReactNode
}

const TooltipCompound = React.forwardRef<HTMLDivElement, TooltipCompoundProps>(
  ({ children, content, variant = 'default', size = 'md', position = 'top', delayDuration = 200, disabled = false, className, ...props }, ref) => {
    const tooltipState = useTooltipState({
      variant,
      size,
      position,
      delayDuration,
      disabled
    })

    return (
      <TooltipProvider>
        <Tooltip delayDuration={delayDuration}>
          <TooltipTrigger asChild>
            <div
              ref={ref}
              className={cn("inline-flex items-center justify-center", className)}
              onMouseEnter={tooltipState.handleMouseEnter}
              onMouseLeave={tooltipState.handleMouseLeave}
              onFocus={tooltipState.handleFocus}
              onBlur={tooltipState.handleBlur}
              {...props}
            >
              {children}
            </div>
          </TooltipTrigger>
          <TooltipContent 
            side={position} 
            className={cn("max-w-xs", className)}
          >
            {content}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
)

TooltipCompound.displayName = 'TooltipCompound'

// Sub-components for compound pattern
const TooltipHeader = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("font-semibold text-sm mb-1", className)} {...props}>
      {children}
    </div>
  )
)
TooltipHeader.displayName = 'TooltipHeader'

const TooltipBody = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm text-gray-600", className)} {...props}>
      {children}
    </div>
  )
)
TooltipBody.displayName = 'TooltipBody'

const TooltipFooter = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("mt-2 pt-2 border-t border-gray-200", className)} {...props}>
      {children}
    </div>
  )
)
TooltipFooter.displayName = 'TooltipFooter'

// Attach sub-components to main component
TooltipCompound.Header = TooltipHeader
TooltipCompound.Body = TooltipBody
TooltipCompound.Footer = TooltipFooter

export { TooltipCompound, TooltipHeader, TooltipBody, TooltipFooter }
