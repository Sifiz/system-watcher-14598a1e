import { useState, useEffect, useCallback } from 'react';
import { Scenario, ScenarioStep } from '@/types/scenario';
import { api } from '@/lib/api';

export function useScenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const selectedScenario = scenarios.find(s => s.id === selectedScenarioId) || null;

  // Fetch scenarios
  const fetchScenarios = useCallback(async () => {
    try {
      const data = await api.getScenarios();
      const parsed = data.map(s => ({
        ...s,
        createdAt: new Date(s.createdAt),
        lastRun: s.lastRun ? new Date(s.lastRun) : undefined,
      }));
      setScenarios(parsed);
      if (!selectedScenarioId && parsed.length > 0) {
        setSelectedScenarioId(parsed[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch scenarios:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedScenarioId]);

  useEffect(() => {
    fetchScenarios();
  }, []);

  const createScenario = useCallback(async (name: string, description: string) => {
    try {
      const newScenario = await api.createScenario({ name, description });
      newScenario.createdAt = new Date(newScenario.createdAt);
      setScenarios(prev => [...prev, newScenario]);
      setSelectedScenarioId(newScenario.id);
    } catch (err) {
      console.error('Failed to create scenario:', err);
    }
  }, []);

  const deleteScenario = useCallback(async (id: string) => {
    try {
      await api.deleteScenario(id);
      setScenarios(prev => prev.filter(s => s.id !== id));
      if (selectedScenarioId === id) setSelectedScenarioId(null);
    } catch (err) {
      console.error('Failed to delete scenario:', err);
    }
  }, [selectedScenarioId]);

  const updateScenario = useCallback(async (id: string, updates: Partial<Scenario>) => {
    try {
      const updated = await api.updateScenario(id, updates);
      updated.createdAt = new Date(updated.createdAt);
      if (updated.lastRun) updated.lastRun = new Date(updated.lastRun);
      setScenarios(prev => prev.map(s => s.id === id ? updated : s));
    } catch (err) {
      console.error('Failed to update scenario:', err);
    }
  }, []);

  const addStep = useCallback(async (scenarioId: string, step: Omit<ScenarioStep, 'id' | 'order'>) => {
    try {
      const updated = await api.addScenarioStep(scenarioId, step);
      updated.createdAt = new Date(updated.createdAt);
      setScenarios(prev => prev.map(s => s.id === scenarioId ? updated : s));
    } catch (err) {
      console.error('Failed to add step:', err);
    }
  }, []);

  const updateStep = useCallback(async (scenarioId: string, stepId: string, updates: Partial<ScenarioStep>) => {
    try {
      const updated = await api.updateScenarioStep(scenarioId, stepId, updates);
      updated.createdAt = new Date(updated.createdAt);
      setScenarios(prev => prev.map(s => s.id === scenarioId ? updated : s));
    } catch (err) {
      console.error('Failed to update step:', err);
    }
  }, []);

  const removeStep = useCallback(async (scenarioId: string, stepId: string) => {
    try {
      const updated = await api.removeScenarioStep(scenarioId, stepId);
      updated.createdAt = new Date(updated.createdAt);
      setScenarios(prev => prev.map(s => s.id === scenarioId ? updated : s));
    } catch (err) {
      console.error('Failed to remove step:', err);
    }
  }, []);

  const moveStep = useCallback(async (scenarioId: string, stepId: string, direction: 'up' | 'down') => {
    try {
      const updated = await api.moveScenarioStep(scenarioId, stepId, direction);
      updated.createdAt = new Date(updated.createdAt);
      setScenarios(prev => prev.map(s => s.id === scenarioId ? updated : s));
    } catch (err) {
      console.error('Failed to move step:', err);
    }
  }, []);

  const runScenario = useCallback(async (id: string) => {
    try {
      // Optimistic update
      setScenarios(prev => prev.map(s => s.id === id ? { ...s, status: 'running' as const, lastRun: new Date() } : s));
      await api.runScenario(id);
      // Refresh to get final status
      await fetchScenarios();
    } catch (err) {
      console.error('Failed to run scenario:', err);
      setScenarios(prev => prev.map(s => s.id === id ? { ...s, status: 'error' as const } : s));
    }
  }, [fetchScenarios]);

  return {
    scenarios,
    selectedScenario,
    selectedScenarioId,
    setSelectedScenarioId,
    isLoading,
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
