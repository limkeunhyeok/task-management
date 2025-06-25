export interface DefinedTask {
  name: string;
  cronTime: string;
  runner: () => void | Promise<void>;
}

export interface TaskStatusReport {
  name: string;
  isRunning: boolean;
  cronTime: string | null;
  lastExecution: string | null;
  nextExecution: string | null;
}
