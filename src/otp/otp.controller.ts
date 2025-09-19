import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { OtpService } from './otp.service';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  /**
   * Gửi OTP đến email
   * POST /otp/send
   * Body: { email: string, expiresInMinutes?: number }
   */
  @Post('send')
  async sendOtp(@Body() body: { email: string; expiresInMinutes?: number }) {
    const { email, expiresInMinutes = 5 } = body;

    try {
      await this.otpService.sendOtp(email, expiresInMinutes);
      return {
        success: true,
        message: `OTP đã được gửi đến ${email}`,
        expiresIn: `${expiresInMinutes} phút`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Không thể gửi OTP. Vui lòng thử lại.',
        error: error.message,
      };
    }
  }

  /**
   * Xác minh OTP
   * POST /otp/verify
   * Body: { email: string, otp: string }
   */
  @Post('verify')
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    const { email, otp } = body;

    const isValid = await this.otpService.verifyOtp(email, otp);

    if (isValid) {
      return {
        success: true,
        message: 'OTP hợp lệ',
      };
    } else {
      return {
        success: false,
        message: 'OTP không hợp lệ hoặc đã hết hạn',
      };
    }
  }

  /**
   * Kiểm tra trạng thái OTP
   * GET /otp/status/:email
   */
  @Get('status/:email')
  async checkOtpStatus(@Param('email') email: string) {
    const hasActiveOtp = await this.otpService.hasActiveOtp(email);

    return {
      email,
      hasActiveOtp,
      message: hasActiveOtp ? 'Có OTP đang hoạt động' : 'Không có OTP đang hoạt động',
    };
  }
}