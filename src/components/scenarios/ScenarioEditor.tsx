import { Scenario, ScenarioStep } from '@/types/scenario';
import { Machine } from '@/types/monitoring';
import { StepCard } from './StepCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Play, Trash2, Loader2 } from 'lucide-react';

interface ScenarioEditorProps {
  scenario: Scenario;
  machines: Machine[];
  onUpdate: (updates: Partial<Scenario>) => void;
  onDelete: () => void;
  onAddStep: (step: Omit<ScenarioStep, 'id' | 'order'>) => void;
  onUpdateStep: (stepId: string, updates: Partial<ScenarioStep>) => void;
  onRemoveStep: (stepId: string) => void;
  onMoveStep: (stepId: string, direction: 'up' | 'down') => void;
  onRun: () => void;
}

export function ScenarioEditor({
  scenario,
  machines,
  onUpdate,
  onDelete,
  onAddStep,
  onUpdateStep,
  onRemoveStep,
  onMoveStep,
  onRun,
}: ScenarioEditorProps) {
  const isRunning = scenario.status === 'running';

  const handleAddStep = () => {
    onAddStep({
      processName: '',
      machineId: machines[0]?.id || '',
      delay: 0,
      healthCheck: false,
      healthTimeout: 10,
      onFailure: 'skip',
      retryCount: 0,
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <Input
              value={scenario.name}
              onChange={e => onUpdate({ name: e.target.value })}
              className="h-9 text-lg font-semibold"
              placeholder="Nom du scénario"
            />
            <Textarea
              value={scenario.description}
              onChange={e => onUpdate({ description: e.target.value })}
              className="min-h-[40px] resize-none text-sm"
              placeholder="Description du scénario..."
              rows={1}
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5">
              <Label className="text-xs text-muted-foreground">Actif</Label>
              <Switch
                checked={scenario.enabled}
                onCheckedChange={v => onUpdate({ enabled: v })}
              />
            </div>
            <Button
              onClick={onRun}
              disabled={isRunning || scenario.steps.length === 0}
              className="gap-2"
              size="sm"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isRunning ? 'Exécution...' : 'Lancer'}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Status info */}
        {scenario.lastRun && (
          <p className="mt-2 text-xs text-muted-foreground">
            Dernier lancement : {scenario.lastRun.toLocaleString()} — 
            <span className={scenario.status === 'success' ? ' text-success' : scenario.status === 'error' ? ' text-destructive' : ''}>
              {' '}{scenario.status === 'success' ? 'Succès' : scenario.status === 'error' ? 'Erreur' : scenario.status}
            </span>
          </p>
        )}
      </div>

      {/* Steps pipeline */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Pipeline ({scenario.steps.length} étape{scenario.steps.length !== 1 ? 's' : ''})
            </h3>
            <Button size="sm" variant="outline" onClick={handleAddStep} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Ajouter une étape
            </Button>
          </div>

          {scenario.steps.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-16 text-center">
              <p className="text-sm text-muted-foreground">Aucune étape définie</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Ajoutez des étapes pour construire votre scénario de démarrage
              </p>
              <Button size="sm" variant="outline" onClick={handleAddStep} className="mt-4 gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Première étape
              </Button>
            </div>
          ) : (
            <div>
              {scenario.steps
                .sort((a, b) => a.order - b.order)
                .map((step, index) => (
                  <StepCard
                    key={step.id}
                    step={step}
                    index={index}
                    total={scenario.steps.length}
                    machines={machines}
                    onUpdate={updates => onUpdateStep(step.id, updates)}
                    onRemove={() => onRemoveStep(step.id)}
                    onMove={dir => onMoveStep(step.id, dir)}
                  />
                ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
