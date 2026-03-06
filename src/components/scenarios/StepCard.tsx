import { ScenarioStep } from '@/types/scenario';
import { Machine } from '@/types/monitoring';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUp, ArrowDown, Trash2, GripVertical, Timer, HeartPulse, AlertTriangle, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepCardProps {
  step: ScenarioStep;
  index: number;
  total: number;
  machines: Machine[];
  onUpdate: (updates: Partial<ScenarioStep>) => void;
  onRemove: () => void;
  onMove: (direction: 'up' | 'down') => void;
}

export function StepCard({ step, index, total, machines, onUpdate, onRemove, onMove }: StepCardProps) {
  const machine = machines.find(m => m.id === step.machineId);

  return (
    <div className="group relative flex gap-3">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 font-mono text-xs font-bold text-primary">
          {index + 1}
        </div>
        {index < total - 1 && (
          <div className="w-0.5 flex-1 bg-border" />
        )}
      </div>

      {/* Step content */}
      <Card className="mb-4 flex-1 p-4 transition-all hover:border-primary/30">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
              <Input
                value={step.processName}
                onChange={e => onUpdate({ processName: e.target.value })}
                className="h-8 w-40 font-mono text-sm"
                placeholder="nom du processus"
              />
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                disabled={index === 0}
                onClick={() => onMove('up')}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                disabled={index === total - 1}
                onClick={() => onMove('down')}
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={onRemove}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Options grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Machine target */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Server className="h-3 w-3" />
                Machine cible
              </Label>
              <Select value={step.machineId} onValueChange={v => onUpdate({ machineId: v })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {machines.map(m => (
                    <SelectItem key={m.id} value={m.id} className="text-xs">
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Delay */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Timer className="h-3 w-3" />
                Délai (sec)
              </Label>
              <Input
                type="number"
                min={0}
                value={step.delay}
                onChange={e => onUpdate({ delay: parseInt(e.target.value) || 0 })}
                className="h-8 font-mono text-xs"
              />
            </div>

            {/* Health check */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <HeartPulse className="h-3 w-3" />
                Vérification santé
              </Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={step.healthCheck}
                  onCheckedChange={v => onUpdate({ healthCheck: v })}
                />
                {step.healthCheck && (
                  <Input
                    type="number"
                    min={1}
                    value={step.healthTimeout}
                    onChange={e => onUpdate({ healthTimeout: parseInt(e.target.value) || 10 })}
                    className="h-8 w-16 font-mono text-xs"
                    placeholder="timeout"
                  />
                )}
              </div>
            </div>

            {/* On failure */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <AlertTriangle className="h-3 w-3" />
                En cas d'échec
              </Label>
              <Select value={step.onFailure} onValueChange={v => onUpdate({ onFailure: v as any })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retry" className="text-xs">Réessayer</SelectItem>
                  <SelectItem value="skip" className="text-xs">Passer</SelectItem>
                  <SelectItem value="abort" className="text-xs">Abandonner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
