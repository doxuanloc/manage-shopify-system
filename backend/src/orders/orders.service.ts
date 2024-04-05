import {
  BadGatewayException,
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, {
  FilterQuery,
  Model,
  ProjectionType,
  QueryOptions,
} from 'mongoose';
import { UsersService } from '../accounts/users/users.service';
import { CourseActiveCodesService } from '../courses/course-active-codes.service';
import { CoursesService } from '../courses/courses.service';
import { EmailService } from '../email/email.service';
import { EOrderStatus } from './constants';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderDocument } from './schemas/order.schema';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @Inject(forwardRef(() => CoursesService))
    private readonly coursesService: CoursesService,
    @Inject(forwardRef(() => CourseActiveCodesService))
    private readonly courseActiveCodesService: CourseActiveCodesService,
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
    @Inject(UsersService)
    private readonly usersService: UsersService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const { userId, customerInfo, items, paymentType } = createOrderDto;
    let totalPrice = 0;
    for (const item of items) {
      const course = await this.coursesService.findOne({
        _id: new mongoose.Types.ObjectId(item.course),
        isEndSell: { $ne: true },
      });

      if (!course) {
        throw new BadRequestException({
          isSuccess: false,
          message: `Course ${item.course} not found`,
          data: null,
        });
      }
      totalPrice += course.price;
    }

    return (
      await this.orderModel.create({
        customer: userId,
        customerInfo,
        items,
        paymentType,
        totalPrice,
      })
    ).toObject();
  }

  async findAll(
    filter?: FilterQuery<Order[]>,
    projection?: ProjectionType<Order> | null | undefined,
    options?: QueryOptions<Order> | null | undefined,
  ): Promise<Order[]> {
    return await this.orderModel
      .find(filter, projection, options)
      .lean()
      .exec();
  }

  async findOne(
    filter?: FilterQuery<Order>,
    projection?: ProjectionType<Order> | null,
    options?: QueryOptions<Order> | null,
  ): Promise<Order> {
    return await this.orderModel
      .findOne(filter, projection, options)
      .lean()
      .exec();
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
  async count(filter?: FilterQuery<Order>): Promise<number> {
    return await this.orderModel.count(filter);
  }

  async completeOrder(orderId: string): Promise<Order> {
    const order = await this.orderModel
      .findById(orderId)
      .populate([
        {
          path: 'customer',
          select: '_id email fullName avatarUrl phoneNumber address',
        },
        {
          path: 'items.course',
          model: 'Course',
          match: '_id',
          select: '_id title thumbnail price numberOfStudents',
        },
      ])
      .lean()
      .exec();

    if (!order) {
      throw new NotFoundException({
        isSuccess: false,
        message: 'Không tìm thấy đơn hàng',
        data: null,
      });
    }

    if (order.status !== EOrderStatus.PENDING) {
      throw new BadGatewayException({
        isSuccess: false,
        message: 'Không thể hoàn thành đơn hàng',
        data: null,
      });
    }

    const activeCodes = [];

    for (const item of order.items) {
      const activeCode = await this.courseActiveCodesService.create(
        item.course._id,
      );
      activeCodes.push({ activeCode, course: item.course });

      // await this.coursesService.update(item.course._id.toString(), {
      //   numberOfStudents: item.course.numberOfStudents + 1,
      // });
    }

    const text = activeCodes
      .map(
        (activeCode) =>
          `${activeCode.course.title}: ${activeCode.activeCode.code}`,
      )
      .join('. ');
    const html = activeCodes
      .map(
        (activeCode) =>
          `<b>${activeCode.course.title}: ${activeCode.activeCode.code}</b>`,
      )
      .join('<br>');

    this.emailService.sendMail({
      from: 'Course-booking',
      to: order.customer.email,
      subject: 'Course booking active code',
      text,
      html,
    });

    await this.usersService.markAsPurchased(order.customer._id);
    return await this.orderModel
      .findByIdAndUpdate(
        orderId,
        { status: EOrderStatus.COMPLETED },
        {
          new: true,
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
      )
      .lean()
      .exec();
  }
}
