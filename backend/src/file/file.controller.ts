import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../accounts/auth/decorators/roles.decorator';
import { JwtAccessTokenAuthGuard } from '../accounts/auth/guards/jwt-access-token-auth.guard';
import { RolesGuard } from '../accounts/auth/guards/roles.guard';
import { ERole } from '../accounts/users/constants';
import { IResponse } from '../common/interfaces/response.interface';
import { UpdateLoadFileDto } from './dto/upload-file.dto';
import { FileService } from './file.service';
import { File } from './schemas/file.schema';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() data: UpdateLoadFileDto,
  ): Promise<IResponse<File>> {
    return {
      isSuccess: true,
      message: 'Tải tệp tin thành công',
      data: await this.fileService.uploadImage(file, data.name),
    };
  }

  @UseGuards(RolesGuard)
  @UseGuards(new JwtAccessTokenAuthGuard())
  @Roles(ERole.ADMIN)
  @Get()
  async getAll(): Promise<IResponse<File[]>> {
    return {
      isSuccess: true,
      message: 'Lấy danh sách tệp tin thành công',
      data: await this.fileService.findAll(),
    };
  }

  @UseGuards(RolesGuard)
  @UseGuards(new JwtAccessTokenAuthGuard())
  @Roles(ERole.ADMIN)
  @Post('delete')
  async deleteFiles(
    @Body() data: { ids: string[] },
  ): Promise<IResponse<string[]>> {
    return {
      isSuccess: true,
      message: 'Xóa tệp tin thành công',
      data: await this.fileService.deleteImages(data.ids),
    };
  }
}
