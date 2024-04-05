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
import { UsersService } from '../accounts/users/users.service';
import { CoursesService } from './courses.service';
import {
  CourseOwnedUser,
  CourseOwnedUserDocument,
} from './schemas/course-owned-user.schema';

@Injectable()
export class CourseOwnedUsersService {
  private readonly logger = new Logger(CourseOwnedUsersService.name);
  constructor(
    @InjectModel(CourseOwnedUser.name)
    private courseOwnedUserModel: Model<CourseOwnedUserDocument>,
    @Inject(forwardRef(() => CoursesService))
    private readonly coursesService: CoursesService,
    @Inject(UsersService)
    private readonly usersService: UsersService,
  ) {}
  async create(
    courseId: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId,
  ): Promise<CourseOwnedUser> {
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

    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new BadRequestException({
        isSuccess: false,
        message: 'Không tìm thấy tài khoản',
        data: null,
      });
    }
    return (
      await this.courseOwnedUserModel.create({
        course: course._id,
        owner: user._id,
      })
    ).toObject();
  }

  async findAll(
    filter?: FilterQuery<CourseOwnedUser>,
    projection?: ProjectionType<CourseOwnedUser> | null | undefined,
    options?: QueryOptions<CourseOwnedUser> | null | undefined,
  ): Promise<CourseOwnedUser[]> {
    return await this.courseOwnedUserModel
      .find(filter, projection, options)
      .lean()
      .exec();
  }

  async findOne(
    filter?: FilterQuery<CourseOwnedUser>,
  ): Promise<CourseOwnedUser> {
    return await this.courseOwnedUserModel.findOne(filter).lean().exec();
  }

  async remove(id: string): Promise<CourseOwnedUser> {
    return await this.courseOwnedUserModel.findByIdAndRemove(id).lean().exec();
  }
}
