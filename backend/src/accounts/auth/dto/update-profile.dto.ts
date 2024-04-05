import { IsNotEmpty } from 'class-validator';

export class UpdateProfileDto {
  // @IsPhoneNumber()
  @IsNotEmpty({ message: 'Vui lòng nhập số điện thoại' })
  phoneNumber: string;
  @IsNotEmpty({ message: 'Vui lòng nhập họ và tên' })
  fullName: string;
  birthDay?: string;
  avatarUrl?: string;
  address?: string;
}
