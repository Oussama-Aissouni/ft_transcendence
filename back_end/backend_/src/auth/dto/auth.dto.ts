import { IsNotEmpty } from 'class-validator';

export class GenOTPDto {
  @IsNotEmpty()
  id: string;
}

export class VerifyOTPDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  token: string;
}
