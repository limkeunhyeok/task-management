import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
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
            runner: (instance as Task).execute.bind(instance),
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

  executeTask(name: string) {
    const definedTasks = this.getRegisteredTasks();

    const task = definedTasks.find((task) => task.name === name);
    if (!task) {
      throw new NotFoundException(
        `Task "${name}" is not registered in SchedulerRegistry.`,
      );
    }

    const startedAt = new Date();

    Promise.resolve()
      .then(() => task.runner())
      .catch((error) => {
        this.logger.error(`Error while executing task "${name}":`, error);
      });

    return {
      message: `Task "${name}" execution started.`,
      startedAt: startedAt.toISOString(),
    };
  }

  scheduleTask(name: string, cron?: CronExpression) {
    const definedTasks = this.getRegisteredTasks();

    const task = definedTasks.find((task) => task.name === name);
    if (!task) {
      throw new NotFoundException(
        `Task "${name}" is not registered in SchedulerRegistry.`,
      );
    }

    const isRunning = (() => {
      try {
        this.schedulerRegistry.getCronJob(name);
        return true;
      } catch {
        return false;
      }
    })();

    if (isRunning) {
      throw new ConflictException(
        `Task "${name}" is already scheduled and running.`,
      );
    }

    const cronTime = cron ?? task.cronTime;

    const job = new CronJob(cronTime, task.runner);
    this.schedulerRegistry.addCronJob(name, job);
    job.start();

    return {
      message: `Task "${name}" registered and scheduled.`,
      nextRun: job.nextDate().toString(),
      cronTime,
    };
  }

  unscheduleTask(name: string) {
    const definedTasks = this.getRegisteredTasks();

    const hasTask = definedTasks.find((task) => task.name === name);
    if (!hasTask) {
      throw new NotFoundException(
        `Task "${name}" is not registered in SchedulerRegistry.`,
      );
    }

    let job: CronJob;

    try {
      job = this.schedulerRegistry.getCronJob(name);
    } catch {
      throw new ConflictException(`Task "${name}" is not currently scheduled.`);
    }

    job.stop();
    this.schedulerRegistry.deleteCronJob(name);

    return {
      message: `Task "${name}" has been unscheduled and stopped.`,
    };
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

      job.fireOnTick;

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
