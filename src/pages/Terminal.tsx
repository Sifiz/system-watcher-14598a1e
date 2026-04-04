import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Terminal as TerminalIcon, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { Machine } from '@/types/monitoring';
import { cn } from '@/lib/utils';

interface CommandOutput {
  id: string;
  command: string;
  output: string;
  timestamp: Date;
  status: 'success' | 'error';
}

export default function TerminalPage() {
  const { machineId } = useParams<{ machineId: string }>();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<CommandOutput[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!machineId) return;
    api.getMachines().then(machines => {
      const m = machines.find(m => m.id === machineId);
      if (m) setMachine({ ...m, lastUpdate: new Date(m.lastUpdate) });
    }).catch(() => {
      setMachine({ id: machineId, name: machineId, hostname: machineId } as Machine);
    });
  }, [machineId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [commandHistory]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const executeCommand = useCallback(async () => {
    if (!command.trim() || !machineId) return;

    if (command.trim().toLowerCase() === 'clear') {
      setCommandHistory([]);
      setCommand('');
      return;
    }

    setIsExecuting(true);
    try {
      const result = await api.executeCommand(machineId, command);
      setCommandHistory(prev => [...prev, {
        id: crypto.randomUUID(),
        command,
        output: result.output,
        timestamp: new Date(),
        status: 'success',
      }]);
    } catch (err) {
      setCommandHistory(prev => [...prev, {
        id: crypto.randomUUID(),
        command,
        output: err instanceof Error ? err.message : 'Erreur de connexion',
        timestamp: new Date(),
        status: 'error',
      }]);
    } finally {
      setIsExecuting(false);
      setCommand('');
      setHistoryIndex(-1);
    }
  }, [command, machineId]);

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
        setCommand(commandHistory.map(h => h.command)[commandHistory.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  const hostname = machine?.hostname || machineId || 'unknown';
  const machineName = machine?.name || machineId || 'Machine';

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border bg-card/50 px-4 py-2 backdrop-blur-sm">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-primary/10 p-1.5">
            <TerminalIcon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">
              <span className="text-gradient">Terminal</span>
              <span className="ml-2 text-muted-foreground font-normal">— {machineName}</span>
            </h1>
            <p className="font-mono text-xs text-muted-foreground">{hostname}</p>
          </div>
        </div>
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCommandHistory([])}
            className="h-7 gap-1 px-2 text-xs"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </Button>
        </div>
      </header>

      {/* Terminal body */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto p-4 font-mono text-sm"
        onClick={() => inputRef.current?.focus()}
      >
        {commandHistory.length === 0 && (
          <div className="text-muted-foreground">
            <p>Connected to <span className="text-primary">{hostname}</span>. Type commands below.</p>
            <p className="mt-1 text-primary/70">$ _</p>
          </div>
        )}
        {commandHistory.map((item) => (
          <div key={item.id} className="mb-3">
            <div className="flex items-center gap-2">
              <span className="text-success">admin@{hostname}</span>
              <span className="text-muted-foreground">:</span>
              <span className="text-primary">~</span>
              <span className="text-muted-foreground">$</span>
              <span className="text-foreground">{item.command}</span>
            </div>
            {item.output && (
              <pre className={cn(
                "mt-1 whitespace-pre-wrap break-all text-xs",
                item.status === 'error' ? 'text-destructive' : 'text-muted-foreground'
              )}>
                {item.output}
              </pre>
            )}
          </div>
        ))}
        {isExecuting && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="animate-pulse">⏳</span> Executing...
          </div>
        )}
      </div>

      {/* Command input */}
      <div className="border-t border-border bg-card/50 p-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-success">$</span>
            <Input
              ref={inputRef}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Entrez une commande..."
              className="bg-background pl-7 font-mono text-sm"
              autoComplete="off"
              spellCheck={false}
              disabled={isExecuting}
            />
          </div>
          <Button
            onClick={executeCommand}
            size="icon"
            disabled={!command.trim() || isExecuting}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
