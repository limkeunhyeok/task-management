import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Customer, CUSTOMER_MODEL } from '../entities/customer.entity';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(CUSTOMER_MODEL)
    private readonly customerModel: Model<Customer>,
  ) {}

  // 고객별 계좌 보유 현황 및 거래 통계
  async getCustomerAccountAnalytics() {
    return await this.customerModel.aggregate([
      {
        $lookup: {
          from: 'accounts',
          localField: 'accounts',
          foreignField: 'account_id',
          as: 'accountDetails',
        },
      },
      {
        $lookup: {
          from: 'transactions',
          localField: 'accounts',
          foreignField: 'account_id',
          as: 'transactionDetails',
        },
      },
      {
        $addFields: {
          totalAccounts: { $size: '$accounts' },
          totalTransactionBuckets: { $size: '$transactionDetails' },
          totalLimit: { $sum: '$accountDetails.limit' },
          allProducts: {
            $reduce: {
              input: '$accountDetails.products',
              initialValue: [],
              in: { $setUnion: ['$$value', '$$this'] },
            },
          },
        },
      },
      {
        $project: {
          username: 1,
          name: 1,
          email: 1,
          totalAccounts: 1,
          totalTransactionBuckets: 1,
          totalLimit: 1,
          uniqueProducts: { $size: '$allProducts' },
          tier: '$tier_and_details',
        },
      },
      {
        $sort: { totalLimit: -1 },
      },
      {
        $limit: 50,
      },
    ]);
  }

  // 상위 고객 세그먼트 분석
  async getTopCustomerSegments() {
    const result = await this.customerModel.aggregate([
      {
        $lookup: {
          from: 'accounts',
          localField: 'accounts',
          foreignField: 'account_id',
          as: 'accountDetails',
        },
      },
      {
        $lookup: {
          from: 'transactions',
          localField: 'accounts',
          foreignField: 'account_id',
          as: 'transactionDetails',
        },
      },
      {
        $addFields: {
          totalLimit: { $sum: '$accountDetails.limit' },
          totalTransactionBuckets: { $size: '$transactionDetails' },
          age: {
            $divide: [
              { $subtract: [new Date(), '$birthdate'] },
              365.25 * 24 * 60 * 60 * 1000,
            ],
          },
        },
      },
      {
        $addFields: {
          ageGroup: {
            $switch: {
              branches: [
                { case: { $lt: ['$age', 30] }, then: '20s' },
                { case: { $lt: ['$age', 40] }, then: '30s' },
                { case: { $lt: ['$age', 50] }, then: '40s' },
                { case: { $lt: ['$age', 60] }, then: '50s' },
              ],
              default: '60+',
            },
          },
          limitTier: {
            $switch: {
              branches: [
                { case: { $lt: ['$totalLimit', 1000] }, then: 'Bronze' },
                { case: { $lt: ['$totalLimit', 5000] }, then: 'Silver' },
                { case: { $lt: ['$totalLimit', 10000] }, then: 'Gold' },
              ],
              default: 'Platinum',
            },
          },
        },
      },
      {
        $group: {
          _id: {
            ageGroup: '$ageGroup',
            limitTier: '$limitTier',
          },
          customerCount: { $sum: 1 },
          avgLimit: { $avg: '$totalLimit' },
          avgTransactionBuckets: { $avg: '$totalTransactionBuckets' },
          totalLimit: { $sum: '$totalLimit' },
        },
      },
      {
        $sort: { totalLimit: -1 },
      },
    ]);
    return result;
  }
}
