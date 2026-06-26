import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletModule } from './wallet/wallet.module';
import { WebhookModule } from './webhooks/webhook.module';
import { ConfigModule } from '@nestjs/config';
import { RidesModule } from './rides/rides.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule, 
    InfrastructureModule, 
    AuthModule, 
    UsersModule, 
    WalletModule,
    WebhookModule,
    RidesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
