import { IsEmail, IsString, IsEnum } from 'class-validator';
import { OtpReason } from './otp-reason.enum';

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  otp: string;

  @IsEnum(OtpReason)
  reason: OtpReason;
}