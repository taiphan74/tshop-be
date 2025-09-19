import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { jwtConstants } from './auth.constants';

@Injectable()
export class JwtService {
  constructor(private readonly jwt: NestJwtService) {}

  signAccess(payload: any) {
    return this.jwt.sign(payload, {
      secret: jwtConstants.secret,
      expiresIn: jwtConstants.expiresIn,
    });
  }

  signRefresh(payload: any) {
    return this.jwt.sign(payload, {
      secret: jwtConstants.refreshSecret,
      expiresIn: jwtConstants.refreshExpiresIn,
    });
  }

  verifyAccess(token: string) {
    return this.jwt.verify(token, { secret: jwtConstants.secret });
  }

  verifyRefresh(token: string) {
    return this.jwt.verify(token, { secret: jwtConstants.refreshSecret });
  }
}
