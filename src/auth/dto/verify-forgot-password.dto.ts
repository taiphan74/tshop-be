import { IsEmail, IsString } from 'class-validator';

export class VerifyForgotPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  otp: string;
}