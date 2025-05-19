import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({ description: 'Email address of the admin' })
  email: string;

  @ApiProperty({ description: 'Password for the admin account' })
  password: string;
}
