import { IsEmail, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { Gender } from '../user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password_hash: string;
}
