import { Injectable, Logger } from '@nestjs/common';
import { AccountService } from '../analytics/services/account.service';
import { TransactionService } from '../analytics/services/transaction.service';
import { Task } from './task.interface';

@Injectable()
export class MonthlyTrendAnalysisTask implements Task {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly accountService: AccountService,
    private readonly transactionService: TransactionService,
  ) {}

  async execute(): Promise<void> {
    this.logger.log('Starting monthly trend analysis...');

    try {
      const [productTrends, accountPatterns] = await Promise.all([
        this.accountService.getMonthlyProductTrends(),
        this.transactionService.getAccountTransactionPatterns(),
      ]);

      this.logger.log(
        `Monthly trend analysis completed. Generated ${productTrends.length} product trend records`,
      );
      this.logger.log(
        `Analyzed transaction patterns for ${accountPatterns.length} accounts`,
      );

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
    } catch (error) {
      this.logger.error('Failed to generate monthly trend analysis', error);
      throw error;
    }
  }
}
