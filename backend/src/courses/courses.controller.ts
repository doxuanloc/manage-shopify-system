import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  IPaginationResponse,
  IResponse,
} from '../common/interfaces/response.interface';

import * as _ from 'lodash';
import mongoose from 'mongoose';
import { OrdersService } from '../orders/orders.service';
import { Roles } from '../accounts/auth/decorators/roles.decorator';
import { User } from '../accounts/auth/decorators/user.decorator';
import { AuthUserDto } from '../accounts/auth/dto/auth-user.dto';
import { JwtAccessTokenAuthGuard } from '../accounts/auth/guards/jwt-access-token-auth.guard';
import { OptionalJwtAccessTokenAuthGuard } from '../accounts/auth/guards/optional-jwt-access-token-auth.guard';
import { RolesGuard } from '../accounts/auth/guards/roles.guard';
import { ERole } from '../accounts/users/constants';
import { ParseIntPipe } from '../common/pipes/parseInt.pipe';
import { ECourseLevel } from './constants';
import { CourseOwnedUsersService } from './course-owned-user.service';
import { CoursesService } from './courses.service';
import { ActiveCourseDto } from './dto/active-course';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './schemas/course.schema';
import { EOrderStatus } from '../orders/constants';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    @Inject(forwardRef(() => CourseOwnedUsersService))
    private readonly courseOwnedUsersService: CourseOwnedUsersService,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
  ) {}

  @UseGuards(RolesGuard)
  @UseGuards(new JwtAccessTokenAuthGuard())
  @Roles(ERole.ADMIN)
  @Post()
  async create(
    @Body() createCourseDto: CreateCourseDto,
  ): Promise<IResponse<Course>> {
    return {
      isSuccess: true,
      message: 'Tạo khóa học thành công',
      data: await this.coursesService.create(createCourseDto),
    };
  }

  @UseGuards(new JwtAccessTokenAuthGuard())
  @Get('my-courses')
  async myCourses(
    @User() user: AuthUserDto,
    @Query('title') title?: string,
    @Query('level') level?: string,
    @Query('sortField') sortField = 'createdAt',
    @Query('sortType') sortType = 'asc',
    @Query('page', ParseIntPipe) page = 0,
    @Query('pageSize', ParseIntPipe) pageSize = 10,
  ): Promise<IPaginationResponse<Course>> {
    const courseOwnedUsers = await this.courseOwnedUsersService.findAll({
      owner: new mongoose.Types.ObjectId(user._id),
    });
    const filter = {
      $and: [{ _id: { $in: courseOwnedUsers.map((data) => data.course) } }],
    } as any;

    if (title) {
      filter['$and'].push({ $text: { $search: title } });
    }
    if (level && level.toLowerCase() !== 'all') {
      filter['$and'].push({ level });
    }

    return {
      isSuccess: true,
      message: 'Lấy danh sách khóa học thành công',
      data: await this.coursesService.findAll(
        filter,
        '_id title thumbnail price numberOfStudents numberOfLessons createdAt updatedAt',
        {
          skip: page * pageSize,
          limit: pageSize,
          sort: {
            [sortField]: sortType,
          },
        },
      ),

      pagination: {
        page,
        pageSize,
        pageCount: 1,
        totalPage: Math.floor(
          (await this.coursesService.count(filter)) / pageSize + 1,
        ),
      },
    };
  }

  @UseGuards(new OptionalJwtAccessTokenAuthGuard())
  @Get()
  async findAll(
    @User() user: AuthUserDto,
    @Query('title') title?: string,
    @Query('catalog') catalog?: string,
    @Query('level') level?: string,
    @Query('sortField') sortField = 'createdAt',
    @Query('sortType') sortType = 'asc',
    @Query('page', ParseIntPipe) page = 0,
    @Query('pageSize', ParseIntPipe) pageSize = 10,
  ): Promise<IPaginationResponse<Course>> {
    const filter = { $and: [{ isEndSell: { $ne: true } }] } as any;

    if (title) {
      filter['$and'].push({ title: { $regex: `.*${title}.*`, $options: 'i' } });
    }
    if (level && level.toLowerCase() !== 'all') {
      filter['$and'].push({ level });
    }

    if (catalog) {
      filter['$and'].push({ catalog: catalog });
    }
    const courses = await this.coursesService.findAll(
      filter,
      '_id title level highlights overview catalog thumbnail price numberOfStudents numberOfLessons isPurchased createdAt updatedAt',
      {
        skip: page * pageSize,
        limit: pageSize,
        sort: {
          [sortField]: sortType,
        },
      },
    );
    for (const course of courses) {
      course['isPurchased'] = false;
    }
    if (user) {
      const purchasedCourseIds = [];
      (
        await this.ordersService.findAll({
          customer: new mongoose.Types.ObjectId(user._id),
          status: EOrderStatus.COMPLETED,
        } as any)
      )?.map((course) => {
        course.items.map((item) => {
          purchasedCourseIds.push(item.course);
        });
      });
      for (const course of courses) {
        if (purchasedCourseIds.includes(course._id.toString())) {
          course['isPurchased'] = true;
        }
      }
    }

    return {
      isSuccess: true,
      message: 'Lấy danh sách khóa học thành công',
      data: courses,
      pagination: {
        page,
        pageSize,
        pageCount: 1,
        totalPage: Math.floor(
          (await this.coursesService.count(filter)) / pageSize + 1,
        ),
      },
    };
  }

  @UseGuards(new OptionalJwtAccessTokenAuthGuard())
  @Get(':id')
  async getDetail(
    @User() user: AuthUserDto,
    @Param('id') id: string,
  ): Promise<IResponse<Course>> {
    const course = await this.coursesService.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    if (!course) {
      throw new NotFoundException({
        isSuccess: false,
        message: 'Không tìm thấy khóa học',
        data: null,
      });
    }
    return {
      isSuccess: true,
      message: 'Lấy chi tiết khóa học thành công',
      data: await this.coursesService.removeNotTrailLinks(course, user),
    };
  }

  @UseGuards(RolesGuard)
  @UseGuards(new JwtAccessTokenAuthGuard())
  @Roles(ERole.ADMIN)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<IResponse<Course>> {
    const course = await this.coursesService.update(id, updateCourseDto);
    if (!course) {
      throw new NotFoundException({
        isSuccess: false,
        message: 'Không tìm thấy khóa học',
        data: null,
      });
    }
    return {
      isSuccess: true,
      message: 'Cập nhật khóa học thành công',
      data: course,
    };
  }

  @UseGuards(RolesGuard)
  @UseGuards(new JwtAccessTokenAuthGuard())
  @Roles(ERole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<IResponse<Course>> {
    const courseOwnerUser = await this.courseOwnedUsersService.findOne({
      course: new mongoose.Types.ObjectId(id),
    });
    const order = await this.ordersService.findOne({
      'items.course': id,
    });

    if (courseOwnerUser || order) {
      throw new BadRequestException({
        isSuccess: false,
        message: 'Không thể xóa khóa học',
        data: null,
      });
    }
    const course = await this.coursesService.remove(id);
    if (!course) {
      throw new NotFoundException({
        isSuccess: false,
        message: 'Không tìm thấy khóa học',
        data: null,
      });
    }

    return {
      isSuccess: true,
      message: 'Xóa khóa học thành công',
      data: await this.coursesService.remove(id),
    };
  }

  @UseGuards(new JwtAccessTokenAuthGuard())
  @Post('active')
  async activeCode(
    @User() user: AuthUserDto,
    @Body() data: ActiveCourseDto,
  ): Promise<IResponse<Course>> {
    return {
      isSuccess: true,
      message: 'Nhận khóa học thành công',
      data: await this.coursesService.activeCourse(
        user._id.toString(),
        data.code,
      ),
    };
  }
}
