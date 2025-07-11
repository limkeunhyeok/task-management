import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import mongoose from 'mongoose';
import { AppModule } from './app.module';
import { ApiDocsModule } from './common/api-docs/api-docs.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { getWinstonLogger, LogLevel } from './common/logger/logger';
import { ServerConfig } from './configurations/server.config';

async function bootstrap() {
  const logger = getWinstonLogger();

  const app = await NestFactory.create(AppModule, { logger });

  app.useGlobalFilters(new AllExceptionsFilter());

  const configService = app.get<ConfigService<ServerConfig>>(ConfigService);

  const port = configService.getOrThrow<number>('port');
  const nodeEnv = configService.getOrThrow<string>('nodeEnv');

  if (nodeEnv !== 'prod') {
    ApiDocsModule.register(app);
    mongoose.set('debug', true);
  }

  await app.listen(port, () => {
    logger.log({
      context: 'NestApplication',
      level: LogLevel.INFO,
      message: `${nodeEnv} task scheduler listening to port ${port}.`,
    });
  });
}
bootstrap();
