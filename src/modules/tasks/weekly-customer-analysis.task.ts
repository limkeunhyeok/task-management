import { Logger } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { ScheduleTask } from 'src/common/decorators/schedule-task.decorator';
import { TrackTaskExecution } from 'src/common/decorators/track-task-execution.decorator';
import { CustomerService } from '../analytics/services/customer.service';
import { Task } from './task.interface';

export const WEEKLY_CUSTOMER_ANALYSIS_TASK = 'WEEKLY_CUSTOMER_ANALYSIS_TASK';

@ScheduleTask({
  cron: CronExpression.EVERY_DAY_AT_9AM,
})
export class WeeklyCustomerAnalysisTask implements Task {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly customerService: CustomerService) {}

  @TrackTaskExecution()
  async execute(): Promise<void> {
    const [customerAnalytics, segments] = await Promise.all([
      this.customerService.getCustomerAccountAnalytics(),
      this.customerService.getTopCustomerSegments(),
    ]);

    // 상위 5명 고객 정보 로깅
    const topCustomers = customerAnalytics.slice(0, 5);
    topCustomers.forEach((customer, index) => {
      this.logger.log(
        `Top ${index + 1}: ${customer.name} - ` +
          `$${customer.totalLimit} limit, ` +
          `${customer.totalAccounts} accounts, ` +
          `${customer.uniqueProducts} products`,
      );
    });

    // 상위 3개 고객 세그먼트 로깅
    const topSegments = segments.slice(0, 3);
    topSegments.forEach((segment, index) => {
      this.logger.log(
        `Segment ${index + 1}: ${segment._id.ageGroup} ${segment._id.limitTier} - ` +
          `${segment.customerCount} customers, ` +
          `$${segment.totalLimit.toFixed(2)} total limit`,
      );
    });
  }
}
