import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfigFile } from '@/types/configFile';
import { ConfigFileList } from '@/components/config/ConfigFileList';
import { ConfigEditor } from '@/components/config/ConfigEditor';
import { CreateFileDialog } from '@/components/config/CreateFileDialog';

// Sample config files — replace with real data later
const initialFiles: ConfigFile[] = [
  {
    id: '1',
    name: 'nginx.conf',
    path: '/etc/nginx/',
    content: `worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;

    server {
        listen 80;
        server_name localhost;
        location / {
            root /usr/share/nginx/html;
            index index.html;
        }
    }
}`,
    lastModified: new Date('2026-02-10'),
    size: 420,
  },
  {
    id: '2',
    name: 'mysql.cnf',
    path: '/etc/mysql/',
    content: `[mysqld]
bind-address = 0.0.0.0
port = 3306
max_connections = 200
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2`,
    lastModified: new Date('2026-02-08'),
    size: 230,
  },
  {
    id: '3',
    name: 'supervisord.conf',
    path: '/etc/supervisor/',
    content: `[supervisord]
logfile=/var/log/supervisord.log
pidfile=/var/run/supervisord.pid
nodaemon=false

[program:app]
command=/usr/bin/node /app/server.js
autostart=true
autorestart=true
stderr_logfile=/var/log/app.err.log
stdout_logfile=/var/log/app.out.log
user=appuser

[program:worker]
command=/usr/bin/python3 /app/worker.py
autostart=true
autorestart=true
numprocs=4
process_name=%(program_name)s_%(process_num)02d`,
    lastModified: new Date('2026-02-11'),
    size: 480,
  },
  {
    id: '4',
    name: 'redis.conf',
    path: '/etc/redis/',
    content: `bind 127.0.0.1
port 6379
daemonize yes
databases 16
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000`,
    lastModified: new Date('2026-02-09'),
    size: 180,
  },
];

export default function ConfigPage() {
  const [files, setFiles] = useState<ConfigFile[]>(initialFiles);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const selectedFile = files.find(f => f.id === selectedFileId) || null;

  const handleSave = (id: string, content: string) => {
    setFiles(prev =>
      prev.map(f => f.id === id ? { ...f, content, lastModified: new Date() } : f)
    );
  };

  const handleDelete = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (selectedFileId === id) setSelectedFileId(null);
  };

  const handleCreate = (name: string, path: string) => {
    const newFile: ConfigFile = {
      id: crypto.randomUUID(),
      name,
      path,
      content: `# ${name}\n# Created: ${new Date().toISOString()}\n\n`,
      lastModified: new Date(),
      size: 0,
    };
    setFiles(prev => [...prev, newFile]);
    setSelectedFileId(newFile.id);
  };

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
            <span className="text-gradient">Config Files</span>
          </h1>
        </div>
        <span className="text-xs text-muted-foreground">
          Gestion des fichiers de configuration des processus
        </span>
      </header>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 shrink-0">
          <ConfigFileList
            files={files}
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
      />
    </div>
  );
}
