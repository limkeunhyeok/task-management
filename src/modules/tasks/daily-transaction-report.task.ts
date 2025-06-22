import { Logger } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { ScheduleTask } from 'src/common/decorators/schedule-task.decorator';
import { TransactionService } from '../analytics/services/transaction.service';
import { Task } from './task.interface';

export const DAILY_TRANSACTION_REPORT_TASK = 'DAILY_TRANSACTION_REPORT_TASK';

@ScheduleTask({
  cron: CronExpression.EVERY_MINUTE,
})
export class DailyTransactionReportTask implements Task {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly transactionService: TransactionService) {}

  async execute(): Promise<void> {
    this.logger.log('Starting daily transaction report generation...');

    try {
      const stats = await this.transactionService.getDailyTransactionStats();

      this.logger.log(
        `Daily transaction report completed. Found ${stats.length} daily records`,
      );

      // 최근 3일 데이터 로깅
      const recentData = stats.slice(0, 3);
      recentData.forEach((day) => {
        this.logger.log(
          `${day._id.year}-${day._id.month}-${day._id.day}: ` +
            `${day.totalTransactions} transactions, ` +
            `$${day.totalAmount.toFixed(2)} total, ` +
            `${day.uniqueAccountCount} unique accounts`,
        );
      });

      // 실제 환경에서는 결과를 데이터베이스에 저장하거나 외부 시스템으로 전송
      // await this.saveReportToDatabase(stats);
      // await this.sendReportToSlack(recentData);
    } catch (error) {
      this.logger.error('Failed to generate daily transaction report', error);
      throw error;
    }
  }
}
