import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardHeader } from '@/components/DashboardHeader';
import { ScenarioList } from '@/components/scenarios/ScenarioList';
import { ScenarioEditor } from '@/components/scenarios/ScenarioEditor';
import { useScenarios } from '@/hooks/useScenarios';
import { useMonitoringData } from '@/hooks/useMonitoringData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Zap } from 'lucide-react';

export default function Scenarios() {
  const { machines } = useMonitoringData();
  const {
    scenarios,
    selectedScenario,
    selectedScenarioId,
    setSelectedScenarioId,
    createScenario,
    deleteScenario,
    updateScenario,
    addStep,
    updateStep,
    removeStep,
    moveStep,
    runScenario,
  } = useScenarios();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    createScenario(newName.trim(), newDesc.trim());
    setNewName('');
    setNewDesc('');
    setCreateDialogOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader machines={machines} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 shrink-0">
          <ScenarioList
            scenarios={scenarios}
            selectedId={selectedScenarioId}
            onSelect={setSelectedScenarioId}
            onCreateNew={() => setCreateDialogOpen(true)}
          />
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          {selectedScenario ? (
            <ScenarioEditor
              scenario={selectedScenario}
              machines={machines}
              onUpdate={updates => updateScenario(selectedScenario.id, updates)}
              onDelete={() => deleteScenario(selectedScenario.id)}
              onAddStep={step => addStep(selectedScenario.id, step)}
              onUpdateStep={(stepId, updates) => updateStep(selectedScenario.id, stepId, updates)}
              onRemoveStep={stepId => removeStep(selectedScenario.id, stepId)}
              onMoveStep={(stepId, dir) => moveStep(selectedScenario.id, stepId, dir)}
              onRun={() => runScenario(selectedScenario.id)}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Zap className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Sélectionnez un scénario ou créez-en un nouveau
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau scénario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Ex: Production Startup"
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Décrivez ce que fait ce scénario..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
