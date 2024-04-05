import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, {
  FilterQuery,
  Model,
  ProjectionType,
  QueryOptions,
} from 'mongoose';
import { CoursesService } from './courses.service';
import {
  CourseActiveCode,
  CourseActiveCodeDocument,
} from './schemas/course-active-code.schema';

@Injectable()
export class CourseActiveCodesService {
  private readonly logger = new Logger(CourseActiveCodesService.name);
  constructor(
    @InjectModel(CourseActiveCode.name)
    private courseActiveCodeModel: Model<CourseActiveCodeDocument>,
    @Inject(forwardRef(() => CoursesService))
    private readonly coursesService: CoursesService,
  ) {}
  async create(
    courseId: string | mongoose.Types.ObjectId,
  ): Promise<CourseActiveCode> {
    const course = await this.coursesService.findOne({
      _id: new mongoose.Types.ObjectId(courseId),
    });

    if (!course) {
      throw new BadRequestException({
        isSuccess: false,
        message: 'Không tìm thấy khóa học',
        data: null,
      });
    }

    const genRanHex = (size) =>
      [...Array(size)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('');
    const codeString = genRanHex(32);
    return (
      await this.courseActiveCodeModel.create({
        course: course._id,
        code: codeString,
      })
    ).toObject();
  }

  async findOne(
    filter?: FilterQuery<CourseActiveCode>,
    projection?: ProjectionType<CourseActiveCode> | null,
    options?: QueryOptions<CourseActiveCode> | null,
  ): Promise<CourseActiveCode> {
    return await this.courseActiveCodeModel
      .findOne(filter, projection, options)
      .lean()
      .exec();
  }

  async remove(
    id: string | mongoose.Types.ObjectId,
  ): Promise<CourseActiveCode> {
    return await this.courseActiveCodeModel.findByIdAndRemove(id).lean().exec();
  }
}
