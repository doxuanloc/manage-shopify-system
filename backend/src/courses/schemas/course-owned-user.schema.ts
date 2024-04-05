import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../../accounts/users/schemas/user.schema';
import { Course } from './course.schema';

export type CourseOwnedUserDocument = CourseOwnedUser & Document;

@Schema({
  collection: 'course_owned_users',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class CourseOwnedUser {
  _id: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true })
  course: Course;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  owner: User;

  createdAt: Date;

  updatedAt: Date;
}

export const CourseOwnedUserSchema =
  SchemaFactory.createForClass(CourseOwnedUser);
