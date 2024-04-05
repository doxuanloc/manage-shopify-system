import { IsNotEmpty, IsString } from 'class-validator';

export class ActiveCourseDto {
  @IsString({ message: 'Vui lòng nhập chuỗi ký tự' })
  @IsNotEmpty({ message: 'Vui lòng nhập mã kích hoạt khóa học' })
  code: string;
}
