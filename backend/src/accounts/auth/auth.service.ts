import { Inject, Injectable } from '@nestjs/common';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import moment from 'moment';
import mongoose, { Model } from 'mongoose';
import { comparePassword, hashPassword } from '../../common/utils/password';
import { EmailService } from '../../email/email.service';
import { UsersService } from '../users/users.service';
import { ECodeType, jwtConstants } from './constants';
import { AuthUserDto } from './dto/auth-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Code, CodeDocument } from './schemas/code.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectModel(Code.name) private readonly codeModel: Model<CodeDocument>,
    @Inject(EmailService)
    private readonly emailService: EmailService,
  ) {}

  async validateUser(username: string, password: string): Promise<AuthUserDto> {
    const user = await this.usersService.findOne({
      $or: [{ email: username }, { phoneNumber: username }],
    });

    if (!user) {
      throw new NotFoundException({
        isSuccess: false,
        message: 'Không tìm thấy tài khoản',
        data: null,
      });
    }

    if (!(await comparePassword(password, user.password))) {
      throw new BadRequestException({
        isSuccess: false,
        message: 'Sai mật khẩu',
        data: null,
      });
    }
    delete user.password;
    return user;
  }

  async register(data: RegisterDto) {
    const { phoneNumber, email, fullName, password } = data;
    const userByPhoneNumber = await this.usersService.findOne({ phoneNumber });
    if (userByPhoneNumber) {
      throw new BadRequestException({
        isSuccess: false,
        message: 'Số điện thoại đã được đăng ký',
      });
    }
    const userByEmail = await this.usersService.findOne({ email });
    if (userByEmail) {
      throw new BadRequestException({
        isSuccess: false,
        message: 'Email đã được đăng ký',
      });
    }

    return await this.usersService.create({
      phoneNumber,
      email,
      fullName,
      password,
    });
  }

  async generateAccessToken(user: AuthUserDto) {
    const toSign = {
      _id: user._id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      tokenType: 'access',
    };
    return this.jwtService.sign(toSign, {
      expiresIn: jwtConstants.accessTokenExpiry,
    });
  }

  async generateToken(user: AuthUserDto) {
    const toSign = {
      _id: user._id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      tokenType: 'refresh',
    };
    return {
      accessToken: await this.generateAccessToken(user),
      refreshToken: this.jwtService.sign(toSign, {
        expiresIn: jwtConstants.refreshTokenExpiry,
      }),
    };
  }

  async updateProfile(id: string, data: UpdateProfileDto) {
    const { phoneNumber, fullName, birthDay, avatarUrl, address } = data;

    const user = await this.usersService.findById(id);

    if (!user) {
      throw new BadRequestException({
        isSuccess: false,
        message: 'Không tìm thấy tài khoản',
      });
    }

    const userByPhoneNumber = await this.usersService.findOne({
      phoneNumber,
      _id: { $ne: new mongoose.Types.ObjectId(id) },
    });
    if (userByPhoneNumber) {
      throw new BadRequestException({
        isSuccess: false,
        message: 'Phone number already exists',
      });
    }

    return await this.usersService.findOneAndUpdate(
      { _id: id },
      { phoneNumber, fullName, birthDay, avatarUrl, address },
    );
  }

  async forgotPassword(data: ForgotPasswordDto) {
    const { email } = data;
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException({
        isSuccess: false,
        message: 'Không tìm thấy tài khoản',
        data: null,
      });
    }

    const currentCode = await this.codeModel.findOne({
      user: user._id,
      type: ECodeType.RESET_PASSWORD,
      expireAt: { $gt: moment().toDate() },
    });
    if (currentCode) {
      throw new BadRequestException({
        isSuccess: false,
        message: 'Vui lòng được 5 phút và thử lại',
        data: null,
      });
    }

    const genRanHex = (size) =>
      [...Array(size)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('');
    const codeString = genRanHex(32);
    await this.codeModel.create({
      user,
      code: codeString,
      type: ECodeType.RESET_PASSWORD,
      expireAt: moment().add(5, 'minutes'),
    });
    return await this.emailService.sendMail({
      from: 'Course-booking', // sender address
      to: email, // list of receivers
      subject: 'Reset password code', // Subject line
      text: `${codeString}`, // plain text body
      html: `<b>${codeString}</b>`, // html body
    });
  }

  async resetPassword(data: ResetPasswordDto) {
    const { code: codeString, password, confirmPassword } = data;

    if (password !== confirmPassword) {
      throw new BadRequestException({
        isSuccess: false,
        message: "Password doesn't match",
        data: null,
      });
    }
    const code = await this.codeModel.findOne({
      code: codeString,
      type: ECodeType.RESET_PASSWORD,
      expireAt: { $gt: moment().toDate() },
    });

    if (!code) {
      throw new BadRequestException({
        isSuccess: false,
        message: 'Mã xác nhận sai',
        data: null,
      });
    }

    const user = await this.usersService.findOneAndUpdate(
      { _id: code.user },
      { password: await hashPassword(password) },
      { new: true },
    );

    delete user.password;

    return {
      user,
      token: await this.generateToken(user),
    };
  }

  async changePassword(id: string, data: ChangePasswordDto) {
    const { currentPassword, password, confirmPassword } = data;

    const currentUser = await this.usersService.findById(id);

    if (!currentUser) {
      throw new BadRequestException({
        isSuccess: false,
        message: 'Không tìm thấy tài khoản',
      });
    }

    if (!(await comparePassword(currentPassword, currentUser.password))) {
      throw new BadRequestException({
        isSuccess: false,
        message: 'Sai mật khẩu',
        data: null,
      });
    }

    if (password !== confirmPassword) {
      throw new BadRequestException({
        isSuccess: false,
        message: 'Mật khẩu và mật khẩu xác nhận không giống nhau',
        data: null,
      });
    }

    const user = await this.usersService.findOneAndUpdate(
      { _id: id },
      { password: await hashPassword(password) },
      { new: true },
    );

    delete user.password;

    return {
      user,
      token: await this.generateToken(user),
    };
  }
}
