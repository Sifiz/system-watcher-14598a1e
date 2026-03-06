import { Scenario } from '@/types/scenario';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Zap, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScenarioListProps {
  scenarios: Scenario[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
}

const statusIcons = {
  idle: Clock,
  running: Loader2,
  success: CheckCircle2,
  error: XCircle,
};

const statusColors = {
  idle: 'text-muted-foreground',
  running: 'text-primary animate-spin',
  success: 'text-success',
  error: 'text-destructive',
};

export function ScenarioList({ scenarios, selectedId, onSelect, onCreateNew }: ScenarioListProps) {
  return (
    <div className="flex h-full flex-col border-r border-border bg-card/50">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Scénarios</h2>
        </div>
        <Button size="sm" variant="outline" onClick={onCreateNew} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Nouveau
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {scenarios.map(scenario => {
            const StatusIcon = statusIcons[scenario.status];
            return (
              <button
                key={scenario.id}
                onClick={() => onSelect(scenario.id)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors',
                  selectedId === scenario.id
                    ? 'bg-primary/10 border border-primary/30'
                    : 'hover:bg-muted/50 border border-transparent'
                )}
              >
                <StatusIcon className={cn('mt-0.5 h-4 w-4 shrink-0', statusColors[scenario.status])} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{scenario.name}</span>
                    {!scenario.enabled && (
                      <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        OFF
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {scenario.steps.length} étape{scenario.steps.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
