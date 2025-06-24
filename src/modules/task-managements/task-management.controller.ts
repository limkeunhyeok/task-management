import { Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { SlackService } from '../slack/slack.service';
import { TaskManagementService } from './task-management.service';

@Controller('/tasks')
export class TaskManagementController {
  constructor(
    private readonly taskManagementService: TaskManagementService,
    private readonly slackService: SlackService,
  ) {}

  @Get('/')
  async getAllTasks() {
    await this.slackService.send({
      type: 'schedulerResult',
      options: {
        headerTitle: 'ForRoot',
        taskDescription: 'global module test2',
        target: 'global',
      },
    });
    this.taskManagementService.getRegisteredTasks();
    return this.taskManagementService.listAllScheduledTasks();
  }

  @Post('/:name/execute')
  executeTask() {
    return this.taskManagementService.executeTask();
  }

  @Put('/:name/schedule')
  scheduleTask() {
    return this.taskManagementService.scheduleTask();
  }

  @Delete('/:name/schedule')
  unscheduleTask() {
    return this.taskManagementService.unscheduleTask();
  }

  @Get('/:name/report')
  getTaskReport(@Param('name') name: string) {
    return this.taskManagementService.getTaskReport(name);
  }
}
