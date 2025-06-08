import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema()
export class IndividualTransaction {
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

export const IndividualTransactionSchema = SchemaFactory.createForClass(
  IndividualTransaction,
);

@Schema()
export class Transaction {
  @Prop({ required: true, index: true, alias: 'account_id' })
  accountId!: number;

  @Prop({ required: true, alias: 'transaction_count' })
  transactionCount!: number;

  @Prop({ type: Date, required: true, alias: 'bucket_start' })
  bucketStart!: Date;

  @Prop({ type: Date, required: true, alias: 'bucket_end' })
  bucketEnd!: Date;

  @Prop({ type: [IndividualTransactionSchema] })
  transactions?: IndividualTransaction[];
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
