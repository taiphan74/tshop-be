import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { jwtConstants } from './auth.constants';
import { UserRole } from '../users/user.entity';

export interface JwtPayload {
  email: string;
  sub: string;
  role: UserRole;
}

@Injectable()
export class JwtService {
  constructor(private readonly jwt: NestJwtService) {}

  signAccess(payload: JwtPayload) {
    return this.jwt.sign(payload, {
      secret: jwtConstants.secret,
      expiresIn: jwtConstants.expiresIn,
    });
  }

  signRefresh(payload: JwtPayload) {
    return this.jwt.sign(payload, {
      secret: jwtConstants.refreshSecret,
      expiresIn: jwtConstants.refreshExpiresIn,
    });
  }

  verifyAccess(token: string): JwtPayload {
    return this.jwt.verify(token, { secret: jwtConstants.secret });
  }

  verifyRefresh(token: string): JwtPayload {
    return this.jwt.verify(token, { secret: jwtConstants.refreshSecret });
  }
}
