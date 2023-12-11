import { Module } from '@nestjs/common';
import { MessageModule } from './message/message.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module'; // Authtication module
import { HttpModule } from './http/http.module';
import { ProfileModule } from './profile/profile.module';
import { GateWayModule } from './gateway/gateway.module';
import { MyGateway } from './gateway/gateway';
import { PvfModule } from './pvf/pvf.module';

@Module({
  imports: [
    AuthModule, // auth module added
    PrismaModule,
    MessageModule,
    HttpModule,

    GateWayModule,
    // MyGateway,
    
    ConfigModule.forRoot({ isGlobal: true }),
    ProfileModule,
    PvfModule,
  ],
})
export class AppModule {}