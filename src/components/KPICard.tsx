import { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: string;
  variant?: 'default' | 'gold' | 'success' | 'warning' | 'info';
}

const variantStyles = {
  default: 'bg-card border',
  gold: 'gold-gradient text-primary-foreground',
  success: 'bg-success/10 border border-success/20',
  warning: 'bg-warning/10 border border-warning/20',
  info: 'bg-info/10 border border-info/20',
};

const iconStyles = {
  default: 'bg-muted text-muted-foreground',
  gold: 'bg-primary-foreground/20 text-primary-foreground',
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
  info: 'bg-info/20 text-info',
};

export default function KPICard({ title, value, subtitle, icon, trend, variant = 'default' }: KPICardProps) {
  return (
    <div className={`rounded-xl p-4 animate-fade-in ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className={`text-xs font-medium ${variant === 'gold' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{title}</p>
          <p className="text-2xl font-bold font-display">{value}</p>
          {subtitle && <p className={`text-xs ${variant === 'gold' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{subtitle}</p>}
          {trend && <p className="text-xs text-success font-medium">{trend}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconStyles[variant]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
