import { useState, useCallback } from 'react';
import { Scenario, ScenarioStep, FailureAction } from '@/types/scenario';

const generateId = () => Math.random().toString(36).substring(2, 10);

const defaultScenarios: Scenario[] = [
  {
    id: 'sc-001',
    name: 'Production Startup',
    description: 'Lance les services de production dans l\'ordre : DB → Cache → API → Frontend',
    steps: [
      { id: 's1', processName: 'postgres', machineId: 'srv-002', delay: 0, healthCheck: true, healthTimeout: 30, onFailure: 'abort', retryCount: 3, order: 0 },
      { id: 's2', processName: 'redis-server', machineId: 'srv-002', delay: 5, healthCheck: true, healthTimeout: 15, onFailure: 'retry', retryCount: 2, order: 1 },
      { id: 's3', processName: 'nginx', machineId: 'srv-001', delay: 2, healthCheck: true, healthTimeout: 10, onFailure: 'abort', retryCount: 1, order: 2 },
      { id: 's4', processName: 'node', machineId: 'srv-001', delay: 3, healthCheck: false, healthTimeout: 10, onFailure: 'skip', retryCount: 0, order: 3 },
    ],
    enabled: true,
    lastRun: new Date(Date.now() - 86400000),
    status: 'success',
    createdAt: new Date(Date.now() - 604800000),
  },
  {
    id: 'sc-002',
    name: 'Dev Environment',
    description: 'Initialise l\'environnement de développement local',
    steps: [
      { id: 's5', processName: 'docker', machineId: 'srv-006', delay: 0, healthCheck: true, healthTimeout: 60, onFailure: 'abort', retryCount: 2, order: 0 },
      { id: 's6', processName: 'postgres', machineId: 'srv-006', delay: 10, healthCheck: true, healthTimeout: 20, onFailure: 'retry', retryCount: 3, order: 1 },
      { id: 's7', processName: 'node', machineId: 'srv-006', delay: 5, healthCheck: false, healthTimeout: 10, onFailure: 'skip', retryCount: 0, order: 2 },
    ],
    enabled: false,
    status: 'idle',
    createdAt: new Date(Date.now() - 259200000),
  },
];

export function useScenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>(defaultScenarios);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>('sc-001');

  const selectedScenario = scenarios.find(s => s.id === selectedScenarioId) || null;

  const createScenario = useCallback((name: string, description: string) => {
    const newScenario: Scenario = {
      id: generateId(),
      name,
      description,
      steps: [],
      enabled: false,
      status: 'idle',
      createdAt: new Date(),
    };
    setScenarios(prev => [...prev, newScenario]);
    setSelectedScenarioId(newScenario.id);
  }, []);

  const deleteScenario = useCallback((id: string) => {
    setScenarios(prev => prev.filter(s => s.id !== id));
    if (selectedScenarioId === id) setSelectedScenarioId(null);
  }, [selectedScenarioId]);

  const updateScenario = useCallback((id: string, updates: Partial<Scenario>) => {
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const addStep = useCallback((scenarioId: string, step: Omit<ScenarioStep, 'id' | 'order'>) => {
    setScenarios(prev => prev.map(s => {
      if (s.id !== scenarioId) return s;
      const newStep: ScenarioStep = { ...step, id: generateId(), order: s.steps.length };
      return { ...s, steps: [...s.steps, newStep] };
    }));
  }, []);

  const updateStep = useCallback((scenarioId: string, stepId: string, updates: Partial<ScenarioStep>) => {
    setScenarios(prev => prev.map(s => {
      if (s.id !== scenarioId) return s;
      return { ...s, steps: s.steps.map(st => st.id === stepId ? { ...st, ...updates } : st) };
    }));
  }, []);

  const removeStep = useCallback((scenarioId: string, stepId: string) => {
    setScenarios(prev => prev.map(s => {
      if (s.id !== scenarioId) return s;
      const filtered = s.steps.filter(st => st.id !== stepId).map((st, i) => ({ ...st, order: i }));
      return { ...s, steps: filtered };
    }));
  }, []);

  const moveStep = useCallback((scenarioId: string, stepId: string, direction: 'up' | 'down') => {
    setScenarios(prev => prev.map(s => {
      if (s.id !== scenarioId) return s;
      const steps = [...s.steps];
      const idx = steps.findIndex(st => st.id === stepId);
      if (idx < 0) return s;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= steps.length) return s;
      [steps[idx], steps[swapIdx]] = [steps[swapIdx], steps[idx]];
      return { ...s, steps: steps.map((st, i) => ({ ...st, order: i })) };
    }));
  }, []);

  const runScenario = useCallback((id: string) => {
    updateScenario(id, { status: 'running', lastRun: new Date() });
    // Simulate execution
    setTimeout(() => {
      updateScenario(id, { status: Math.random() > 0.2 ? 'success' : 'error' });
    }, 3000);
  }, [updateScenario]);

  return {
    scenarios,
    selectedScenario,
    selectedScenarioId,
    setSelectedScenarioId,
    createScenario,
    deleteScenario,
    updateScenario,
    addStep,
    updateStep,
    removeStep,
    moveStep,
    runScenario,
  };
}
