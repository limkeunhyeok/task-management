import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const CUSTOMER_MODEL = 'CUSTOMER_MODEL';
export type CustomerDocument = Customer & Document;

@Schema()
export class CustomerTierAndDetails {
  @Prop({ type: String, required: true })
  tier!: string;

  @Prop({ type: Boolean, default: true })
  active?: boolean;

  @Prop([String])
  benefits?: string[];
}

export const CustomerTierAndDetailsSchema = SchemaFactory.createForClass(
  CustomerTierAndDetails,
);

@Schema()
export class Customer {
  @Prop({ required: true, unique: true, index: true })
  username!: string;

  @Prop({ required: true })
  name!: string;

  @Prop()
  address?: string;

  @Prop({ type: Date })
  birthdate?: Date;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop([Number])
  accounts?: number[];

  @Prop({ type: CustomerTierAndDetailsSchema, alias: 'tier_and_details' })
  tierAndDetails?: CustomerTierAndDetails;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
