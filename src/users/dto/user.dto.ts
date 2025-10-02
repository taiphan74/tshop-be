import { IsEmail, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { Exclude } from 'class-transformer';
import { Gender, UserRole } from '../user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  user_id: string;

  @IsEmail()
  email: string;

  @Exclude()
  password_hash?: string;

  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  size_preference?: string;

  @IsOptional()
  @IsString()
  style_preference?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ default: false })
  is_email_verified: boolean;

  @IsOptional()
  @IsEnum(UserRole)
  @ApiProperty({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  created_at?: Date;
  last_login?: Date;
}
