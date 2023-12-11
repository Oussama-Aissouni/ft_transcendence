import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenOTPDto, VerifyOTPDto } from './dto/auth.dto';
import { generateSecretRandomBase32 } from './lib/secret-base32';
import * as OTPAuth from 'otpauth';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async fortyTwoLogin(req) {
    let user = await this.prisma.user.findFirst({
      where: {
        userId: String(req.user.userId),
      },
    });

    if (!user) {
      try {
        user = await this.prisma.user.create({
          data: {
            userId: String(req.user.userId),
            username: req.user.username,
            displayName: req.user.displayName,
            email: req.user.email,
            image: req.user.image,
            
          },
        });
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new ForbiddenException('Credentials taken');
          }
        }
        throw error;
      }
    }

    const token = await this.signToken(user.userId, user.email);
    // console.log({
    //   token: token,
    //   message: 'User information from 42',
    //   user: req.user,
    // });
    return token;
  }

  async signToken(userId: string, email: string): Promise<string> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_Secret');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '7d',
      secret: secret,
    });
    return token;
  }


  async user_data(id: any) {
    let user = await this.prisma.user.findFirst({
      where: {
        userId: id.id,
      },
    });
    if (!user) {
      throw new HttpException('User Not found!', HttpStatus.NOT_FOUND);
    }
    return {user};
  }

  async genOTP(id: GenOTPDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        userId: id.id,
      },
    });
    if (!user) {
      throw new HttpException('User Not found!', HttpStatus.NOT_FOUND);
    }

    const otp_secret = generateSecretRandomBase32();
    const totp = new OTPAuth.TOTP({
      issuer: 'ACME',
      label: 'Code2FA',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: otp_secret, // or 'OTPAuth.Secret.fromBase32("NB2W45DFOIZA")'
    });
    const otp_authurl = totp.toString();
    await this.prisma.user.update({
      where: {
        userId: id.id,
      },
      data: {
        otp_secret: otp_secret,
        otp_authurl: otp_authurl,
      },
    });
    // console.log(otp_authurl);
    // console.log(otp_secret);
    return { otp_secret: otp_secret, otp_authurl: otp_authurl };
  }

  async verifyOTP(id: VerifyOTPDto) {
    let user = await this.prisma.user.findFirst({
      where: {
        userId: id.id,
      },
    });
    if (!user) {
      throw new HttpException('User Not found!', HttpStatus.NOT_FOUND);
    }

    const totp = new OTPAuth.TOTP({
      issuer: 'ACME',
      label: 'Code2FA',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: user.otp_secret, // or 'OTPAuth.Secret.fromBase32("NB2W45DFOIZA")'
    });
    const delta = totp.validate({ token: id.token });
    // console.log({ token: id.token });
    // console.log({ delta: delta });
    if (delta === null) {
      throw new HttpException('Invalid Token', HttpStatus.BAD_REQUEST);
    }
    user = await this.prisma.user.update({
      where: {
        userId: id.id,
      },
      data: {
        otp_enabled: true,
        otp_validated: true,
      },
    });
    return { otp_enabled: user.otp_enabled };
  }

  async validateOTP(id) {
    let user = await this.prisma.user.findFirst({
      where: {
        userId: id.id,
      },
    });
    if (!user) {
      throw new HttpException('User Not found!', HttpStatus.NOT_FOUND);
    }

    const totp = new OTPAuth.TOTP({
      issuer: 'ACME',
      label: 'Code2FA',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: user.otp_secret, // or 'OTPAuth.Secret.fromBase32("NB2W45DFOIZA")'
    });
    const delta = totp.validate({ token: id.token });

    if (delta === null) {
      throw new HttpException('Invalid Token', HttpStatus.BAD_REQUEST);
    }
    user = await this.prisma.user.update({
      where: {
        userId: id.id,
      },
      data: {
        otp_validated: true,
      },
    });
    return { otp_validated: user.otp_validated };
  }

  async disableOTP(id) {
    let user = await this.prisma.user.findFirst({
      where: {
        userId: id.id,
      },
    });
    if (!user) {
      throw new HttpException('User Not found!', HttpStatus.NOT_FOUND);
    }

    const totp = new OTPAuth.TOTP({
      issuer: 'ACME',
      label: 'Code2FA',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: user.otp_secret, // or 'OTPAuth.Secret.fromBase32("NB2W45DFOIZA")'
    });
    const delta = totp.validate({ token: id.token });

    if (delta === null) {
      throw new HttpException('Invalid Token', HttpStatus.BAD_REQUEST);
    }
    user = await this.prisma.user.update({
      where: {
        userId: id.id,
      },
      data: {
        otp_enabled: false,
        otp_validated: false,
      },
    });
    return { otp_enabled: user.otp_enabled, otp_validated: user.otp_validated };
  }

  async logOut(id: GenOTPDto) {
    // console.log(id);
    let user = await this.prisma.user.findFirst({
      where: {
        userId: id.id,
      },
    });
    if (!user) {
      throw new HttpException('User Not found!', HttpStatus.NOT_FOUND);
    }
   
    user = await this.prisma.user.update({
      where: {
        userId: id.id,
      },
      data: {
        otp_validated: false,
      },
    });
    return { otp_validated: user.otp_validated };
  }
}
