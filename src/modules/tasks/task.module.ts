import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module';
import { DailyTransactionReportTask } from './daily-transaction-report.task';
import { MonthlyTrendAnalysisTask } from './monthly-trend-analysis.task';
import { WeeklyCustomerAnalysisTask } from './weekly-customer-analysis.task';

@Module({
  imports: [AnalyticsModule.register()],
  providers: [
    DailyTransactionReportTask,
    MonthlyTrendAnalysisTask,
    WeeklyCustomerAnalysisTask,
  ],
  exports: [
    DailyTransactionReportTask,
    MonthlyTrendAnalysisTask,
    WeeklyCustomerAnalysisTask,
  ],
})
export class TaskModule {}
