export interface Machine {
  id: string;
  name: string;
  hostname: string;
  status: 'online' | 'offline' | 'warning';
  cpuUsage: number;
  ramUsage: number;
  ramTotal: number;
  loadAverage: [number, number, number];
  uptime: number;
  lastUpdate: Date;
  cpuHistory: { time: string; value: number }[];
  ramHistory: { time: string; value: number }[];
}

export interface Process {
  pid: number;
  name: string;
  cpuUsage: number;
  ramUsage: number;
  status: 'running' | 'sleeping' | 'stopped' | 'zombie';
  user: string;
  machineId: string;
}

export type ProcessAction = 'start' | 'stop' | 'restart';
