import { Module } from '@nestjs/common';
import { PvfGateway } from './pvf.gateway';
import { JwtService } from '@nestjs/jwt';
@Module({
  providers: [PvfGateway, JwtService],
})
export class PvfModule {}
