import { Injectable, Logger } from '@nestjs/common';
import { CustomerService } from '../analytics/services/customer.service';
import { Task } from './task.interface';

@Injectable()
export class WeeklyCustomerAnalysisTask implements Task {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly customerService: CustomerService) {}

  async execute(): Promise<void> {
    this.logger.log('Starting weekly customer analysis...');

    try {
      const [customerAnalytics, segments] = await Promise.all([
        this.customerService.getCustomerAccountAnalytics(),
        this.customerService.getTopCustomerSegments(),
      ]);

      this.logger.log(
        `Weekly customer analysis completed. Analyzed ${customerAnalytics.length} customers`,
      );
      this.logger.log(`Generated ${segments.length} customer segments`);

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
    } catch (error) {
      this.logger.error('Failed to generate weekly customer analysis', error);
      throw error;
    }
  }
}
