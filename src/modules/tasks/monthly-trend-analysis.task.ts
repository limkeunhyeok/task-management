import { Logger } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { ScheduleTask } from 'src/common/decorators/schedule-task.decorator';
import { TrackTaskExecution } from 'src/common/decorators/track-task-execution.decorator';
import { AccountService } from '../analytics/services/account.service';
import { TransactionService } from '../analytics/services/transaction.service';
import { Task } from './task.interface';

export const MONTHLY_TREND_ANALYSIS_TASK = 'MONTHLY_TREND_ANALYSIS_TASK';

@ScheduleTask({
  cron: CronExpression.EVERY_DAY_AT_9AM,
})
export class MonthlyTrendAnalysisTask implements Task {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly accountService: AccountService,
    private readonly transactionService: TransactionService,
  ) {}

  @TrackTaskExecution()
  async execute(): Promise<void> {
    const [productTrends, accountPatterns] = await Promise.all([
      this.accountService.getMonthlyProductTrends(),
      this.transactionService.getAccountTransactionPatterns(),
    ]);

    // 상위 거래 계좌 정보 로깅
    const topAccounts = accountPatterns.slice(0, 3);
    topAccounts.forEach((account, index) => {
      this.logger.log(
        `Top account ${index + 1}: ID ${account._id} - ` +
          `${account.totalTransactions} transactions, ` +
          `${account.totalTransactionTypes} types, ` +
          `$${account.overallTotal.toFixed(2)} total`,
      );
    });

    // 제품별 최신 트렌드 (최근 3개월) 로깅
    const recentTrends = productTrends
      .filter((trend) => {
        const trendDate = new Date(trend._id.year, trend._id.month - 1);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return trendDate >= threeMonthsAgo;
      })
      .slice(0, 5);

    recentTrends.forEach((trend) => {
      this.logger.log(
        `${trend._id.product} (${trend._id.year}-${trend._id.month}): ` +
          `${trend.transactionCount} transactions, ` +
          `$${trend.totalAmount.toFixed(2)} total`,
      );
    });
  }
}
