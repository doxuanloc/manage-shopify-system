import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { ECodeType } from '../constants';

export type CodeDocument = Code & Document;

@Schema({
  collection: 'codes',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class Code {
  _id: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop()
  code: string;

  @Prop({ enum: ECodeType, type: String })
  type: ECodeType;

  @Prop({ type: 'date' })
  expireAt: Date;

  createdAt: Date;

  updatedAt: Date;
}

export const CodeSchema = SchemaFactory.createForClass(Code);
