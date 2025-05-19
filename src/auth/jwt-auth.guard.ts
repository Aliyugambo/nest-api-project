// src/auth/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
export const Public = () => SetMetadata('isPublic', true);
