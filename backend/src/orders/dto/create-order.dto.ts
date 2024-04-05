import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { EPaymentType } from '../constants';

export class OrderCustomerInfo {
  @IsString({ message: 'Vui lòng nhập chuỗi ký tự' })
  @IsNotEmpty({ message: 'Vui lòng nhập số điện thoại' })
  phoneNumber: string;
  @IsString({ message: 'Vui lòng nhập chuỗi ký tự' })
  @IsNotEmpty({ message: 'Vui lòng nhập họ và tên' })
  fullName: string;
}

export class OrderItem {
  @IsString({ message: 'Vui lòng nhập chuỗi ký tự' })
  @IsNotEmpty({ message: 'Vui lòng chọn khóa học' })
  course: string;
}

export class CreateOrderDto {
  userId: string;

  @Type(() => OrderCustomerInfo)
  @ValidateNested()
  @IsNotEmpty({ message: 'Vui lòng nhập thông tin khách hàng' })
  customerInfo: OrderCustomerInfo;

  @Type(() => OrderItem)
  @ValidateNested({ each: true })
  @IsNotEmpty({ message: 'Vui lòng chọn ít nhất một khóa học' })
  items: OrderItem[];

  @IsNotEmpty({ message: 'Vui lòng nhập phương thức thanh toán' })
  @IsEnum(EPaymentType)
  paymentType: EPaymentType;
}
