import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServerConfig } from 'src/configurations/server.config';
import { TeamsModule } from '../teams/teams.module';
import { TaskSchedulerService } from './task-scheduler.service';
import { ValidateDataTask } from './tasks/validate-data.task';

@Module({})
export class TaskSchedulerModule {
  static register(): DynamicModule {
    return {
      module: TaskSchedulerModule,
      imports: [
        TeamsModule.registerAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService<ServerConfig>) => ({
            webhookUrl: configService.get<string>('teamsWebhookUrl'),
          }),
        }),
      ],
      providers: [TaskSchedulerService, ValidateDataTask],
      exports: [TaskSchedulerService],
    };
  }
}
