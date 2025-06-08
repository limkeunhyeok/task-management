import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { SlackService } from '../slack/slack.service';
import { TaskManagementService } from './task-management.service';

@Controller('/tasks')
export class TaskManagementController {
  constructor(
    private readonly taskManagementService: TaskManagementService,
    private readonly slackService: SlackService,
  ) {}

  /**
   * 모든 스케줄된 태스크의 목록을 조회합니다.
   * GET /tasks
   */
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
    return this.taskManagementService.listAllScheduledTasks();
  }

  /**
   * 특정 ID의 태스크를 수동으로 즉시 실행합니다.
   * POST /tasks/:id/execute
   */
  @Post('/:id/execute')
  executeTask() {
    return this.taskManagementService.executeTask();
  }

  /**
   * 특정 ID의 태스크 스케줄링을 활성화(설정)합니다.
   * PUT /tasks/:id/schedule
   */
  @Put('/:id/schedule')
  scheduleTask() {
    return this.taskManagementService.scheduleTask();
  }

  /**
   * 특정 ID의 태스크 스케줄링을 비활성화(해제)합니다.
   * DELETE /tasks/:id/schedule
   */
  @Delete('/:id/schedule')
  unscheduleTask() {
    return this.taskManagementService.unscheduleTask();
  }

  /**
   * 특정 ID의 태스크 현재 상태를 조회합니다.
   * GET /tasks/:id/status
   */
  @Get('/:id/status')
  getTaskStatus() {
    return this.taskManagementService.getTaskStatus();
  }
}
