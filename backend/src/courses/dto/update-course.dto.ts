import { PartialType } from '@nestjs/mapped-types';
import { Course } from '../schemas/course.schema';

export class UpdateCourseDto extends PartialType(Course) {}
