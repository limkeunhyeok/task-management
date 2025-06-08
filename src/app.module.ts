import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { HealthModule } from './common/health/health.module';
import { FaviconMiddleware } from './common/middlewares/favicon.middleware';
import { LoggingMiddleware } from './common/middlewares/logging.middleware';
import {
  MongodbConfigService,
  SAMPLE_ANALYTICS,
} from './configurations/mongoose.config';
import { ServerConfig, serverConfig } from './configurations/server.config';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SlackModule } from './modules/slack/slack.module';
import { TaskManagementModule } from './modules/task-managements/task-management.module';
import { TaskSchedulerModule } from './modules/task-schedulers/task-scheduler.module';

console.log(`.env.${process.env.NODE_ENV ?? 'dev'}`);
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [serverConfig],
      envFilePath: `.env.${process.env.NODE_ENV ?? 'dev'}`,
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService<ServerConfig>) =>
        new MongodbConfigService(
          config,
          SAMPLE_ANALYTICS,
        ).createMongooseOptions(),
      inject: [ConfigService],
      connectionName: SAMPLE_ANALYTICS,
    }),
    HealthModule,
    NestScheduleModule.forRoot(),
    TaskSchedulerModule.register(),
    TaskManagementModule,
    SlackModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ServerConfig>) => ({
        webhookUrl: configService.get<string>('slackWebhookUrl'),
      }),
    }),
    AnalyticsModule.register(),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(FaviconMiddleware)
      .forRoutes({ path: 'favicon.ico', method: RequestMethod.GET })
      .apply(LoggingMiddleware)
      .forRoutes('*');
  }
}
