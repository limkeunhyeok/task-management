import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { TaskModule } from '../tasks/task.module';
import { TaskManagementController } from './task-management.controller';
import { TaskManagementService } from './task-management.service';

@Module({
  imports: [TaskModule, DiscoveryModule],
  exports: [TaskManagementService],
  providers: [TaskManagementService],
  controllers: [TaskManagementController],
})
export class TaskManagementModule implements OnModuleInit {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly taskManagementService: TaskManagementService,
  ) {}

  onModuleInit() {
    this.logger.log(
      'TaskManagementModule initialized. Scanning and registering tasks...',
    );
    this.scanAndRegisterTasks();
    this.logger.log('Task scanning and registration complete.');
  }

  private scanAndRegisterTasks() {
    const tasks = this.taskManagementService.getRegisteredTasks();

    for (const task of tasks) {
      const { name, cronTime, taskFunction } = task;
      const job = new CronJob(cronTime, taskFunction);

      try {
        this.schedulerRegistry.addCronJob(name, job);
        job.start();
        this.logger.log(
          `ScheduleTask registered: "${name}" with cron: "${cronTime}"`,
        );
      } catch (e: any) {
        if (e.message && e.message.includes('A job with name')) {
          this.logger.warn(
            `ScheduleTask with name "${name}" already exists. Skipping registration.`,
          );
        } else {
          this.logger.error(
            `Failed to register ScheduleTask "${name}": ${e.message}`,
          );
        }
      }
    }
  }
}
