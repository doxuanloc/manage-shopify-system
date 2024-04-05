import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, {
  FilterQuery,
  Model,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';
import { ERole } from './constants';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.logger.log('Seed admin');
    const totalUser = await this.userModel.count();
    if (totalUser === 0) {
      await this.userModel.create({
        email: this.configService.get<string>('ADMIN_EMAIL', 'admin@gmail.com'),
        phoneNumber: this.configService.get<string>(
          'ADMIN_PHONE_NUMBER',
          '0123456789',
        ),
        password: this.configService.get<string>('ADMIN_PASSWORD', '@Dmin123'),
        fullName: 'Admin',
        roles: [ERole.USER, ERole.ADMIN],
      });
    }
  }

  async findById(id: string | mongoose.Types.ObjectId): Promise<User> {
    return await this.userModel.findById(id).lean().exec();
  }

  async create(data: Partial<User>): Promise<User> {
    return (await this.userModel.create(data)).toObject();
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email }).lean().exec();
  }

  async findOne(filter: FilterQuery<User>): Promise<User> {
    return await this.userModel.findOne(filter).lean().exec();
  }

  async findOneAndUpdate(
    filter: FilterQuery<User>,
    update: UpdateQuery<User>,
    options?: QueryOptions<User>,
  ): Promise<User> {
    return await this.userModel
      .findOneAndUpdate(filter, update, { returnDocument: 'after', ...options })
      .lean()
      .exec();
  }

  async findAll(
    filter?: FilterQuery<User[]>,
    projection?: ProjectionType<User> | null | undefined,
    options?: QueryOptions<User> | null | undefined,
  ): Promise<User[]> {
    return await this.userModel.find(filter, projection, options).lean().exec();
  }

  async count(filter?: FilterQuery<User>): Promise<number> {
    return await this.userModel.count(filter);
  }

  async markAsPurchased(id: mongoose.Types.ObjectId): Promise<User> {
    return await this.userModel
      .findOneAndUpdate(id, { isPurchased: true })
      .lean()
      .exec();
  }
}
