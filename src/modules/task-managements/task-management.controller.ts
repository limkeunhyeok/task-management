import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { TaskManagementService } from './task-management.service';

@Controller('/tasks')
export class TaskManagementController {
  constructor(private readonly taskManagementService: TaskManagementService) {}

  @Get('/')
  async getAllTasks() {
    return this.taskManagementService.listAllScheduledTasks();
  }

  @Post('/:name/execute')
  executeTask(@Param('name') name: string) {
    return this.taskManagementService.executeTask(name);
  }

  @Put('/:name/schedule')
  scheduleTask(
    @Param('name') name: string,
    @Body('cron') cron?: CronExpression,
  ) {
    return this.taskManagementService.scheduleTask(name, cron);
  }

  @Delete('/:name/schedule')
  unscheduleTask(@Param('name') name: string) {
    return this.taskManagementService.unscheduleTask(name);
  }

  @Get('/:name/report')
  getTaskReport(@Param('name') name: string) {
    return this.taskManagementService.getTaskReport(name);
  }
}
