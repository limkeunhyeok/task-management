import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronCallback } from 'cron';
import {
  SCHEDULE_TASK_METADATA,
  ScheduleTaskOptions,
} from 'src/common/decorators/schedule-task.decorator';
import { Task } from '../tasks/task.interface';

@Injectable()
export class TaskManagementService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private readonly discoveryService: DiscoveryService,
  ) {}

  getRegisteredTasks(): Array<{
    name: string;
    cronTime: string;
    taskFunction: CronCallback<null>;
  }> {
    const tasks: Array<{
      name: string;
      cronTime: string;
      taskFunction: CronCallback<null>;
    }> = [];

    // DiscoveryService를 사용하여 NestJS DI 컨테이너에 등록된 모든 프로바이더를 가져옵니다.
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

  listAllScheduledTasks() {
    const jobs = this.schedulerRegistry.getCronJobs();

    // console.log(jobs);
    jobs.forEach((value, key) => {
      let next;
      try {
        next = value.nextDate().toJSDate();
      } catch (e) {
        next = 'error: next fire date is in the past!';
      }
      // console.log(`job: ${key} -> next: ${next}`);
      // console.log(value);
    });

    const cronJobs = this.schedulerRegistry.getCronJobs();
    const intervals = this.schedulerRegistry.getIntervals();
    const timeouts = this.schedulerRegistry.getTimeouts();

    return {
      cronJobs,
      intervals,
      timeouts,
    };
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
