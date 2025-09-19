import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './auth.controller';
import { JwtService } from './jwt.service';
import { UsersModule } from '../users/user.module';
import { jwtConstants } from './auth.constants';
import { RedisModule } from '../common/redis/redis.module';
import { redisConfig } from '../config/redis.config';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
    UsersModule,
    RedisModule.forRoot([
      { name: 'auth', db: redisConfig.dbs.auth },
    ]),
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy, JwtService],
  controllers: [AuthController],
  exports: [AuthService, JwtService],
})
export class AuthModule {}
