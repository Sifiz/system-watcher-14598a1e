import { Machine } from '@/types/monitoring';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { MetricCard } from '@/components/MetricCard';
import { MiniChart } from '@/components/MiniChart';
import { Cpu, MemoryStick, Activity, Clock, Server, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MachineCardProps {
  machine: Machine;
  isSelected: boolean;
  onSelect: (machine: Machine) => void;
}

function formatUptime(seconds: number): string {
  if (seconds === 0) return '-';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}j ${hours}h`;
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function getUsageVariant(usage: number): 'default' | 'warning' | 'danger' | 'success' {
  if (usage >= 90) return 'danger';
  if (usage >= 75) return 'warning';
  if (usage >= 50) return 'default';
  return 'success';
}

const processStatusColor: Record<string, string> = {
  running: 'bg-success',
  stopped: 'bg-destructive',
  unknown: 'bg-muted-foreground',
};

export function MachineCard({ machine, isSelected, onSelect }: MachineCardProps) {
  const isOffline = machine.status === 'offline';
  
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-300 hover:scale-[1.02]',
        isSelected && 'ring-2 ring-primary card-glow',
        isOffline && 'opacity-60',
        !isSelected && !isOffline && 'hover:border-primary/50'
      )}
      onClick={() => onSelect(machine)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              <h3 className="truncate font-semibold">{machine.name}</h3>
            </div>
            <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
              {machine.hostname}
            </p>
          </div>
          <StatusBadge status={machine.status} size="sm" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Charts */}
        {!isOffline && (
          <div className="grid grid-cols-2 gap-3">
            <MiniChart
              data={machine.cpuHistory}
              label="CPU"
              value={machine.cpuUsage}
              color="hsl(var(--primary))"
            />
            <MiniChart
              data={machine.ramHistory}
              label="RAM"
              value={machine.ramUsage}
              color="hsl(var(--chart-2))"
            />
          </div>
        )}
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          <MetricCard
            label="CPU"
            value={isOffline ? '-' : machine.cpuUsage}
            unit={isOffline ? '' : '%'}
            icon={Cpu}
            variant={isOffline ? 'default' : getUsageVariant(machine.cpuUsage)}
          />
          <MetricCard
            label="RAM"
            value={isOffline ? '-' : machine.ramUsage}
            unit={isOffline ? '' : '%'}
            icon={MemoryStick}
            variant={isOffline ? 'default' : getUsageVariant(machine.ramUsage)}
          />
          <MetricCard
            label="Load"
            value={isOffline ? '-' : machine.loadAverage[0].toFixed(2)}
            icon={Activity}
            variant={machine.loadAverage[0] > 2 ? 'warning' : 'default'}
          />
          <MetricCard
            label="Uptime"
            value={formatUptime(machine.uptime)}
            icon={Clock}
          />
        </div>

        {/* Pinned Processes */}
        {machine.pinnedProcesses.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Terminal className="h-3 w-3" />
              <span>Processus raccourcis</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {machine.pinnedProcesses.map((proc) => (
                <span
                  key={proc.name}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2 py-1 font-mono text-xs text-foreground"
                >
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      processStatusColor[proc.status],
                      proc.status === 'running' && 'status-pulse'
                    )}
                  />
                  {proc.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
