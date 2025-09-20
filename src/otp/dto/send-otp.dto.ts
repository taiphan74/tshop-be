import { IsEmail, IsOptional, IsString, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { OtpReason } from './otp-reason.enum';

export class SendOtpDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  expiresInMinutes?: number;

  @IsEnum(OtpReason)
  reason: OtpReason;
}