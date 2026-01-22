"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { Info, HelpCircle, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { TooltipVariant } from "./tooltip-types"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-white px-3 py-1.5 text-sm text-gray-900 shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Helper functions for variants
export const getVariantStyles = (variant: TooltipVariant) => {
  switch (variant) {
    case 'info':
      return 'bg-blue-50 border-blue-200 text-blue-900'
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 text-yellow-900'
    case 'success':
      return 'bg-green-50 border-green-200 text-green-900'
    case 'error':
      return 'bg-red-50 border-red-200 text-red-900'
    case 'help':
      return 'bg-gray-50 border-gray-200 text-gray-900'
    default:
      return 'bg-white border-gray-200 text-gray-900'
  }
}

export const getVariantIcon = (variant: TooltipVariant) => {
  switch (variant) {
    case 'info':
      return <Info className="h-4 w-4" />
    case 'warning':
      return <AlertCircle className="h-4 w-4" />
    case 'success':
      return <CheckCircle className="h-4 w-4" />
    case 'error':
      return <AlertCircle className="h-4 w-4" />
    case 'help':
      return <HelpCircle className="h-4 w-4" />
    default:
      return null
  }
}

// Enhanced tooltip with different variants
interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  variant?: TooltipVariant
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
  className?: string
  disabled?: boolean
}

const TooltipWrapper = React.forwardRef<
  HTMLDivElement,
  TooltipProps
>(({ 
  children, 
  content, 
  variant = 'default',
  side = 'top',
  align = 'center',
  delayDuration = 200,
  className,
  disabled = false,
  ...props 
}, ref) => {

  if (disabled) {
    return <>{children}</>
  }

  return (
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild>
        <div ref={ref} className={cn(className, "inline-block")} {...props}>
          {children}
        </div>
      </TooltipTrigger>
      <TooltipContent 
        side={side} 
        align={align}
        className={cn(getVariantStyles(variant), "max-w-xs")}
      >
        <div className="flex items-start gap-2">
          {getVariantIcon(variant) && (
            <div className="flex-shrink-0 mt-0.5">
              {getVariantIcon(variant)}
            </div>
          )}
          <div className="flex-1">
            {content}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
})
TooltipWrapper.displayName = "TooltipWrapper"

export { 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent, 
  TooltipProvider,
  TooltipWrapper
}

