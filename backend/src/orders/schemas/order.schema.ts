import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Course } from '../../courses/schemas/course.schema';
import { User } from '../../accounts/users/schemas/user.schema';
import { EOrderStatus, EPaymentType } from '../constants';
import { OrderCustomerInfo } from '../dto/create-order.dto';

export class OrderItem {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Course' })
  course: Course;
}

export type OrderDocument = Order & Document;

@Schema({
  collection: 'orders',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class Order {
  _id: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  customer: User;

  @Prop({ type: OrderCustomerInfo })
  customerInfo: OrderCustomerInfo;

  @Prop({ type: OrderItem })
  items: OrderItem[];

  @Prop({
    type: String,
    enum: EPaymentType,
    required: true,
    default: EPaymentType.BANKING,
  })
  paymentType: EPaymentType;

  @Prop({
    type: String,
    enum: EOrderStatus,
    required: true,
    default: EOrderStatus.PENDING,
  })
  status: EOrderStatus;

  @Prop({ type: 'number', required: true })
  totalPrice: number;

  createdAt: Date;

  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
