import { IsEmail, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { Gender } from '../user.entity';

export class UserDto {
  user_id: string;

  @IsEmail()
  email: string;

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

  created_at?: Date;
  last_login?: Date;
}
