export interface ConfigFile {
  id: string;
  name: string;
  path: string;
  content: string;
  lastModified: Date;
  size: number;
  machineId: string;
}
