// Tipos para componentes de alerta reutilizables
export type AlertVariant = 'success' | 'error' | 'warning' | 'info' | 'default' | 'destructive';

export type AlertSize = 'sm' | 'md' | 'lg';

export interface AlertProps {
  variant?: AlertVariant;
  size?: AlertSize;
  title?: string;
  message?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export interface AlertBannerProps extends AlertProps {
  position?: 'top' | 'bottom';
  fixed?: boolean;
}
