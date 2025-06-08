import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Customer, CUSTOMER_MODEL } from '../entities/customer.entity';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(CUSTOMER_MODEL)
    private readonly customerModel: Model<Customer>,
  ) {}

  async findAll() {
    return await this.customerModel.find();
  }
}
