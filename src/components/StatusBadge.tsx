import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'warning' | 'running' | 'sleeping' | 'stopped' | 'zombie';
  size?: 'sm' | 'md';
}

const statusConfig = {
  online: {
    label: 'En ligne',
    className: 'bg-success/20 text-success border-success/30',
    dotClassName: 'bg-success',
  },
  offline: {
    label: 'Hors ligne',
    className: 'bg-destructive/20 text-destructive border-destructive/30',
    dotClassName: 'bg-destructive',
  },
  warning: {
    label: 'Attention',
    className: 'bg-warning/20 text-warning border-warning/30',
    dotClassName: 'bg-warning',
  },
  running: {
    label: 'Running',
    className: 'bg-success/20 text-success border-success/30',
    dotClassName: 'bg-success',
  },
  sleeping: {
    label: 'Sleeping',
    className: 'bg-muted text-muted-foreground border-border',
    dotClassName: 'bg-muted-foreground',
  },
  stopped: {
    label: 'Stopped',
    className: 'bg-destructive/20 text-destructive border-destructive/30',
    dotClassName: 'bg-destructive',
  },
  zombie: {
    label: 'Zombie',
    className: 'bg-warning/20 text-warning border-warning/30',
    dotClassName: 'bg-warning',
  },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        config.className,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      <span
        className={cn(
          'rounded-full',
          config.dotClassName,
          status === 'online' || status === 'running' ? 'status-pulse' : '',
          size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2'
        )}
      />
      {config.label}
    </span>
  );
}
