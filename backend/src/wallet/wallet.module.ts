import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { RazorpayService } from './services/razorpay.service';
import { PaymentProcessor } from './services/payment.processor';
import { ReconciliationCron } from './cron/reconciliation.cron';
@Module({
  imports: [PrismaModule],
  controllers: [WalletController],
  providers: [
    WalletService, 
    PrismaService,
    PaymentProcessor,
    ReconciliationCron,
    {
      provide: 'PAYMENT_GATEWAY',
      useClass: RazorpayService,
    }
  ],
  exports: [PaymentProcessor],
})
export class WalletModule {}
