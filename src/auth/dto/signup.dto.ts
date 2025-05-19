// src/auth/dto/signup.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({ description: 'Name of the user' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'First name of the user' })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Email address of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Country of the user' })
  @IsNotEmpty()
  country: string;

  @ApiProperty({ description: 'Password for the user account', minLength: 6 })
  @MinLength(6)
  password: string;
}
