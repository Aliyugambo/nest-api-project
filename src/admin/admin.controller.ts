import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { JwtAuthGuard, Roles } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/users/entities/user.entity';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Add a new admin' })
  @ApiBody({ type: CreateAdminDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('add-admin')
  async addAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.addAdmin(createAdminDto);
  }

  @ApiOperation({ summary: 'Get admin-only data' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin-only')
  getAdminData() {
    return { message: 'Hello Admin!' };
  }
}
