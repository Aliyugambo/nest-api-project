import { IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FetchPrivateMessagesDto {
  @ApiProperty({
    description: 'Recipient user ID',
    example: '4062f5af-15eb-4396-8c2d-ef9af8554fbe',
  })
  @IsUUID()
  recipient: string;
}

export class FetchGroupMessagesDto {
  @ApiProperty({ description: 'Group name', example: 'test-group' })
  @IsString()
  group: string;
}
