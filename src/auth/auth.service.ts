import { Injectable, UnauthorizedException, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { jwtConstants } from './auth.constants';
import { parseDuration } from '../algorithms/parseDuration';
import { JwtService } from './jwt.service';
import Redis from 'ioredis';
import * as bcrypt from 'bcrypt';
import { OtpService } from '../otp/otp.service';
import { OtpReason } from '../otp/dto/otp-reason.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: NestJwtService,
    private readonly jwtServiceWrapper: JwtService,
    @Inject('REDIS_CLIENT_AUTH') private readonly redisClient: Redis,
    private readonly otpService: OtpService,
  ) {}

  async signup(dto: SignUpDto) {

    const created = await this.usersService.create({
      email: dto.email,
      password: dto.password,
    });

    await this.sendEmailVerification(dto.email);

    const { password_hash, ...user } = created;
    const payload = { email: user.email, sub: user.user_id, role: user.role };
    const accessToken = this.jwtServiceWrapper.signAccess(payload);
    const refreshToken = this.jwtServiceWrapper.signRefresh(payload);

    try {
      const key = `refresh:${user.user_id}`;
      await this.redisClient.set(key, refreshToken, 'EX', this._refreshExpiresSeconds());
    } catch (e) {}

    return {
      user,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async validateUser(email: string, password: string) {
    console.log('Validating user:', email);
    const user = await this.usersService.findByEmail(email);
    console.log('User found:', user);
    if (!user) return null;
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return null;
    const { password_hash, ...result } = user;
    return result;
  }

  async signin(user: any) {
    const payload = { email: user.email, sub: user.user_id, role: user.role };
    const accessToken = this.jwtServiceWrapper.signAccess(payload);
    const refreshToken = this.jwtServiceWrapper.signRefresh(payload);

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

      const payload = { email: decoded.email, sub: userId, role: decoded.role };
      const accessToken = this.jwtServiceWrapper.signAccess(payload);
      const refreshToken = this.jwtServiceWrapper.signRefresh(payload);
      await this.redisClient.set(key, refreshToken, 'EX', this._refreshExpiresSeconds());

      return { access_token: accessToken, refresh_token: refreshToken };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async sendEmailVerification(email: string): Promise<void> {
    await this.otpService.sendOtp(email, OtpReason.VERIFY_EMAIL, 5);
  }

  async verifyEmail(email: string, otp: string): Promise<boolean> {
    const isValid = await this.otpService.verifyOtp(email, otp, OtpReason.VERIFY_EMAIL);
    if (isValid) {
      await this.usersService.updateEmailVerified(email, true);
      return true;
    }
    return false;
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Email không tồn tại');
    }

    await this.otpService.sendOtp(email, OtpReason.FORGOT_PASSWORD, 5);
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<boolean> {
    const isValid = await this.otpService.verifyOtp(email, otp, OtpReason.FORGOT_PASSWORD);
    if (isValid) {
      await this.usersService.updatePassword(email, newPassword);
      return true;
    }
    return false;
  }
}
