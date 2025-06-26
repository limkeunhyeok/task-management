import { Logger } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { ScheduleTask } from 'src/common/decorators/schedule-task.decorator';
import { TrackTaskExecution } from 'src/common/decorators/track-task-execution.decorator';
import { TransactionService } from '../analytics/services/transaction.service';
import { Task } from './task.interface';

export const DAILY_TRANSACTION_REPORT_TASK = 'DAILY_TRANSACTION_REPORT_TASK';

@ScheduleTask({
  cron: CronExpression.EVERY_MINUTE,
})
export class DailyTransactionReportTask implements Task {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly transactionService: TransactionService) {}

  @TrackTaskExecution()
  async execute(): Promise<void> {
    const stats = await this.transactionService.getDailyTransactionStats();

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
  }
}
