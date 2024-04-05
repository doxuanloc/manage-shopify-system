import { IsOptional } from 'class-validator';

export class UpdateLoadFileDto {
  @IsOptional()
  name: string;
}
