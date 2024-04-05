import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Course } from './course.schema';

export type CourseActiveCodeDocument = CourseActiveCode & Document;

@Schema({
  collection: 'course_active_codes',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class CourseActiveCode {
  _id: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true })
  course: Course;

  @Prop({ type: 'string', required: true })
  code: string;

  createdAt: Date;

  updatedAt: Date;
}

export const CourseActiveCodeSchema =
  SchemaFactory.createForClass(CourseActiveCode);
