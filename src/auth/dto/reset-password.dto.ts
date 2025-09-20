import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { OtpReason } from '../../otp/dto/otp-reason.enum';

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  otp: string;

  @IsString()
  @MinLength(6)
  newPassword: string;

  @IsEnum(OtpReason)
  reason: OtpReason = OtpReason.FORGOT_PASSWORD;
}