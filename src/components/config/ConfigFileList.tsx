import { ConfigFile } from '@/types/configFile';
import { FileText, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ConfigFileListProps {
  files: ConfigFile[];
  selectedFileId: string | null;
  onSelectFile: (file: ConfigFile) => void;
  onCreateFile: () => void;
}

export function ConfigFileList({ files, selectedFileId, onSelectFile, onCreateFile }: ConfigFileListProps) {
  const [search, setSearch] = useState('');

  const filtered = files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

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
          {filtered.map(file => (
            <button
              key={file.id}
              onClick={() => onSelectFile(file)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                selectedFileId === file.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              )}
            >
              <FileText className="h-4 w-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-xs font-medium">{file.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">{file.path}</p>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              Aucun fichier trouvé
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
