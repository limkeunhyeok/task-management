import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Transaction, TRANSACTION_MODEL } from '../entities/transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    @Inject(TRANSACTION_MODEL)
    private readonly transactionModel: Model<Transaction>,
  ) {}
}
