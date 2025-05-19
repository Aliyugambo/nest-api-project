// src/users/users.controller.ts
import {
  Controller,
  Get,
  UseGuards,
  Req,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  FetchPrivateMessagesDto,
  FetchGroupMessagesDto,
} from './dto/fetch-messages.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get user profile' })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user; // { id, email, role }
  }

  @ApiOperation({ summary: 'Fetch private message history with a recipient' })
  @UseGuards(JwtAuthGuard)
  @Get('private-messages')
  async fetchPrivateMessages(
    @Req() req,
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: FetchPrivateMessagesDto,
  ) {
    return this.usersService.getPrivateMessageHistory(
      req.user.id,
      query.recipient,
    );
  }

  @ApiOperation({ summary: 'Fetch group message history' })
  @UseGuards(JwtAuthGuard)
  @Get('group-messages')
  async fetchGroupMessages(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: FetchGroupMessagesDto,
  ) {
    return this.usersService.getGroupMessageHistory(query.group);
  }
}
