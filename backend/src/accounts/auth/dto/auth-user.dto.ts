import { PartialType } from '@nestjs/mapped-types';
import { User } from '../../users/schemas/user.schema';

export class AuthUserDto extends PartialType(User) {}
