import { useState, useEffect, useCallback, useRef } from 'react';
import { Machine, Process } from '@/types/monitoring';
import { api } from '@/lib/api';

const POLL_INTERVAL = 3000;

// Demo data when backend is unreachable
function generateDemoMachine(): Machine {
  const now = new Date();
  const cpu = Math.round(30 + Math.random() * 40);
  const ram = Math.round(40 + Math.random() * 30);
  return {
    id: 'demo-machine-1',
    name: 'Demo Server',
    hostname: '192.168.1.100',
    status: 'online',
    cpuUsage: cpu,
    ramUsage: ram,
    ramTotal: 16384,
    loadAverage: [1.2, 0.8, 0.6],
    uptime: 86400 * 3 + 3600 * 7,
    lastUpdate: now,
    cpuHistory: Array.from({ length: 20 }, (_, i) => ({
      time: new Date(now.getTime() - (19 - i) * 60000).toISOString(),
      value: Math.round(20 + Math.random() * 50),
    })),
    ramHistory: Array.from({ length: 20 }, (_, i) => ({
      time: new Date(now.getTime() - (19 - i) * 60000).toISOString(),
      value: Math.round(35 + Math.random() * 30),
    })),
    pinnedProcesses: [
      { name: 'nginx', status: 'running' },
      { name: 'postgresql', status: 'running' },
      { name: 'redis-server', status: 'stopped' },
    ],
  };
}

const DEMO_PROCESSES: Process[] = [
  { pid: 1, name: 'systemd', cpuUsage: 0.1, ramUsage: 0.5, status: 'running', user: 'root', machineId: 'demo-machine-1' },
  { pid: 234, name: 'nginx', cpuUsage: 2.3, ramUsage: 1.8, status: 'running', user: 'www-data', machineId: 'demo-machine-1' },
  { pid: 567, name: 'postgresql', cpuUsage: 5.1, ramUsage: 8.4, status: 'running', user: 'postgres', machineId: 'demo-machine-1' },
  { pid: 890, name: 'node', cpuUsage: 12.4, ramUsage: 4.2, status: 'running', user: 'deploy', machineId: 'demo-machine-1' },
  { pid: 1023, name: 'redis-server', cpuUsage: 0.0, ramUsage: 1.1, status: 'stopped', user: 'redis', machineId: 'demo-machine-1' },
  { pid: 1456, name: 'python3', cpuUsage: 8.7, ramUsage: 3.6, status: 'running', user: 'deploy', machineId: 'demo-machine-1' },
];

export function useMonitoringData() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const selectedMachineRef = useRef<Machine | null>(null);

  useEffect(() => {
    selectedMachineRef.current = selectedMachine;
  }, [selectedMachine]);

  const fetchMachines = useCallback(async () => {
    try {
      const data = await api.getMachines();
      const parsed = data.map(m => ({
        ...m,
        lastUpdate: new Date(m.lastUpdate),
      }));
      setMachines(parsed);
      setError(null);
      setIsDemo(false);

      if (selectedMachineRef.current) {
        const updated = parsed.find(m => m.id === selectedMachineRef.current!.id);
        if (updated) setSelectedMachine(updated);
      }
    } catch {
      // Fallback to demo mode
      if (!isDemo && machines.length === 0) {
        const demo = generateDemoMachine();
        setMachines([demo]);
        setIsDemo(true);
        setError('Mode démo — backend non connecté');
      } else if (isDemo) {
        // Refresh demo data with new metrics
        setMachines(prev => prev.map(m => ({
          ...m,
          cpuUsage: Math.round(30 + Math.random() * 40),
          ramUsage: Math.round(40 + Math.random() * 30),
          lastUpdate: new Date(),
          cpuHistory: [...m.cpuHistory.slice(1), { time: new Date().toISOString(), value: Math.round(20 + Math.random() * 50) }],
          ramHistory: [...m.ramHistory.slice(1), { time: new Date().toISOString(), value: Math.round(35 + Math.random() * 30) }],
        })));
      }
    } finally {
      setIsLoading(false);
    }
  }, [isDemo, machines.length]);

  useEffect(() => {
    fetchMachines();
    const interval = setInterval(fetchMachines, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchMachines]);

  const fetchProcesses = useCallback(async (machineId: string) => {
    if (isDemo) {
      setProcesses(DEMO_PROCESSES);
      return;
    }
    try {
      const data = await api.getProcesses(machineId);
      setProcesses(data);
    } catch {
      setProcesses(isDemo ? DEMO_PROCESSES : []);
    }
  }, [isDemo]);

  useEffect(() => {
    if (selectedMachine) {
      fetchProcesses(selectedMachine.id);
      const interval = setInterval(() => fetchProcesses(selectedMachine.id), POLL_INTERVAL);
      return () => clearInterval(interval);
    } else {
      setProcesses([]);
    }
  }, [selectedMachine, fetchProcesses]);

  const handleProcessAction = useCallback(async (pid: number, action: string) => {
    if (!selectedMachineRef.current) return;
    if (isDemo) {
      setProcesses(prev => prev.map(p => {
        if (p.pid === pid) {
          if (action === 'stop') return { ...p, status: 'stopped' as const };
          if (action === 'start' || action === 'restart') return { ...p, status: 'running' as const };
        }
        return p;
      }));
      return;
    }
    try {
      await api.processAction(selectedMachineRef.current.id, pid, action);
      setProcesses(prev => prev.map(p => {
        if (p.pid === pid) {
          if (action === 'stop') return { ...p, status: 'stopped' as const };
          if (action === 'start' || action === 'restart') return { ...p, status: 'running' as const };
        }
        return p;
      }));
      await fetchProcesses(selectedMachineRef.current.id);
    } catch (err) {
      console.error(`Failed to ${action} process ${pid}:`, err);
    }
  }, [fetchProcesses, isDemo]);

  return {
    machines,
    selectedMachine,
    setSelectedMachine,
    processes,
    isLoading,
    error,
    isDemo,
    handleProcessAction,
    refreshMachines: fetchMachines,
  };
}
