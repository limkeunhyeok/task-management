import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const ACCOUNT_MODEL = 'ACCOUNT_MODEL';
export type AccountDocument = Account & Document;

@Schema()
export class AccountTransactionSummary {
  @Prop({ type: Date, required: true })
  date!: Date;

  @Prop({ required: true })
  amount!: number;

  @Prop({ alias: 'transaction_code' })
  transactionCode?: string;

  @Prop()
  symbol?: string;

  @Prop()
  price?: number;

  @Prop()
  total?: number;

  @Prop()
  description?: string;

  @Prop()
  type?: string;
}

export const AccountTransactionSummarySchema = SchemaFactory.createForClass(
  AccountTransactionSummary,
);

@Schema()
export class Account {
  @Prop({ required: true, unique: true, index: true, alias: 'account_id' })
  accountId!: number;

  @Prop({ required: true })
  limit!: number;

  @Prop([String])
  products?: string[];

  @Prop({ type: [AccountTransactionSummarySchema] })
  transactions?: AccountTransactionSummary[];
}

export const AccountSchema = SchemaFactory.createForClass(Account);
