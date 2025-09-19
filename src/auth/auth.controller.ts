import { Controller, Post, Body, Res, UseGuards, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/signup.dto';
import { SigninDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  // Signup with email + password
  /**
   * Register a new account
   * @returns {
   *   user: User information (without password_hash),
   *   access_token: JWT,
   *   refresh_token: JWT
   * }
   */
  @ApiOperation({ summary: 'Register a new account' })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({ status: 201, description: 'Registration successful' })
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

  @ApiOperation({ summary: 'Sign in' })
  @ApiBody({ type: SigninDto })
  @ApiResponse({ status: 201, description: 'Sign in successful' })
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
