"use client"

import React from 'react'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface FieldHelpProps {
  children: React.ReactNode
  message: string
  variant?: 'info' | 'error' | 'warning' | 'success' | 'help'
  className?: string
}

export default function FieldHelp({ 
  children, 
  message, 
  variant = 'info',
  className 
}: FieldHelpProps) {
  const getVariantStyles = () => {
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

  return (
    <TooltipProvider>
      <div className={cn("relative", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            {children}
          </TooltipTrigger>
          <TooltipContent 
            side="top"
            className={cn(getVariantStyles(), "max-w-xs")}
          >
            <p>{message}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
