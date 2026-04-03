// Base API configuration — point this to your backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.text().catch(() => 'Unknown error');
    throw new Error(`API ${res.status}: ${error}`);
  }

  return res.json();
}

// ─── Monitoring ───

export const api = {
  // Machines
  getMachines: () => request<import('@/types/monitoring').Machine[]>('/machines'),

  // Processes for a machine
  getProcesses: (machineId: string) =>
    request<import('@/types/monitoring').Process[]>(`/machines/${machineId}/processes`),

  // Process actions (start/stop/restart)
  processAction: (machineId: string, pid: number, action: string) =>
    request<{ success: boolean }>(`/machines/${machineId}/processes/${pid}/${action}`, {
      method: 'POST',
    }),

  // Execute command on a machine
  executeCommand: (machineId: string, command: string) =>
    request<{ output: string }>(`/machines/${machineId}/exec`, {
      method: 'POST',
      body: JSON.stringify({ command }),
    }),

  // ─── Config Files ───

  getConfigFiles: () =>
    request<import('@/types/configFile').ConfigFile[]>('/config-files'),

  saveConfigFile: (id: string, content: string) =>
    request<import('@/types/configFile').ConfigFile>(`/config-files/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),

  deleteConfigFile: (id: string) =>
    request<void>(`/config-files/${id}`, { method: 'DELETE' }),

  createConfigFile: (data: { name: string; path: string; machineId: string }) =>
    request<import('@/types/configFile').ConfigFile>('/config-files', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // ─── Scenarios ───

  getScenarios: () =>
    request<import('@/types/scenario').Scenario[]>('/scenarios'),

  createScenario: (data: { name: string; description: string }) =>
    request<import('@/types/scenario').Scenario>('/scenarios', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateScenario: (id: string, data: Partial<import('@/types/scenario').Scenario>) =>
    request<import('@/types/scenario').Scenario>(`/scenarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteScenario: (id: string) =>
    request<void>(`/scenarios/${id}`, { method: 'DELETE' }),

  addScenarioStep: (scenarioId: string, step: Omit<import('@/types/scenario').ScenarioStep, 'id' | 'order'>) =>
    request<import('@/types/scenario').Scenario>(`/scenarios/${scenarioId}/steps`, {
      method: 'POST',
      body: JSON.stringify(step),
    }),

  updateScenarioStep: (scenarioId: string, stepId: string, data: Partial<import('@/types/scenario').ScenarioStep>) =>
    request<import('@/types/scenario').Scenario>(`/scenarios/${scenarioId}/steps/${stepId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  removeScenarioStep: (scenarioId: string, stepId: string) =>
    request<import('@/types/scenario').Scenario>(`/scenarios/${scenarioId}/steps/${stepId}`, {
      method: 'DELETE',
    }),

  moveScenarioStep: (scenarioId: string, stepId: string, direction: 'up' | 'down') =>
    request<import('@/types/scenario').Scenario>(`/scenarios/${scenarioId}/steps/${stepId}/move`, {
      method: 'POST',
      body: JSON.stringify({ direction }),
    }),

  runScenario: (id: string) =>
    request<{ status: string }>(`/scenarios/${id}/run`, { method: 'POST' }),
};
