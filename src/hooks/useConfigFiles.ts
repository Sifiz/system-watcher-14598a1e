import { useState, useEffect, useCallback } from 'react';
import { ConfigFile } from '@/types/configFile';
import { api } from '@/lib/api';

export function useConfigFiles() {
  const [files, setFiles] = useState<ConfigFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const selectedFile = files.find(f => f.id === selectedFileId) || null;

  const fetchFiles = useCallback(async () => {
    try {
      const data = await api.getConfigFiles();
      const parsed = data.map(f => ({
        ...f,
        lastModified: new Date(f.lastModified),
      }));
      setFiles(parsed);
    } catch (err) {
      console.error('Failed to fetch config files:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleSave = useCallback(async (id: string, content: string) => {
    try {
      const updated = await api.saveConfigFile(id, content);
      updated.lastModified = new Date(updated.lastModified);
      setFiles(prev => prev.map(f => f.id === id ? updated : f));
    } catch (err) {
      console.error('Failed to save config file:', err);
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await api.deleteConfigFile(id);
      setFiles(prev => prev.filter(f => f.id !== id));
      if (selectedFileId === id) setSelectedFileId(null);
    } catch (err) {
      console.error('Failed to delete config file:', err);
    }
  }, [selectedFileId]);

  const handleCreate = useCallback(async (name: string, path: string, machineId: string) => {
    try {
      const newFile = await api.createConfigFile({ name, path, machineId });
      newFile.lastModified = new Date(newFile.lastModified);
      setFiles(prev => [...prev, newFile]);
      setSelectedFileId(newFile.id);
    } catch (err) {
      console.error('Failed to create config file:', err);
    }
  }, []);

  return {
    files,
    selectedFile,
    selectedFileId,
    setSelectedFileId,
    isLoading,
    handleSave,
    handleDelete,
    handleCreate,
  };
}
