import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  variant?: 'default' | 'warning' | 'danger' | 'success';
}

const variantStyles = {
  default: 'text-primary',
  warning: 'text-warning',
  danger: 'text-destructive',
  success: 'text-success',
};

export function MetricCard({ label, value, unit, icon: Icon, variant = 'default' }: MetricCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
      <div className={cn('rounded-lg bg-secondary p-2', variantStyles[variant])}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="metric-label truncate">{label}</p>
        <p className={cn('metric-value text-lg', variantStyles[variant])}>
          {typeof value === 'number' ? value.toFixed(1) : value}
          {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
        </p>
      </div>
    </div>
  );
}
