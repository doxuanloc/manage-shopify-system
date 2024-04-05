import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { Roles } from '../accounts/auth/decorators/roles.decorator';
import { User } from '../accounts/auth/decorators/user.decorator';
import { AuthUserDto } from '../accounts/auth/dto/auth-user.dto';
import { JwtAccessTokenAuthGuard } from '../accounts/auth/guards/jwt-access-token-auth.guard';
import { RolesGuard } from '../accounts/auth/guards/roles.guard';
import { ERole } from '../accounts/users/constants';
import {
  IPaginationResponse,
  IResponse,
} from '../common/interfaces/response.interface';
import { ParseIntPipe } from '../common/pipes/parseInt.pipe';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { Order } from './schemas/order.schema';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(new JwtAccessTokenAuthGuard())
  @Post()
  async create(
    @User() user: AuthUserDto,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<IResponse<Order>> {
    return {
      isSuccess: true,
      message: 'Tạo đơn hàng thành công',
      data: await this.ordersService.create({
        ...createOrderDto,
        userId: user._id.toString(),
      }),
    };
  }
  @UseGuards(new JwtAccessTokenAuthGuard())
  @Get()
  async findAll(
    @User() user: AuthUserDto,
    @Query('status') status?: string,
    @Query('sortField') sortField = 'createdAt',
    @Query('sortType') sortType = 'asc',
    @Query('page', ParseIntPipe) page = 0,
    @Query('pageSize', ParseIntPipe) pageSize = 10,
  ): Promise<IPaginationResponse<Order>> {
    let filter = null;

    if (!user.roles.includes(ERole.ADMIN)) {
      filter = { customer: new mongoose.Types.ObjectId(user._id) };
    }

    if (status) {
      filter = filter ? { ...filter, status } : { status };
    }

    return {
      isSuccess: true,
      message: 'Lấy danh sách đơn hàng thành công',
      data: await this.ordersService.findAll(
        filter,
        '_id customer customerInfo paymentTpe status totalPrice items createdAt updatedAt',
        {
          skip: page * pageSize,
          limit: pageSize,
          sort: {
            [sortField]: sortType,
          },
          populate: [
            {
              path: 'customer',
              select: '_id email fullName avatarUrl phoneNumber address',
            },
            {
              path: 'items.course',
              model: 'Course',
              match: '_id',
              select: '_id title thumbnail price',
            },
          ],
        },
      ),

      pagination: {
        page,
        pageSize,
        pageCount: 1,
        totalPage: Math.floor(
          (await this.ordersService.count(filter)) / pageSize + 1,
        ),
      },
    };
  }

  @UseGuards(new JwtAccessTokenAuthGuard())
  @Get(':id')
  async findOne(
    @User() user: AuthUserDto,
    @Param('id') id: string,
  ): Promise<IResponse<Order>> {
    let filter = { _id: new mongoose.Types.ObjectId(id) } as any;
    if (!user.roles.includes(ERole.ADMIN)) {
      filter = {
        ...filter,
        customer: new mongoose.Types.ObjectId(user._id),
      };
    }
    const order = await this.ordersService.findOne(filter, null, {
      populate: [
        {
          path: 'customer',
          select: '_id email fullName avatarUrl phoneNumber address',
        },
        {
          path: 'items.course',
          model: 'Course',
          match: '_id',
          select: '_id title thumbnail price',
        },
      ],
    });

    if (!order) {
      throw new NotFoundException({
        isSuccess: false,
        message: 'Không tìm thấy đơn hàng',
        data: null,
      });
    }

    return {
      isSuccess: true,
      message: 'Lấy đơn hàng thành công',
      data: order,
    };
  }

  @UseGuards(RolesGuard)
  @UseGuards(new JwtAccessTokenAuthGuard())
  @Roles(ERole.ADMIN)
  @Post(':id/complete')
  async completeOrder(@Param('id') id: string): Promise<IResponse<Order>> {
    return {
      isSuccess: true,
      message: 'Hoàn thành đơn hàng thành công',
      data: await this.ordersService.completeOrder(id),
    };
  }
}
