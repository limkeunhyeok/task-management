import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { DiscoveryModule, DiscoveryService } from '@nestjs/core';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import {
  SCHEDULE_TASK_METADATA,
  ScheduleTaskOptions,
} from 'src/common/decorators/schedule-task.decorator';
import { Task } from '../tasks/task.interface';
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
    private readonly discoveryService: DiscoveryService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    this.logger.log(
      'TaskManagementModule initialized. Scanning and registering tasks...',
    );
    this.scanAndRegisterTasks();
    this.logger.log('Task scanning and registration complete.');
  }

  private scanAndRegisterTasks() {
    const providers = this.discoveryService.getProviders();
    this.logger.debug(`Found ${providers.length} providers to scan.`);

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
          this.logger.debug(`Found @ScheduleTask on class: ${className}`);

          if (typeof (instance as Task).execute !== 'function') {
            this.logger.error(
              `Class "${className}" decorated with @ScheduleTask must implement an 'execute(): Promise<void>' method.`,
            );
            continue;
          }

          const taskName = taskOptions.name || `${className}_execute`;
          const cron = taskOptions.cron;

          const taskFunction = (instance as Task).execute.bind(instance);
          const job = new CronJob(cron, taskFunction);

          try {
            this.schedulerRegistry.addCronJob(taskName, job);
            job.start();
            this.logger.log(
              `ScheduleTask registered: "${taskName}" with cron: "${cron}"`,
            );
          } catch (e: any) {
            if (e.message && e.message.includes('A job with name')) {
              this.logger.warn(
                `ScheduleTask with name "${taskName}" already exists. Skipping registration.`,
              );
            } else {
              this.logger.error(
                `Failed to register ScheduleTask "${taskName}": ${e.message}`,
              );
            }
          }
        }
      }
    }
  }
}
