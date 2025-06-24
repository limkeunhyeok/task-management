import { CronCallback } from 'cron';

export interface DefinedTask {
  name: string;
  cronTime: string;
  runner: CronCallback<null>;
}

export interface TaskStatusReport {
  name: string;
  isRunning: boolean;
  cronTime: string | null;
  lastExecution: string | null;
  nextExecution: string | null;
}
