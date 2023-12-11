import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-42';

@Injectable()
export class Strategy42 extends PassportStrategy(Strategy, 'passport-42') {
  constructor(private config: ConfigService) {
    super({
      clientID: config.get('CLIENT_ID'),
      clientSecret: config.get('CLIENT_SECRET'),
      callbackURL: 'http://localhost:3003/auth/42/redirect',
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, login, usual_full_name, email, image } = profile._json;
    const user = {
      userId: id,
      username: login,
      displayName: usual_full_name,
      email: email,
      image: image.link,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}
