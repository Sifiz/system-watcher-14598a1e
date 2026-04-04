import { useState } from 'react';
import { Process, Machine } from '@/types/monitoring';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Play,
  Square,
  RotateCcw,
  X,
  Server,
  Cpu,
  MemoryStick,
  Plus,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

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
  onProcessAction,
}: ProcessManagerProps) {
  const [newProcessName, setNewProcessName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!machine) return null;

  const pinnedNames = machine.pinnedProcesses.map(p => p.name);
  const filteredProcesses = processes.filter(p => pinnedNames.includes(p.name));

  const handleAddProcess = async () => {
    const name = newProcessName.trim();
    if (!name) return;
    try {
      await api.addPinnedProcess(machine.id, name);
    } catch {
      // In demo mode, silently ignore
    }
    setNewProcessName('');
    setIsAdding(false);
  };

  const handleRemoveProcess = async (name: string) => {
    try {
      await api.removePinnedProcess(machine.id, name);
    } catch {
      // In demo mode, silently ignore
    }
  };

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

      {/* Add process */}
      <div className="border-b border-border p-3">
        {isAdding ? (
          <div className="flex gap-2">
            <Input
              value={newProcessName}
              onChange={(e) => setNewProcessName(e.target.value)}
              placeholder="Nom du processus..."
              className="text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddProcess();
                if (e.key === 'Escape') { setIsAdding(false); setNewProcessName(''); }
              }}
            />
            <Button size="sm" onClick={handleAddProcess} disabled={!newProcessName.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4" />
            Ajouter un processus
          </Button>
        )}
      </div>

      {/* Process list — pinned only */}
      <ScrollArea className="flex-1 scrollbar-thin">
        <div className="space-y-2 p-4">
          {pinnedNames.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Aucun processus épinglé. Ajoutez-en un ci-dessus.
            </p>
          )}
          {machine.pinnedProcesses.map((pinned) => {
            const liveProcess = filteredProcesses.find(p => p.name === pinned.name);
            return (
              <PinnedProcessItem
                key={pinned.name}
                name={pinned.name}
                pinnedStatus={pinned.status}
                liveProcess={liveProcess}
                onAction={onProcessAction}
                onRemove={() => handleRemoveProcess(pinned.name)}
              />
            );
          })}
        </div>
      </ScrollArea>

      {/* Summary Footer */}
      <div className="border-t border-border p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{pinnedNames.length}</p>
            <p className="text-xs text-muted-foreground">Épinglés</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-success">
              {machine.pinnedProcesses.filter(p => p.status === 'running').length}
            </p>
            <p className="text-xs text-muted-foreground">Running</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-destructive">
              {machine.pinnedProcesses.filter(p => p.status === 'stopped').length}
            </p>
            <p className="text-xs text-muted-foreground">Stopped</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PinnedProcessItemProps {
  name: string;
  pinnedStatus: 'running' | 'stopped' | 'unknown';
  liveProcess?: Process;
  onAction: (pid: number, action: string) => void;
  onRemove: () => void;
}

function PinnedProcessItem({ name, pinnedStatus, liveProcess, onAction, onRemove }: PinnedProcessItemProps) {
  const rawStatus = liveProcess?.status || pinnedStatus;
  const status = rawStatus === 'unknown' ? 'stopped' : rawStatus;
  const isRunning = status === 'running';

  return (
    <div className={cn(
      'rounded-lg border border-border bg-secondary/30 p-3 transition-colors hover:bg-secondary/50',
      status === 'stopped' && 'opacity-60'
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-mono font-medium">{name}</span>
            <StatusBadge status={status} size="sm" />
          </div>
          {liveProcess && (
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="font-mono">PID: {liveProcess.pid}</span>
              <span className="flex items-center gap-1">
                <Cpu className="h-3 w-3" />
                {liveProcess.cpuUsage.toFixed(1)}%
              </span>
              <span className="flex items-center gap-1">
                <MemoryStick className="h-3 w-3" />
                {liveProcess.ramUsage.toFixed(0)} MB
              </span>
              <span className="font-mono text-primary/70">@{liveProcess.user}</span>
            </div>
          )}
          {!liveProcess && (
            <p className="mt-1 text-xs text-muted-foreground">Pas de données live</p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {liveProcess && !isRunning && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-success hover:bg-success/20 hover:text-success"
              onClick={() => onAction(liveProcess.pid, 'start')}
            >
              <Play className="h-3.5 w-3.5" />
            </Button>
          )}
          {liveProcess && isRunning && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-warning hover:bg-warning/20 hover:text-warning"
                onClick={() => onAction(liveProcess.pid, 'restart')}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/20 hover:text-destructive"
                onClick={() => onAction(liveProcess.pid, 'stop')}
              >
                <Square className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
