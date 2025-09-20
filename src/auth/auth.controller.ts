import { Controller, Post, Body, Res, UseGuards, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { SignUpDto } from './dto/signup.dto';
import { SigninDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UnauthorizedException } from '@nestjs/common';
import { UserDto } from '../users/dto/user.dto';

export interface AuthResponse {
  user: UserDto;
  access_token: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({ summary: 'Register a new account' })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @Post('sign-up')
  async signup(@Body() dto: SignUpDto, @Res({ passthrough: true }) res: Response): Promise<AuthResponse> {
    const result = await this.authService.signup(dto);
    if (result.refresh_token) {
      res.cookie('refreshToken', result.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
      });
    }
    return {
      user: result.user,
      access_token: result.access_token,
    };
  }

  @ApiOperation({ summary: 'Sign in' })
  @ApiBody({ type: SigninDto })
  @ApiResponse({ status: 201, description: 'Sign in successful' })
  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  async signin(
    @Req() req: Request & { user?: UserDto },
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const user = req.user as UserDto;
    const tokens = await this.authService.signin(user);

    const ttlMs = this.authService['_refreshExpiresSeconds']() * 1000;

    res.cookie('refreshToken', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false,
      sameSite: 'lax',
      maxAge: ttlMs,
    });

    return { user, access_token: tokens.access_token };
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookie = req.cookies?.refreshToken as string | undefined;
    const bodyToken = (req.body && (req.body.refresh_token || req.body.refreshToken)) as string | undefined;
    const token = cookie ?? bodyToken;
    if (!token) throw new UnauthorizedException('Missing refresh token');

    const tokens = await this.authService.refreshToken(token);

    res.cookie('refreshToken', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
    });

    return { access_token: tokens.access_token };
  }

  @ApiOperation({ summary: 'Logout (revoke refresh token)' })
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookie = req.cookies?.refreshToken as string | undefined;
    if (cookie) {
      try {
        const decoded = this.authService['jwtServiceWrapper']?.verifyRefresh(cookie) as any;
        if (decoded && decoded.sub) {
          const userId = decoded.sub;
          const key = `refresh:${userId}`;
          try {
            await (this.authService as any).redisClient.del(key);
          } catch (e) {}
        }
      } catch (e) {}
    }

    res.clearCookie('refreshToken');
    return { message: 'Logged out' };
  }

  @Post('verify-email')
  async sendEmailVerification(@Body() body: { email: string }) {
    await this.authService.sendEmailVerification(body.email);
    return { message: 'OTP sent to email' };
  }

  @Post('verify-email/confirm')
  async verifyEmail(@Body() body: { email: string; otp: string }) {
    const success = await this.authService.verifyEmail(body.email, body.otp);
    return { success, message: success ? 'Email verified' : 'Invalid OTP' };
  }

  @ApiOperation({ summary: 'Forgot password' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'OTP sent for password reset' })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return { message: 'OTP đã được gửi để reset password' };
  }

  @ApiOperation({ summary: 'Reset password' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const success = await this.authService.resetPassword(dto.email, dto.otp, dto.newPassword);
    return { success, message: success ? 'Password đã được reset' : 'OTP không hợp lệ' };
  }
}
