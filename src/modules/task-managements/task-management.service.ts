import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class TaskManagementService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  listAllScheduledTasks() {
    const jobs = this.schedulerRegistry.getCronJobs();
    jobs.forEach((value, key) => {
      let next;
      try {
        next = value.nextDate().toJSDate();
      } catch (e) {
        next = 'error: next fire date is in the past!';
      }
      console.log(`job: ${key} -> next: ${next}`);
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
