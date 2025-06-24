import { Injectable, Logger } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { SchedulerRegistry } from '@nestjs/schedule';
import {
  SCHEDULE_TASK_METADATA,
  ScheduleTaskOptions,
} from 'src/common/decorators/schedule-task.decorator';
import { Task } from '../tasks/task.interface';
import { TaskRegistrationStatus } from './task-management.constants';
import { DefinedTask, TaskStatusReport } from './task-management.interface';

@Injectable()
export class TaskManagementService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly discoveryService: DiscoveryService,
  ) {}

  getRegisteredTasks(): DefinedTask[] {
    const tasks: DefinedTask[] = [];

    const providers = this.discoveryService.getProviders();

    for (const wrapper of providers) {
      const { instance } = wrapper;
      const targetClass = instance?.constructor;

      if (instance && typeof instance === 'object' && targetClass) {
        const className = targetClass.name;

        const taskOptions: ScheduleTaskOptions = Reflect.getMetadata(
          SCHEDULE_TASK_METADATA,
          targetClass,
        );

        if (taskOptions) {
          tasks.push({
            name: taskOptions.name ?? className,
            cronTime: taskOptions.cron,
            taskFunction: (instance as Task).execute.bind(instance),
          });
        }
      }
    }
    return tasks;
  }

  listAllScheduledTasks(): TaskStatusReport[] {
    const answer: TaskStatusReport[] = [];

    const definedTasks = this.getRegisteredTasks();

    for (const task of definedTasks) {
      const name = task.name;
      let isRunning = false;
      let cronTime: string | null = null;
      let lastExecution: string | null = null;
      let nextExecution: string | null = null;
      let status: TaskRegistrationStatus =
        TaskRegistrationStatus.NOT_REGISTERED;

      try {
        const job = this.schedulerRegistry.getCronJob(name);

        isRunning = job.isActive;
        cronTime = job.cronTime.toString();
        lastExecution = job.lastExecution
          ? job.lastExecution.toISOString()
          : null;
        nextExecution = job.nextDate() ? job.nextDate().toString() : null;
        status = TaskRegistrationStatus.REGISTERED;
      } catch (err: any) {
        // schedulerRegistry.getCronJob 로직상 없으면 단순 에러
        this.logger.warn(
          `Task "${name}" is not registered in SchedulerRegistry.`,
        );
        status = TaskRegistrationStatus.NOT_REGISTERED;
      }

      answer.push({
        name,
        isRunning,
        cronTime,
        lastExecution,
        nextExecution,
      });
    }

    return answer;
  }

  executeTask() {
    return 'hello world';
  }

  scheduleTask() {
    return 'hello world';
  }

  unscheduleTask() {
    return 'hello world';
  }

  getTaskStatus() {
    return 'hello world';
  }
}
