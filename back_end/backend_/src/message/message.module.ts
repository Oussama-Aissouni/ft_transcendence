import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [MessageGateway, MessageService, JwtService],
})

export class MessageModule {}