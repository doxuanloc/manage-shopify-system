import { IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu hiện tại' })
  currentPassword: string;
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu mới' })
  password: string;
  @IsNotEmpty({ message: 'Vui lòng nhập xác nhập mật khẩu mới' })
  confirmPassword: string;
}
