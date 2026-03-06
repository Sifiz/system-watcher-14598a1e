export type FailureAction = 'retry' | 'skip' | 'abort';

export interface ScenarioStep {
  id: string;
  processName: string;
  machineId: string;
  delay: number; // seconds before launching
  healthCheck: boolean; // wait for process to be healthy before next step
  healthTimeout: number; // seconds to wait for health check
  onFailure: FailureAction;
  retryCount: number;
  order: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  steps: ScenarioStep[];
  enabled: boolean;
  lastRun?: Date;
  status: 'idle' | 'running' | 'success' | 'error';
  createdAt: Date;
}
