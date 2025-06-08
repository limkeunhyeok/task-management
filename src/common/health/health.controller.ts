import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorFunction,
  HttpHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly db: MongooseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const healthIndicators: HealthIndicatorFunction[] = [
      () => this.http.pingCheck('http', 'https://docs.nestjs.com'),
      () => this.db.pingCheck('mongodb'),
    ];

    return this.health.check(healthIndicators);
  }
}
