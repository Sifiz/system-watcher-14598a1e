import { Process, Machine } from '@/types/monitoring';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  Play, 
  Square, 
  RotateCcw, 
  X, 
  Server,
  Cpu,
  MemoryStick
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessManagerProps {
  machine: Machine | null;
  processes: Process[];
  onClose: () => void;
  onProcessAction: (pid: number, action: string) => void;
}

export function ProcessManager({ 
  machine, 
  processes, 
  onClose, 
  onProcessAction 
}: ProcessManagerProps) {
  if (!machine) return null;

  return (
    <div className="flex h-full flex-col border-l border-border bg-card animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            <h2 className="truncate font-semibold">Process Manager</h2>
          </div>
          <p className="mt-1 truncate font-mono text-sm text-muted-foreground">
            {machine.name}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Process List */}
      <ScrollArea className="flex-1 scrollbar-thin">
        <div className="space-y-2 p-4">
          {processes.map((process) => (
            <ProcessItem
              key={process.pid}
              process={process}
              onAction={onProcessAction}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Summary Footer */}
      <div className="border-t border-border p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{processes.length}</p>
            <p className="text-xs text-muted-foreground">Processus</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-success">
              {processes.filter(p => p.status === 'running').length}
            </p>
            <p className="text-xs text-muted-foreground">Running</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-destructive">
              {processes.filter(p => p.status === 'stopped').length}
            </p>
            <p className="text-xs text-muted-foreground">Stopped</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProcessItemProps {
  process: Process;
  onAction: (pid: number, action: string) => void;
}

function ProcessItem({ process, onAction }: ProcessItemProps) {
  const isRunning = process.status === 'running';
  
  return (
    <div className={cn(
      'rounded-lg border border-border bg-secondary/30 p-3 transition-colors hover:bg-secondary/50',
      process.status === 'stopped' && 'opacity-60'
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-mono font-medium">{process.name}</span>
            <StatusBadge status={process.status} size="sm" />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="font-mono">PID: {process.pid}</span>
            <span className="flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              {process.cpuUsage.toFixed(1)}%
            </span>
            <span className="flex items-center gap-1">
              <MemoryStick className="h-3 w-3" />
              {process.ramUsage.toFixed(0)} MB
            </span>
            <span className="font-mono text-primary/70">@{process.user}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {!isRunning && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-success hover:bg-success/20 hover:text-success"
              onClick={() => onAction(process.pid, 'start')}
            >
              <Play className="h-3.5 w-3.5" />
            </Button>
          )}
          {isRunning && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-warning hover:bg-warning/20 hover:text-warning"
                onClick={() => onAction(process.pid, 'restart')}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/20 hover:text-destructive"
                onClick={() => onAction(process.pid, 'stop')}
              >
                <Square className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
