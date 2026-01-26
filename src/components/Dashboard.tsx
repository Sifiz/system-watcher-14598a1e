import { useMonitoringData } from '@/hooks/useMonitoringData';
import { DashboardHeader } from '@/components/DashboardHeader';
import { MachineCard } from '@/components/MachineCard';
import { ProcessManager } from '@/components/ProcessManager';
import { Skeleton } from '@/components/ui/skeleton';

export function Dashboard() {
  const {
    machines,
    selectedMachine,
    setSelectedMachine,
    processes,
    isLoading,
    handleProcessAction,
  } = useMonitoringData();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader machines={machines} />
      
      <div className="flex flex-1">
        {/* Main Grid */}
        <main className={`flex-1 transition-all duration-300 ${selectedMachine ? 'lg:mr-96' : ''}`}>
          <div className="container mx-auto p-4 lg:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Machines</h2>
              <p className="text-sm text-muted-foreground">
                Cliquez sur une machine pour gérer ses processus
              </p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {machines.map((machine, index) => (
                <div
                  key={machine.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <MachineCard
                    machine={machine}
                    isSelected={selectedMachine?.id === machine.id}
                    onSelect={setSelectedMachine}
                  />
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Process Manager Sidebar */}
        {selectedMachine && (
          <aside className="fixed inset-y-0 right-0 w-full max-w-sm lg:w-96 lg:max-w-none">
            <ProcessManager
              machine={selectedMachine}
              processes={processes}
              onClose={() => setSelectedMachine(null)}
              onProcessAction={handleProcessAction}
            />
          </aside>
        )}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-border p-4">
        <Skeleton className="h-12 w-64" />
      </div>
      <div className="container mx-auto p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
