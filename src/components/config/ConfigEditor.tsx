import { ConfigFile } from '@/types/configFile';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Trash2, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface ConfigEditorProps {
  file: ConfigFile | null;
  onSave: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

export function ConfigEditor({ file, onSave, onDelete }: ConfigEditorProps) {
  const [content, setContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (file) {
      setContent(file.content);
      setHasChanges(false);
    }
  }, [file]);

  if (!file) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
        <FileText className="mb-3 h-12 w-12 opacity-30" />
        <p className="text-sm">Sélectionnez un fichier pour l'éditer</p>
        <p className="mt-1 text-xs">ou créez-en un nouveau</p>
      </div>
    );
  }

  const handleSave = () => {
    onSave(file.id, content);
    setHasChanges(false);
    toast.success(`${file.name} sauvegardé`);
  };

  const handleReset = () => {
    setContent(file.content);
    setHasChanges(false);
  };

  const handleDelete = () => {
    onDelete(file.id);
    toast.success(`${file.name} supprimé`);
  };

  const lineCount = content.split('\n').length;

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="font-mono text-sm font-medium">{file.name}</span>
          {hasChanges && (
            <span className="rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-medium text-warning">
              modifié
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            <RotateCcw className="h-3 w-3" />
            Annuler
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
            Supprimer
          </Button>
          <Button
            size="sm"
            className="h-7 gap-1.5 px-3 text-xs"
            onClick={handleSave}
            disabled={!hasChanges}
          >
            <Save className="h-3 w-3" />
            Sauvegarder
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Line numbers */}
          <div className="select-none border-r border-border bg-background/50 px-3 py-3 text-right font-mono text-[11px] leading-[1.65rem] text-muted-foreground/50 overflow-hidden">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          {/* Textarea */}
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setHasChanges(true);
            }}
            className="flex-1 resize-none bg-transparent p-3 font-mono text-xs leading-[1.65rem] text-foreground outline-none scrollbar-thin"
            spellCheck={false}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (hasChanges) handleSave();
              }
            }}
          />
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-border px-4 py-1.5 text-[10px] text-muted-foreground">
        <span>{file.path}</span>
        <div className="flex items-center gap-4">
          <span>{lineCount} lignes</span>
          <span>{new Date(file.lastModified).toLocaleString('fr-FR')}</span>
        </div>
      </div>
    </div>
  );
}
