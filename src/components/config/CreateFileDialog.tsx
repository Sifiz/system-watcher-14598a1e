import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface CreateFileDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, path: string) => void;
}

export function CreateFileDialog({ open, onClose, onCreate }: CreateFileDialogProps) {
  const [name, setName] = useState('');
  const [path, setPath] = useState('/etc/process/');

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), path.trim());
    setName('');
    setPath('/etc/process/');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau fichier de config</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nom du fichier</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="process.conf"
              className="font-mono text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <div className="space-y-2">
            <Label>Chemin du dossier</Label>
            <Input
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/etc/process/"
              className="font-mono text-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>Créer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
