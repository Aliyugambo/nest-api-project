import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
// import { UsersGateway } from './users.gateway';
import { GroupMessage } from './entities/group-message.entity';
import { PrivateMessage } from './entities/private-message.entity';
import { JwtStrategy } from 'src/auth/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([User, PrivateMessage, GroupMessage])],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
