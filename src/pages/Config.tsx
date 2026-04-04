import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfigFileList } from '@/components/config/ConfigFileList';
import { ConfigEditor } from '@/components/config/ConfigEditor';
import { CreateFileDialog } from '@/components/config/CreateFileDialog';
import { useMonitoringData } from '@/hooks/useMonitoringData';
import { useConfigFiles } from '@/hooks/useConfigFiles';

export default function ConfigPage() {
  const { machines } = useMonitoringData();
  const {
    files,
    selectedFile,
    selectedFileId,
    setSelectedFileId,
    handleSave,
    handleDelete,
    handleCreate,
  } = useConfigFiles();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border bg-card/50 px-4 py-3 backdrop-blur-sm">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-primary/10 p-1.5">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <h1 className="font-semibold">
            <span className="text-gradient">File Browser</span>
          </h1>
        </div>
        <span className="text-xs text-muted-foreground">
          Parcourir les fichiers de configuration
        </span>
      </header>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 shrink-0">
          <ConfigFileList
            files={files}
            machines={machines}
            selectedFileId={selectedFileId}
            onSelectFile={(f) => setSelectedFileId(f.id)}
            onCreateFile={() => setShowCreate(true)}
          />
        </div>
        <div className="flex-1">
          <ConfigEditor
            file={selectedFile}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <CreateFileDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
        machines={machines}
      />
    </div>
  );
}
