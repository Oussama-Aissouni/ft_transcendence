import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request as RequestType } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JWTStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(), // this just for safety in case we don't have a JWT in our cookie, we'll try to look for it in the header
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_Secret'),
    });
  }

  private static extractJWT(req: RequestType): string | null {
    if (
      req.cookies &&
      'accessToken' in req.cookies &&
      req.cookies.accessToken.length > 0
    ) {
      return req.cookies.accessToken;
    }
    return null;
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}

// https://www.youtube.com/watch?v=UQEQHPwQJdg
