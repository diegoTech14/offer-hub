"use client"

import React from 'react'
import { Info, HelpCircle, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { TooltipWrapper } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { InfoTooltipProps } from '../ui/tooltip-types'

export default function InfoTooltip({
  children,
  title,
  description,
  variant = 'info',
  side = 'top',
  align = 'center',
  delayDuration = 300,
  className,
  disabled = false,
  size = 'md',
  icon,
  showIcon = true,
  ...props
}: InfoTooltipProps) {
  const getIcon = () => {
    if (icon) return icon
    
    const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
    
    switch (variant) {
      case 'info':
        return <Info className={iconSize} />
      case 'help':
        return <HelpCircle className={iconSize} />
      case 'warning':
        return <AlertCircle className={iconSize} />
      case 'success':
        return <CheckCircle className={iconSize} />
      case 'error':
        return <XCircle className={iconSize} />
      default:
        return <Info className={iconSize} />
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1'
      case 'lg':
        return 'text-base px-4 py-2'
      default:
        return 'text-sm px-3 py-1.5'
    }
  }

  const getTriggerSize = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4'
      case 'lg':
        return 'h-6 w-6'
      default:
        return 'h-5 w-5'
    }
  }

  const content = (
    <div className="space-y-1">
      {title && (
        <div className="font-medium">
          {title}
        </div>
      )}
      {description && (
        <div className={cn(
          "text-sm opacity-90",
          title ? "text-xs" : ""
        )}>
          {description}
        </div>
      )}
    </div>
  )

  return (
    <TooltipWrapper
      content={content}
      variant={variant === 'help' ? 'default' : variant}
      side={side}
      align={align}
      delayDuration={delayDuration}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center",
        getTriggerSize(),
        className
      )}
      {...props}
    >
      {showIcon ? (
        <div className="flex items-center justify-center">
          {getIcon()}
        </div>
      ) : (
        children
      )}
    </TooltipWrapper>
  )
}

// Specialized info tooltip variants
export function HelpTooltip({ 
  children, 
  helpText, 
  ...props 
}: Omit<InfoTooltipProps, 'variant'> & { helpText: string }) {
  return (
    <InfoTooltip
      variant="help"
      description={helpText}
      {...props}
    >
      {children}
    </InfoTooltip>
  )
}

export function WarningTooltip({ 
  children, 
  warningText, 
  ...props 
}: Omit<InfoTooltipProps, 'variant'> & { warningText: string }) {
  return (
    <InfoTooltip
      variant="warning"
      description={warningText}
      {...props}
    >
      {children}
    </InfoTooltip>
  )
}

export function SuccessTooltip({ 
  children, 
  successText, 
  ...props 
}: Omit<InfoTooltipProps, 'variant'> & { successText: string }) {
  return (
    <InfoTooltip
      variant="success"
      description={successText}
      {...props}
    >
      {children}
    </InfoTooltip>
  )
}

export function ErrorTooltip({ 
  children, 
  errorText, 
  ...props 
}: Omit<InfoTooltipProps, 'variant'> & { errorText: string }) {
  return (
    <InfoTooltip
      variant="error"
      description={errorText}
      {...props}
    >
      {children}
    </InfoTooltip>
  )
}
