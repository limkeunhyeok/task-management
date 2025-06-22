import { SetMetadata } from '@nestjs/common';
import 'reflect-metadata';

export const SCHEDULE_TASK_METADATA = 'TASK_METADATA';

export interface ScheduleTaskOptions {
  name?: string; // default: 클래스명
  cron: string;
}

export function ScheduleTask(options: ScheduleTaskOptions): ClassDecorator {
  return (target: Function) => {
    SetMetadata(SCHEDULE_TASK_METADATA, options)(target);
  };
}
