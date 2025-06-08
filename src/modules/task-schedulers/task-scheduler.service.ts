import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { ValidateDataTask } from './tasks/validate-data.task';

@Injectable()
export class TaskSchedulerService implements OnModuleInit {
  private logger: Logger;

  constructor(
    private readonly validateDataTask: ValidateDataTask,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  onModuleInit() {
    const tasks = [
      {
        name: `validate`,
        cron: CronExpression.EVERY_10_SECONDS,
        runner: this.runTest.bind(this),
      },
    ];

    tasks.forEach((task) => {
      const job = new CronJob(task.cron, task.runner);

      this.schedulerRegistry.addCronJob(task.name, job);

      job.start();
    });
  }

  runTest() {
    console.log(`TEST CRON!!!!!`);
  }
}
