import { Module } from '@nestjs/common';
import { TaskManagementController } from './task-management.controller';
import { TaskManagementService } from './task-management.service';

@Module({
  imports: [],
  exports: [TaskManagementService],
  providers: [TaskManagementService],
  controllers: [TaskManagementController],
})
export class TaskManagementModule {}
