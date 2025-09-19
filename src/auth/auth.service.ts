

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { SigninDto } from './dto/login.dto';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { jwtConstants } from './auth.constants';
import { JwtService } from './jwt.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: NestJwtService,
    private readonly jwtServiceWrapper: JwtService,
  ) {}

  async signup(dto: SignUpDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      return { message: 'Email already registered' };
    }

    const created = await this.usersService.create({
      email: dto.email,
      password: dto.password,
    });

    const { password_hash, ...user } = created as any;
    const payload = { email: user.email, sub: user.user_id };
    const accessToken = this.jwtServiceWrapper.signAccess(payload);
    const refreshToken = this.jwtServiceWrapper.signRefresh(payload);

    return {
      user,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return null;
    const { password_hash, ...result } = user;
    return result;
  }

  async signin(user: any) {
    const payload = { email: user.email, sub: user.user_id };
    const accessToken = this.jwtServiceWrapper.signAccess(payload);
    const refreshToken = this.jwtServiceWrapper.signRefresh(payload);

    return { access_token: accessToken, refresh_token: refreshToken };
  }
}
