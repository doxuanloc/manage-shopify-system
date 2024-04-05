import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { CoursesModule } from '../courses/courses.module';
import { hashPassword } from '../common/utils/password';
import { EmailModule } from '../email/email.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { jwtConstants } from './auth/constants';
import { Code, CodeSchema } from './auth/schemas/code.schema';
import { JwtStrategy } from './auth/strategy/jwt.strategy';
import { LocalStrategy } from './auth/strategy/local.strategy';
import { User, UserSchema } from './users/schemas/user.schema';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => {
          const schema = UserSchema;
          schema.pre('save', async function () {
            if (this.password) {
              this.password = await hashPassword(this.password);
            }
          });
          return schema;
        },
      },
      {
        name: Code.name,
        useFactory: () => {
          const schema = CodeSchema;
          return schema;
        },
      },
    ]),
    JwtModule.register({
      secret: jwtConstants.secret,
    }),
    PassportModule,
    EmailModule,
  ],
  controllers: [UsersController, AuthController],
  providers: [UsersService, AuthService, LocalStrategy, JwtStrategy],
  exports: [UsersService],
})
export class AccountsModule {}
