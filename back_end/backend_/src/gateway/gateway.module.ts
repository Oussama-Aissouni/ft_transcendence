import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MyGateway } from './gateway';


@Module({
  providers: [JwtService,MyGateway],
})    
export class GateWayModule {}
