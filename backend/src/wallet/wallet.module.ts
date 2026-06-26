import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RazorpayService } from './services/razorpay.service';
import { PaymentProcessor } from './services/payment.processor';
import { ReconciliationCron } from './cron/reconciliation.cron';

@Module({
  imports: [PrismaModule],
  controllers: [WalletController],
  providers: [
    WalletService, 
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
