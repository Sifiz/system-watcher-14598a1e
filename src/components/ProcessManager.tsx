import { useState, useRef, useEffect } from 'react';
import { Process, Machine } from '@/types/monitoring';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StatusBadge } from '@/components/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Square, 
  RotateCcw, 
  X, 
  Server,
  Cpu,
  MemoryStick,
  Terminal,
  Send,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandOutput {
  id: string;
  command: string;
  output: string;
  timestamp: Date;
  status: 'success' | 'error';
}

interface ProcessManagerProps {
  machine: Machine | null;
  processes: Process[];
  onClose: () => void;
  onProcessAction: (pid: number, action: string) => void;
}

// Simulated command responses
function simulateCommandExecution(command: string): { output: string; status: 'success' | 'error' } {
  const cmd = command.trim().toLowerCase();
  
  if (cmd === 'ls' || cmd === 'dir') {
    return {
      output: `drwxr-xr-x  2 root root 4096 Feb  4 10:00 bin
drwxr-xr-x  3 root root 4096 Feb  4 10:00 etc
drwxr-xr-x  4 root root 4096 Feb  4 10:00 home
drwxr-xr-x  2 root root 4096 Feb  4 10:00 lib
drwxr-xr-x  2 root root 4096 Feb  4 10:00 var`,
      status: 'success'
    };
  }
  
  if (cmd === 'pwd') {
    return { output: '/home/admin', status: 'success' };
  }
  
  if (cmd === 'whoami') {
    return { output: 'admin', status: 'success' };
  }
  
  if (cmd === 'date') {
    return { output: new Date().toString(), status: 'success' };
  }
  
  if (cmd === 'uptime') {
    return { output: ' 14:32:01 up 45 days,  3:22,  2 users,  load average: 0.52, 0.48, 0.45', status: 'success' };
  }
  
  if (cmd === 'df -h') {
    return {
      output: `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        50G   32G   18G  64% /
tmpfs           7.8G     0  7.8G   0% /dev/shm
/dev/sdb1       200G  145G   55G  73% /data`,
      status: 'success'
    };
  }
  
  if (cmd === 'free -h') {
    return {
      output: `              total        used        free      shared  buff/cache   available
Mem:           15Gi       8.2Gi       2.1Gi       512Mi       5.1Gi       6.4Gi
Swap:         4.0Gi       256Mi       3.8Gi`,
      status: 'success'
    };
  }
  
  if (cmd === 'ps aux' || cmd === 'ps') {
    return {
      output: `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.0 169936 13156 ?        Ss   Jan20   0:15 /sbin/init
root       412  0.1  0.2 274520 32768 ?        Ss   Jan20  12:34 /usr/lib/systemd
nginx     1024  0.5  0.3 145832 48512 ?        S    Jan20  45:12 nginx: worker
mysql     2048  2.1  4.5 1258412 734208 ?      Sl   Jan20 185:23 /usr/sbin/mysqld`,
      status: 'success'
    };
  }
  
  if (cmd.startsWith('echo ')) {
    return { output: command.slice(5), status: 'success' };
  }
  
  if (cmd === 'help') {
    return {
      output: `Available commands (simulation):
  ls, dir     - List directory contents
  pwd         - Print working directory
  whoami      - Display current user
  date        - Show current date/time
  uptime      - System uptime
  df -h       - Disk usage
  free -h     - Memory usage
  ps, ps aux  - Process list
  echo <text> - Echo text
  clear       - Clear terminal
  help        - Show this help`,
      status: 'success'
    };
  }
  
  if (cmd === '' || cmd === 'clear') {
    return { output: '', status: 'success' };
  }
  
  return {
    output: `bash: ${command}: command not found or not available in simulation mode.\nType 'help' for available commands.`,
    status: 'error'
  };
}

export function ProcessManager({ 
  machine, 
  processes, 
  onClose, 
  onProcessAction 
}: ProcessManagerProps) {
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<CommandOutput[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [commandHistory]);

  if (!machine) return null;

  const executeCommand = () => {
    if (!command.trim()) return;

    if (command.trim().toLowerCase() === 'clear') {
      setCommandHistory([]);
      setCommand('');
      return;
    }

    const result = simulateCommandExecution(command);
    const newOutput: CommandOutput = {
      id: crypto.randomUUID(),
      command: command,
      output: result.output,
      timestamp: new Date(),
      status: result.status
    };

    setCommandHistory(prev => [...prev, newOutput]);
    setCommand('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const commands = commandHistory.map(h => h.command);
      if (commands.length > 0) {
        const newIndex = historyIndex < commands.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCommand(commands[commands.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        const commands = commandHistory.map(h => h.command);
        setCommand(commands[commands.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  const clearHistory = () => {
    setCommandHistory([]);
  };

  return (
    <div className="flex h-full flex-col border-l border-border bg-card animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            <h2 className="truncate font-semibold">Process Manager</h2>
          </div>
          <p className="mt-1 truncate font-mono text-sm text-muted-foreground">
            {machine.name}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="processes" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="mx-4 mt-2 grid w-auto grid-cols-2">
          <TabsTrigger value="processes" className="gap-2">
            <Cpu className="h-4 w-4" />
            Processus
          </TabsTrigger>
          <TabsTrigger value="terminal" className="gap-2">
            <Terminal className="h-4 w-4" />
            Terminal
          </TabsTrigger>
        </TabsList>

        {/* Processes Tab */}
        <TabsContent value="processes" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full scrollbar-thin">
            <div className="space-y-2 p-4">
              {processes.map((process) => (
                <ProcessItem
                  key={process.pid}
                  process={process}
                  onAction={onProcessAction}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Terminal Tab */}
        <TabsContent value="terminal" className="flex flex-1 flex-col overflow-hidden p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Console @ {machine.hostname}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearHistory}
              className="h-6 gap-1 px-2 text-xs"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </Button>
          </div>
          
          {/* Terminal Output */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-auto rounded-lg border border-border bg-background/80 p-3 font-mono text-xs"
            onClick={() => inputRef.current?.focus()}
          >
            {commandHistory.length === 0 && (
              <div className="text-muted-foreground">
                <p>Terminal ready. Type 'help' for available commands.</p>
                <p className="mt-1 text-primary/70">$ _</p>
              </div>
            )}
            {commandHistory.map((item) => (
              <div key={item.id} className="mb-3">
                <div className="flex items-center gap-2 text-primary">
                  <span className="text-success">admin@{machine.hostname}</span>
                  <span className="text-muted-foreground">:</span>
                  <span className="text-primary">~</span>
                  <span className="text-muted-foreground">$</span>
                  <span className="text-foreground">{item.command}</span>
                </div>
                {item.output && (
                  <pre className={cn(
                    "mt-1 whitespace-pre-wrap break-all",
                    item.status === 'error' ? 'text-destructive' : 'text-muted-foreground'
                  )}>
                    {item.output}
                  </pre>
                )}
              </div>
            ))}
          </div>

          {/* Command Input */}
          <div className="mt-3 flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-success">$</span>
              <Input
                ref={inputRef}
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Entrez une commande..."
                className="bg-background/80 pl-7 font-mono text-sm"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <Button 
              onClick={executeCommand} 
              size="icon"
              className="shrink-0"
              disabled={!command.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary Footer */}
      <div className="border-t border-border p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{processes.length}</p>
            <p className="text-xs text-muted-foreground">Processus</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-success">
              {processes.filter(p => p.status === 'running').length}
            </p>
            <p className="text-xs text-muted-foreground">Running</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-destructive">
              {processes.filter(p => p.status === 'stopped').length}
            </p>
            <p className="text-xs text-muted-foreground">Stopped</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProcessItemProps {
  process: Process;
  onAction: (pid: number, action: string) => void;
}

function ProcessItem({ process, onAction }: ProcessItemProps) {
  const isRunning = process.status === 'running';
  
  return (
    <div className={cn(
      'rounded-lg border border-border bg-secondary/30 p-3 transition-colors hover:bg-secondary/50',
      process.status === 'stopped' && 'opacity-60'
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-mono font-medium">{process.name}</span>
            <StatusBadge status={process.status} size="sm" />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="font-mono">PID: {process.pid}</span>
            <span className="flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              {process.cpuUsage.toFixed(1)}%
            </span>
            <span className="flex items-center gap-1">
              <MemoryStick className="h-3 w-3" />
              {process.ramUsage.toFixed(0)} MB
            </span>
            <span className="font-mono text-primary/70">@{process.user}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {!isRunning && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-success hover:bg-success/20 hover:text-success"
              onClick={() => onAction(process.pid, 'start')}
            >
              <Play className="h-3.5 w-3.5" />
            </Button>
          )}
          {isRunning && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-warning hover:bg-warning/20 hover:text-warning"
                onClick={() => onAction(process.pid, 'restart')}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/20 hover:text-destructive"
                onClick={() => onAction(process.pid, 'stop')}
              >
                <Square className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
