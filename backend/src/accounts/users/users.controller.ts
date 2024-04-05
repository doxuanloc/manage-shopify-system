import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ParseIntPipe } from 'src/common/pipes/parseInt.pipe';
import { IPaginationResponse } from '../../common/interfaces/response.interface';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAccessTokenAuthGuard } from '../auth/guards/jwt-access-token-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ERole } from './constants';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';
import * as _ from 'lodash';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(RolesGuard)
  @UseGuards(new JwtAccessTokenAuthGuard())
  @Roles(ERole.ADMIN)
  @Get()
  async findAll(
    @Query('fullName') fullName?: string,
    @Query('isPurchased') isPurchased?: boolean,
    @Query('sortField') sortField = 'createdAt',
    @Query('sortType') sortType = 'asc',
    @Query('page', ParseIntPipe) page = 0,
    @Query('pageSize', ParseIntPipe) pageSize = 10,
  ): Promise<IPaginationResponse<User>> {
    const filter = { $and: [{ _id: { $exists: true } }] } as any;

    if (fullName) {
      filter['$and'].push({ $text: { $search: fullName } });
    }

    if (isPurchased === true) {
      filter['$and'].push({ isPurchased });
    }

    return {
      isSuccess: true,
      message: 'Lấy danh sách đơn hàng thành công',
      data: await this.usersService.findAll(
        filter,
        ' _id email phoneNumber password fullName birthDay address avatarUrl roles isPurchased createdAt updatedAt',
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
          (await this.usersService.count(filter)) / pageSize + 1,
        ),
      },
    };
  }

  // @Get(':id')
  // async getById(@Param('id') id: string): Promise<IResponse<User>> {
  //   return {
  //     isSuccess: true,
  //     message: 'Get user success',
  //     data: await this.usersService.findById(id),
  //   };
  // }

  // @Post()
  // async create(): Promise<IResponse<User>> {
  //   return {
  //     isSuccess: true,
  //     message: 'Create user success',
  //     data: await this.usersService.create({}),
  //   };
  // }
}
