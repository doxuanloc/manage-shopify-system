import { IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Vui lòng nhập mã xác nhập' })
  code: string;
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu mới' })
  password: string;
  @IsNotEmpty({ message: 'Vui lòng nhập xác nhận mật khẩu mới' })
  confirmPassword: string;
}
