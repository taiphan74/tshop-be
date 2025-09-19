

import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { SigninDto } from './dto/login.dto';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { jwtConstants } from './auth.constants';
import { parseDuration } from '../algorithms/parseDuration';
import { JwtService } from './jwt.service';
import Redis from 'ioredis';
import { REDIS_CLIENTS } from '../common/redis/redis.module';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: NestJwtService,
    private readonly jwtServiceWrapper: JwtService,
    @Inject('REDIS_CLIENT_AUTH') private readonly redisClient: Redis,
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

    // store refresh token in redis
    try {
      const key = `refresh:${user.user_id}`;
      await this.redisClient.set(key, refreshToken, 'EX', this._refreshExpiresSeconds());
    } catch (e) {
      // don't block signup if redis fails, but log in real app
    }

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

    // persist refresh token to redis
    try {
      const key = `refresh:${user.user_id}`;
      await this.redisClient.set(key, refreshToken, 'EX', this._refreshExpiresSeconds());
    } catch (e) {}

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  private _refreshExpiresSeconds(): number {
    return parseDuration(jwtConstants.refreshExpiresIn as any);
  }

  async refreshToken(oldRefresh: string) {
    try {
      const decoded = this.jwtServiceWrapper.verifyRefresh(oldRefresh) as any;
      const userId = decoded.sub;
      const key = `refresh:${userId}`;
      const stored = await this.redisClient.get(key);
      if (!stored) throw new UnauthorizedException('Refresh token not found');
      if (stored !== oldRefresh) throw new UnauthorizedException('Refresh token mismatch');

      // rotate tokens: issue new access and refresh, persist new refresh
      const payload = { email: decoded.email, sub: userId };
      const accessToken = this.jwtServiceWrapper.signAccess(payload);
      const refreshToken = this.jwtServiceWrapper.signRefresh(payload);
      await this.redisClient.set(key, refreshToken, 'EX', this._refreshExpiresSeconds());

      return { access_token: accessToken, refresh_token: refreshToken };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
