import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  // @IsPhoneNumber()
  @IsNotEmpty({ message: 'Vui lòng nhập số điện thoại' })
  phoneNumber: string;
  @IsEmail({ message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Vui lòng nhập email' })
  email: string;
  @IsNotEmpty({ message: 'Vui lòng nhập họ và tên' })
  fullName: string;
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu' })
  password: string;
}
