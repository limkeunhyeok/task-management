import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Transaction, TRANSACTION_MODEL } from '../entities/transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    @Inject(TRANSACTION_MODEL)
    private readonly transactionModel: Model<Transaction>,
  ) {}

  // 일별 거래량 집계
  async getDailyTransactionStats() {
    return await this.transactionModel.aggregate([
      {
        $unwind: '$transactions',
      },
      {
        $group: {
          _id: {
            year: { $year: '$transactions.date' },
            month: { $month: '$transactions.date' },
            day: { $dayOfMonth: '$transactions.date' },
          },
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: '$transactions.amount' },
          avgAmount: { $avg: '$transactions.amount' },
          uniqueAccounts: { $addToSet: '$account_id' },
        },
      },
      {
        $addFields: {
          uniqueAccountCount: { $size: '$uniqueAccounts' },
        },
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 },
      },
      {
        $limit: 30,
      },
    ]);
  }

  // 계좌별 거래 패턴 분석
  async getAccountTransactionPatterns() {
    const result = await this.transactionModel.aggregate([
      {
        $unwind: '$transactions',
      },
      {
        $group: {
          _id: {
            account_id: '$account_id',
            transaction_code: '$transactions.transaction_code',
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$transactions.amount' },
          avgAmount: { $avg: '$transactions.amount' },
          minAmount: { $min: '$transactions.amount' },
          maxAmount: { $max: '$transactions.amount' },
        },
      },
      {
        $group: {
          _id: '$_id.account_id',
          transactionTypes: {
            $push: {
              code: '$_id.transaction_code',
              count: '$count',
              totalAmount: '$totalAmount',
              avgAmount: '$avgAmount',
              minAmount: '$minAmount',
              maxAmount: '$maxAmount',
            },
          },
          totalTransactionTypes: { $sum: 1 },
          totalTransactions: { $sum: '$count' },
          overallTotal: { $sum: '$totalAmount' },
        },
      },
      {
        $lookup: {
          from: 'accounts',
          localField: '_id',
          foreignField: 'account_id',
          as: 'accountInfo',
        },
      },
      {
        $unwind: '$accountInfo',
      },
      {
        $sort: { totalTransactions: -1 },
      },
      {
        $limit: 20,
      },
    ]);

    return result;
  }
}
