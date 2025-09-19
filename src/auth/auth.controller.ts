import { Controller, Post, Body, Res, UseGuards, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/signup.dto';
import { SigninDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  // Signup with email + password
  /**
   * Đăng ký tài khoản mới
   * @returns {
   *   user: Thông tin user (không có password_hash),
   *   access_token: JWT,
   *   refresh_token: JWT
   * }
   */
  @Post('signup')
  async signup(@Body() dto: SignUpDto, @Res({ passthrough: true }) res: Response) {
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

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signin(
    @Req() req: Request & { user?: any },
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user;
    const tokens = await this.authService.signin(user);

    // Set refresh token as HttpOnly cookie
    res.cookie('refreshToken', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // leave to client expiration from token
    });

    return { access_token: tokens.access_token };
  }
}
