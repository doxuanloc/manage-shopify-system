import { SetMetadata } from '@nestjs/common';
import { ERole } from '../../users/constants';

export const Roles = (...roles: ERole[]) => SetMetadata('roles', roles);
