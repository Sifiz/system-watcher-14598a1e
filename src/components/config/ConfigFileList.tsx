import { ConfigFile } from '@/types/configFile';
import { Machine } from '@/types/monitoring';
import { FileText, Plus, Search, Server, ChevronRight, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StatusBadge } from '@/components/StatusBadge';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ConfigFileListProps {
  files: ConfigFile[];
  machines: Machine[];
  selectedFileId: string | null;
  onSelectFile: (file: ConfigFile) => void;
  onCreateFile: () => void;
}

export function ConfigFileList({ files, machines, selectedFileId, onSelectFile, onCreateFile }: ConfigFileListProps) {
  const [search, setSearch] = useState('');
  const [collapsedMachines, setCollapsedMachines] = useState<Set<string>>(new Set());

  const filtered = files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  // Group files by machineId
  const grouped = machines
    .map(machine => ({
      machine,
      files: filtered.filter(f => f.machineId === machine.id),
    }))
    .filter(g => g.files.length > 0);

  const toggleMachine = (machineId: string) => {
    setCollapsedMachines(prev => {
      const next = new Set(prev);
      if (next.has(machineId)) next.delete(machineId);
      else next.add(machineId);
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            Fichiers Config
          </h2>
          <Button size="icon" variant="ghost" onClick={onCreateFile} className="h-7 w-7">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="h-8 pl-8 text-xs bg-background/80"
          />
        </div>
      </div>
      <ScrollArea className="flex-1 scrollbar-thin">
        <div className="p-2 space-y-1">
          {grouped.map(({ machine, files: machineFiles }) => {
            const isCollapsed = collapsedMachines.has(machine.id);
            return (
              <div key={machine.id}>
                <button
                  onClick={() => toggleMachine(machine.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition-colors hover:bg-secondary/50"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <Server className="h-3.5 w-3.5 text-primary" />
                  <span className="truncate font-medium text-foreground">{machine.name}</span>
                  <StatusBadge status={machine.status} size="sm" />
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                    {machineFiles.length}
                  </span>
                </button>
                {!isCollapsed && (
                  <div className="ml-4 space-y-0.5 border-l border-border pl-2">
                    {machineFiles.map(file => (
                      <button
                        key={file.id}
                        onClick={() => onSelectFile(file)}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                          selectedFileId === file.id
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                        )}
                      >
                        <FileText className="h-3.5 w-3.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-mono text-xs font-medium">{file.name}</p>
                          <p className="truncate text-[10px] text-muted-foreground">{file.path}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {grouped.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              Aucun fichier trouvé
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
