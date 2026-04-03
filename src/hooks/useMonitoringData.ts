import { useState, useEffect, useCallback, useRef } from 'react';
import { Machine, Process } from '@/types/monitoring';
import { api } from '@/lib/api';

const POLL_INTERVAL = 3000;

export function useMonitoringData() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const selectedMachineRef = useRef<Machine | null>(null);

  // Keep ref in sync
  useEffect(() => {
    selectedMachineRef.current = selectedMachine;
  }, [selectedMachine]);

  // Fetch machines (initial + polling)
  const fetchMachines = useCallback(async () => {
    try {
      const data = await api.getMachines();
      // Ensure dates are Date objects
      const parsed = data.map(m => ({
        ...m,
        lastUpdate: new Date(m.lastUpdate),
      }));
      setMachines(parsed);
      setError(null);

      // Update selected machine data if one is selected
      if (selectedMachineRef.current) {
        const updated = parsed.find(m => m.id === selectedMachineRef.current!.id);
        if (updated) setSelectedMachine(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMachines();
    const interval = setInterval(fetchMachines, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchMachines]);

  // Fetch processes when machine is selected
  const fetchProcesses = useCallback(async (machineId: string) => {
    try {
      const data = await api.getProcesses(machineId);
      setProcesses(data);
    } catch (err) {
      console.error('Failed to fetch processes:', err);
      setProcesses([]);
    }
  }, []);

  useEffect(() => {
    if (selectedMachine) {
      fetchProcesses(selectedMachine.id);
      const interval = setInterval(() => fetchProcesses(selectedMachine.id), POLL_INTERVAL);
      return () => clearInterval(interval);
    } else {
      setProcesses([]);
    }
  }, [selectedMachine, fetchProcesses]);

  // Process actions via API
  const handleProcessAction = useCallback(async (pid: number, action: string) => {
    if (!selectedMachineRef.current) return;
    try {
      await api.processAction(selectedMachineRef.current.id, pid, action);
      // Optimistic update
      setProcesses(prev => prev.map(p => {
        if (p.pid === pid) {
          if (action === 'stop') return { ...p, status: 'stopped' as const };
          if (action === 'start' || action === 'restart') return { ...p, status: 'running' as const };
        }
        return p;
      }));
      // Refresh from server
      await fetchProcesses(selectedMachineRef.current.id);
    } catch (err) {
      console.error(`Failed to ${action} process ${pid}:`, err);
    }
  }, [fetchProcesses]);

  return {
    machines,
    selectedMachine,
    setSelectedMachine,
    processes,
    isLoading,
    error,
    handleProcessAction,
    refreshMachines: fetchMachines,
  };
}
