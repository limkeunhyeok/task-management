import { Injectable, NotFoundException } from '@nestjs/common';
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
    const reports: TaskStatusReport[] = [];

    const definedTasks = this.getRegisteredTasks();

    for (const task of definedTasks) {
      const name = task.name;
      const report = this.getTaskReport(name);
      reports.push(report);
    }

    return reports;
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

  getTaskReport(name: string): TaskStatusReport {
    const definedTasks = this.getRegisteredTasks();

    const hasTask = definedTasks.find((task) => task.name === name);
    if (!hasTask) {
      throw new NotFoundException(
        `Task "${name}" is not registered in SchedulerRegistry.`,
      );
    }

    let isRunning = false;
    let cronTime: string | null = null;
    let lastExecution: string | null = null;
    let nextExecution: string | null = null;
    let status: TaskRegistrationStatus = TaskRegistrationStatus.NOT_REGISTERED;

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
      status = TaskRegistrationStatus.NOT_REGISTERED;
    }

    return {
      name,
      isRunning,
      cronTime,
      lastExecution,
      nextExecution,
    };
  }
}
