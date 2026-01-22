// Simple type definitions for tooltip system

export type TooltipVariant = 'default' | 'info' | 'warning' | 'success' | 'error' | 'help'
export type TooltipSize = 'sm' | 'md' | 'lg'
export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left'

export interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  variant?: TooltipVariant
  size?: TooltipSize
  position?: TooltipPosition
  delayDuration?: number
  disabled?: boolean
  className?: string
}

export interface InfoTooltipProps {
  children: React.ReactNode
  title?: string
  description?: string
  variant?: TooltipVariant
  size?: TooltipSize
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
  disabled?: boolean
  showIcon?: boolean
  icon?: React.ReactNode
  className?: string
}

export interface FieldHelpProps {
  children: React.ReactNode
  message: string
  variant?: TooltipVariant
  position?: TooltipPosition
  showIcon?: boolean
  className?: string
}
