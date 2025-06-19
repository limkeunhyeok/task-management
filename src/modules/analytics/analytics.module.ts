import { DynamicModule, Module } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { SAMPLE_ANALYTICS } from 'src/configurations/mongoose.config';
import {
  Account,
  ACCOUNT_MODEL,
  AccountSchema,
} from './entities/account.entity';
import {
  Customer,
  CUSTOMER_MODEL,
  CustomerSchema,
} from './entities/customer.entity';
import {
  Transaction,
  TRANSACTION_MODEL,
  TransactionSchema,
} from './entities/transaction.entity';
import { AccountService } from './services/account.service';
import { CustomerService } from './services/customer.service';
import { TransactionService } from './services/transaction.service';

@Module({})
export class AnalyticsModule {
  static register(): DynamicModule {
    return {
      module: AnalyticsModule,
      imports: [
        MongooseModule.forFeature(
          [
            {
              name: Account.name,
              schema: AccountSchema,
              collection: 'accounts',
            },
            {
              name: Customer.name,
              schema: CustomerSchema,
              collection: 'customers',
            },
            {
              name: Transaction.name,
              schema: TransactionSchema,
              collection: 'transactions',
            },
          ],
          SAMPLE_ANALYTICS,
        ),
      ],
      controllers: [],
      providers: [
        {
          provide: ACCOUNT_MODEL,
          useFactory: (connection: Connection) =>
            connection.model(Account.name),
          inject: [getConnectionToken(SAMPLE_ANALYTICS)],
        },
        {
          provide: CUSTOMER_MODEL,
          useFactory: (connection: Connection) =>
            connection.model(Customer.name),
          inject: [getConnectionToken(SAMPLE_ANALYTICS)],
        },
        {
          provide: TRANSACTION_MODEL,
          useFactory: (connection: Connection) =>
            connection.model(Transaction.name),
          inject: [getConnectionToken(SAMPLE_ANALYTICS)],
        },
        AccountService,
        CustomerService,
        TransactionService,
      ],
      exports: [
        ACCOUNT_MODEL,
        CUSTOMER_MODEL,
        TRANSACTION_MODEL,
        AccountService,
        CustomerService,
        TransactionService,
      ],
    };
  }
}
