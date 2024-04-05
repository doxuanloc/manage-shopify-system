import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { EFileCloudType } from '../constants';

export type FileDocument = File & Document;

@Schema({
  collection: 'files',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class File {
  _id: mongoose.Types.ObjectId;

  @Prop()
  fileId: string;

  @Prop()
  name: string;

  @Prop({
    enum: EFileCloudType,
    type: String,
    default: EFileCloudType.GOOGLE_DRIVE,
  })
  cloudType: EFileCloudType;

  @Prop({ type: 'object' })
  data: Record<string, any>;

  createdAt: Date;

  updatedAt: Date;
}

export const FileSchema = SchemaFactory.createForClass(File);
