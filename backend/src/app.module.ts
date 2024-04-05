import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { AccountsModule } from './accounts/accounts.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoursesModule } from './courses/courses.module';
import { EmailModule } from './email/email.module';
import { FileModule } from './file/file.module';
import { OrdersModule } from './orders/orders.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) =>
        configService.get<MongooseModuleOptions>('database'),
      inject: [ConfigService],
    }),
    forwardRef(() => AccountsModule),
    forwardRef(() => CoursesModule),
    forwardRef(() => EmailModule),
    forwardRef(() => FileModule),
    forwardRef(() => OrdersModule),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
