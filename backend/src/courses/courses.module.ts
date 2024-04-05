import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsModule } from '../accounts/accounts.module';
import { OrdersModule } from '../orders/orders.module';
import { CourseActiveCodesService } from './course-active-codes.service';
import { CourseOwnedUsersService } from './course-owned-user.service';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import {
  CourseActiveCode,
  CourseActiveCodeSchema,
} from './schemas/course-active-code.schema';
import {
  CourseOwnedUser,
  CourseOwnedUserSchema,
} from './schemas/course-owned-user.schema';
import { Course, CourseSchema } from './schemas/course.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Course.name,
        useFactory: () => {
          const schema = CourseSchema;
          return schema;
        },
      },
      {
        name: CourseActiveCode.name,
        useFactory: () => {
          const schema = CourseActiveCodeSchema;
          return schema;
        },
      },
      {
        name: CourseOwnedUser.name,
        useFactory: () => {
          const schema = CourseOwnedUserSchema;
          return schema;
        },
      },
    ]),
    forwardRef(() => AccountsModule),
    forwardRef(() => OrdersModule),
  ],
  controllers: [CoursesController],
  providers: [
    CoursesService,
    CourseActiveCodesService,
    CourseOwnedUsersService,
  ],
  exports: [CoursesService, CourseActiveCodesService, CourseOwnedUsersService],
})
export class CoursesModule {}
