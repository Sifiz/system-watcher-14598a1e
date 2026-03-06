import { useState, useEffect, useCallback } from 'react';
import { Machine, Process } from '@/types/monitoring';

// Generate mock historical data
const generateHistory = (baseValue: number, variance: number = 15) => {
  const now = new Date();
  return Array.from({ length: 20 }, (_, i) => ({
    time: new Date(now.getTime() - (19 - i) * 5000).toLocaleTimeString(),
    value: Math.max(0, Math.min(100, baseValue + (Math.random() - 0.5) * variance)),
  }));
};

// Mock machines data
const generateMockMachines = (): Machine[] => [
  {
    id: 'srv-001',
    name: 'Production Server',
    hostname: 'prod-srv-01.local',
    status: 'online',
    cpuUsage: 45 + Math.random() * 20,
    ramUsage: 68 + Math.random() * 10,
    ramTotal: 32,
    loadAverage: [1.2, 0.9, 0.8],
    uptime: 864000,
    lastUpdate: new Date(),
    cpuHistory: generateHistory(50),
    ramHistory: generateHistory(70, 8),
    pinnedProcesses: [
      { name: 'nginx', status: 'running' },
      { name: 'node', status: 'running' },
      { name: 'redis-server', status: 'running' },
    ],
  },
  {
    id: 'srv-002',
    name: 'Database Server',
    hostname: 'db-srv-01.local',
    status: 'online',
    cpuUsage: 25 + Math.random() * 15,
    ramUsage: 82 + Math.random() * 8,
    ramTotal: 64,
    loadAverage: [0.5, 0.6, 0.4],
    uptime: 1728000,
    lastUpdate: new Date(),
    cpuHistory: generateHistory(30, 10),
    ramHistory: generateHistory(85, 5),
    pinnedProcesses: [
      { name: 'postgres', status: 'running' },
      { name: 'redis-server', status: 'running' },
    ],
  },
  {
    id: 'srv-003',
    name: 'API Gateway',
    hostname: 'api-gw-01.local',
    status: 'warning',
    cpuUsage: 78 + Math.random() * 15,
    ramUsage: 55 + Math.random() * 10,
    ramTotal: 16,
    loadAverage: [2.1, 1.8, 1.5],
    uptime: 432000,
    lastUpdate: new Date(),
    cpuHistory: generateHistory(80, 12),
    ramHistory: generateHistory(55),
  },
  {
    id: 'srv-004',
    name: 'Worker Node 1',
    hostname: 'worker-01.local',
    status: 'online',
    cpuUsage: 35 + Math.random() * 20,
    ramUsage: 42 + Math.random() * 15,
    ramTotal: 16,
    loadAverage: [0.8, 0.7, 0.6],
    uptime: 2592000,
    lastUpdate: new Date(),
    cpuHistory: generateHistory(40),
    ramHistory: generateHistory(45),
  },
  {
    id: 'srv-005',
    name: 'Backup Server',
    hostname: 'backup-srv.local',
    status: 'offline',
    cpuUsage: 0,
    ramUsage: 0,
    ramTotal: 8,
    loadAverage: [0, 0, 0],
    uptime: 0,
    lastUpdate: new Date(Date.now() - 3600000),
    cpuHistory: generateHistory(0, 0),
    ramHistory: generateHistory(0, 0),
  },
  {
    id: 'srv-006',
    name: 'Dev Server',
    hostname: 'dev-srv-01.local',
    status: 'online',
    cpuUsage: 15 + Math.random() * 25,
    ramUsage: 38 + Math.random() * 12,
    ramTotal: 32,
    loadAverage: [0.3, 0.4, 0.3],
    uptime: 172800,
    lastUpdate: new Date(),
    cpuHistory: generateHistory(20),
    ramHistory: generateHistory(40),
  },
];

// Mock processes data
const generateMockProcesses = (machineId: string): Process[] => {
  const processNames = [
    'node', 'python', 'nginx', 'postgres', 'redis-server',
    'docker', 'systemd', 'sshd', 'cron', 'rsyslogd'
  ];
  
  return processNames.map((name, index) => ({
    pid: 1000 + index + Math.floor(Math.random() * 1000),
    name,
    cpuUsage: Math.random() * 30,
    ramUsage: Math.random() * 500,
    status: Math.random() > 0.1 ? 'running' : 'sleeping',
    user: index < 3 ? 'root' : 'www-data',
    machineId,
  }));
};

export function useMonitoringData() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data
  useEffect(() => {
    setMachines(generateMockMachines());
    setIsLoading(false);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMachines(prevMachines => 
        prevMachines.map(machine => {
          if (machine.status === 'offline') return machine;
          
          const newCpuUsage = Math.max(0, Math.min(100, 
            machine.cpuUsage + (Math.random() - 0.5) * 10
          ));
          const newRamUsage = Math.max(0, Math.min(100, 
            machine.ramUsage + (Math.random() - 0.5) * 5
          ));
          
          const now = new Date();
          const newCpuHistory = [
            ...machine.cpuHistory.slice(1),
            { time: now.toLocaleTimeString(), value: newCpuUsage }
          ];
          const newRamHistory = [
            ...machine.ramHistory.slice(1),
            { time: now.toLocaleTimeString(), value: newRamUsage }
          ];

          return {
            ...machine,
            cpuUsage: newCpuUsage,
            ramUsage: newRamUsage,
            cpuHistory: newCpuHistory,
            ramHistory: newRamHistory,
            lastUpdate: now,
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Load processes when machine is selected
  useEffect(() => {
    if (selectedMachine) {
      setProcesses(generateMockProcesses(selectedMachine.id));
    }
  }, [selectedMachine]);

  const handleProcessAction = useCallback((pid: number, action: string) => {
    console.log(`Action: ${action} on process ${pid}`);
    // In a real app, this would send a command to the server
    setProcesses(prev => prev.map(p => {
      if (p.pid === pid) {
        if (action === 'stop') return { ...p, status: 'stopped' as const };
        if (action === 'start' || action === 'restart') return { ...p, status: 'running' as const };
      }
      return p;
    }));
  }, []);

  return {
    machines,
    selectedMachine,
    setSelectedMachine,
    processes,
    isLoading,
    handleProcessAction,
  };
}
