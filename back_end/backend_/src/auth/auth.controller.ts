import {
  Controller,
  Get,
  UseGuards,
  Req,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  UseFilters
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';    
import { Request, Response } from 'express';
import { GenOTPDto, VerifyOTPDto } from './dto/auth.dto';
import { AllExceptionFilter } from 'src/filter/exception.filter';


@UseFilters(new AllExceptionFilter())
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('42')
  @UseGuards(AuthGuard('passport-42'))
  async auth(@Res() res: Response) {}

  @Get('42/redirect')
  @UseGuards(AuthGuard('passport-42'))
  async authRedirect(
    @Res({ passthrough: true }) response: Response,
    @Req()
    req,
  ) {
    const accessToken = await this.authService.fortyTwoLogin(req);
    response.cookie('accessToken', accessToken);
    response.redirect('http://localhost:5173/');
  }

  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @Post('data')
  async userData(@Body() id: any, @Res({ passthrough: true }) res) {
    return await this.authService.user_data(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @Post('gen-otp')
  GenOTP(@Body() id: GenOTPDto, @Req() request: Request) {
    return this.authService.genOTP(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @Post('verify-otp')
  VerifyOTP(@Body() id: VerifyOTPDto) {
    return this.authService.verifyOTP(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @Post('validate-otp')
  ValidateOTP(@Body() id: VerifyOTPDto) {
    return this.authService.validateOTP(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @Post('disable-otp')
  DisableOTP(@Body() id: VerifyOTPDto) {
    return this.authService.disableOTP(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Body() id: GenOTPDto, @Res({ passthrough: true }) res) {
    res.cookie('accessToken', '', { expires: new Date(Date.now()) });
    return this.authService.logOut(id);
  }
}
