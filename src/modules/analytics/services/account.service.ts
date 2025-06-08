import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Account, ACCOUNT_MODEL } from '../entities/account.entity';

@Injectable()
export class AccountService {
  constructor(
    @Inject(ACCOUNT_MODEL)
    private readonly accountModel: Model<Account>,
  ) {}
}
