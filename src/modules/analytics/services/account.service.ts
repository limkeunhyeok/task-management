import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Account, ACCOUNT_MODEL } from '../entities/account.entity';

@Injectable()
export class AccountService {
  constructor(
    @Inject(ACCOUNT_MODEL)
    private readonly accountModel: Model<Account>,
  ) {}

  // 월별 제품별 거래 트렌드
  async getMonthlyProductTrends() {
    return await this.accountModel.aggregate([
      {
        $unwind: '$products',
      },
      {
        $lookup: {
          from: 'transactions',
          localField: 'account_id',
          foreignField: 'account_id',
          as: 'transactions',
        },
      },
      {
        $unwind: '$transactions',
      },
      {
        $unwind: '$transactions.transactions',
      },
      {
        $group: {
          _id: {
            product: '$products',
            year: { $year: '$transactions.transactions.date' },
            month: { $month: '$transactions.transactions.date' },
          },
          transactionCount: { $sum: 1 },
          totalAmount: { $sum: '$transactions.transactions.amount' },
          uniqueAccounts: { $addToSet: '$account_id' },
        },
      },
      {
        $addFields: {
          uniqueAccountCount: { $size: '$uniqueAccounts' },
        },
      },
      {
        $sort: {
          '_id.product': 1,
          '_id.year': -1,
          '_id.month': -1,
        },
      },
    ]);
  }
}
