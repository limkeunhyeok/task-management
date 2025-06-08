import { DynamicModule, Module } from '@nestjs/common';
import { TaskSchedulerService } from './task-scheduler.service';
import { ValidateDataTask } from './tasks/validate-data.task';

@Module({})
export class TaskSchedulerModule {
  static register(): DynamicModule {
    return {
      module: TaskSchedulerModule,
      imports: [],
      providers: [TaskSchedulerService, ValidateDataTask],
      exports: [TaskSchedulerService],
    };
  }
}
