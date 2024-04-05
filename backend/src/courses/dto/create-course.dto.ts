import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CourseContent {
  @IsString({ message: 'Vui lòng nhập chuỗi ký tự' })
  @IsNotEmpty({ message: 'Vui lòng nhập tên bài học' })
  title: string;
  @IsString({ message: 'Vui lòng nhập chuỗi ký tự' })
  @IsNotEmpty({ message: 'Vui lòng nhập đường dẫn bài học' })
  url: string;
  @IsBoolean()
  @IsNotEmpty({
    message: 'Vui lòng đánh dấu bài học có được dùng thử hay không',
  })
  isTrial: boolean;
}

export class CreateCourseDto {
  @IsNotEmpty({ message: 'Vui lòng nhập tiêu đề khóa học' })
  title: string;

  // @IsNotEmpty({ message: 'Vui lòng nhập ảnh đại diện của khóa học' })
  thumbnail: string;

  // @IsNotEmpty({ message: 'Vui lòng nhập cấp độ khóa học' })
  // @IsString({ message: 'Vui lòng nhập chuỗi' })
  // level: string;

  @IsString({ each: true })
  @IsOptional()
  highlights: string[];

  @IsString({ message: 'Vui lòng nhập chuỗi ký tự' })
  @IsNotEmpty({ message: 'Vui lòng nhập thông tin tông quát về khóa học' })
  overview: string;

  @IsString({ message: 'Vui lòng nhập chuỗi ký tự' })
  @IsNotEmpty({ message: 'Vui lòng nhập giới thiệu khóa học' })
  introduce: string;

  // @Type(() => CourseContent)
  // @ValidateNested({ each: true })
  // lessons: CourseContent[];

  // @IsString({ message: 'Vui lòng nhập chuỗi ký tự' })
  // @IsOptional()
  // document?: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Vui lòng nhập giá khóa học' })
  price: number;

  @IsString()
  @IsOptional()
  catalog: string;

  // @IsBoolean()
  // @IsOptional()
  // isEndSell: boolean;
}
