import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsModule } from '../accounts/accounts.module';
import { FileController } from './file.controller';
import { fileProviders } from './file.provider';
import { FileService } from './file.service';
import { File, FileSchema } from './schemas/file.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: File.name,
        useFactory: () => {
          const schema = FileSchema;
          return schema;
        },
      },
    ]),
    AccountsModule,
  ],
  providers: [FileService, ...fileProviders],
  controllers: [FileController],
})
export class FileModule {}
