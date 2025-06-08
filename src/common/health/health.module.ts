import { HttpModule } from '@nestjs/axios';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule,
    TerminusModule.forRoot({ logger: Logger }),
    HttpModule,
  ],
  controllers: [HealthController],
})
export class HealthModule {}
