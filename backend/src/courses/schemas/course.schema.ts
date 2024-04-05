import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { CourseContent } from '../dto/create-course.dto';

export type CourseDocument = Course & Document;

@Schema({
  collection: 'courses',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class Course {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  thumbnail: string;

  // @Prop({ type: String, required: true })
  // level: string;

  @Prop({ type: [String] })
  highlights: string[];

  @Prop({ type: String, required: true })
  overview: string;

  @Prop({ type: String, required: true })
  introduce: string;

  // @Prop({ type: CourseContent, default: [] })
  // lessons: CourseContent[];

  @Prop({
    type: Number,
    required: true,
  })
  price: number;

  // @Prop({
  //   type: Number,
  //   required: true,
  //   default: 0,
  // })
  // numberOfStudents: number;

  // @Prop({
  //   type: Number,
  //   required: true,
  //   default: 0,
  // })
  // numberOfLessons: number;

  @Prop({ type: String })
  catalog: string;

  // @Prop({ type: 'boolean' })
  // isEndSell: boolean;

  // @Prop({ type: String, required: true })
  // document: string;

  createdAt: Date;

  updatedAt: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

CourseSchema.index({ title: 'text' });
