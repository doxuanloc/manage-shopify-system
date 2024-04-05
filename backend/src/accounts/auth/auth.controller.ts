import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IResponse } from '../../common/interfaces/response.interface';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { User } from './decorators/user.decorator';
import { AuthUserDto } from './dto/auth-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAccessTokenAuthGuard } from './guards/jwt-access-token-auth.guard';
import { JwtRefreshTokenAuthGuard } from './guards/jwt-refresh-token-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@User() user: AuthUserDto): Promise<
    IResponse<{
      user: AuthUserDto;
      token: { accessToken: string; refreshToken: string };
    }>
  > {
    return {
      isSuccess: true,
      message: 'Đăng nhập thành công',
      data: {
        user,
        token: await this.authService.generateToken(user),
      },
    };
  }

  @Post('register')
  async register(@Body() data: RegisterDto): Promise<IResponse<AuthUserDto>> {
    const user = await this.authService.register(data);
    delete user.password;
    return {
      isSuccess: true,
      message: 'Đăng ký thành công',
      data: user,
    };
  }

  @UseGuards(new JwtAccessTokenAuthGuard())
  @Get('profile')
  async getProfile(@User() user: AuthUserDto): Promise<IResponse<AuthUserDto>> {
    const dbUser = await this.usersService.findById(user._id.toString());
    delete dbUser.password;
    return {
      isSuccess: true,
      message: 'Lấy hồ sơ cá nhân thành công',
      data: dbUser,
    };
  }

  @UseGuards(new JwtRefreshTokenAuthGuard())
  @Get('refresh-token')
  async refreshToken(@User() user: AuthUserDto): Promise<IResponse<string>> {
    return {
      isSuccess: true,
      message: 'Lấy refresh token thành công',
      data: await this.authService.generateAccessToken(user),
    };
  }

  @UseGuards(new JwtAccessTokenAuthGuard())
  @Put('profile')
  async updateProfile(
    @User() user: AuthUserDto,
    @Body() data: UpdateProfileDto,
  ): Promise<IResponse<AuthUserDto>> {
    const profile = await this.authService.updateProfile(
      user._id.toString(),
      data,
    );
    delete profile.password;
    return {
      isSuccess: true,
      message: 'Cập nhật hồ sơ cá nhân thành công',
      data: profile,
    };
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() data: ForgotPasswordDto,
  ): Promise<IResponse<boolean>> {
    await this.authService.forgotPassword(data);
    return {
      isSuccess: true,
      message: 'Quên mật khẩu thành công',
      data: true,
    };
  }

  @Post('reset-password')
  async resetPassword(@Body() data: ResetPasswordDto): Promise<
    IResponse<{
      user: AuthUserDto;
      token: { accessToken: string; refreshToken: string };
    }>
  > {
    return {
      isSuccess: true,
      message: 'Đặt lại mật khẩu thành công',
      data: await this.authService.resetPassword(data),
    };
  }

  @UseGuards(new JwtAccessTokenAuthGuard())
  @Put('change-password')
  async changePassword(
    @User() user: AuthUserDto,
    @Body() data: ChangePasswordDto,
  ): Promise<
    IResponse<{
      user: AuthUserDto;
      token: { accessToken: string; refreshToken: string };
    }>
  > {
    const userData = await this.authService.changePassword(
      user._id.toString(),
      data,
    );
    return {
      isSuccess: true,
      message: 'Đổi mật khẩu thành công',
      data: userData,
    };
  }
}
