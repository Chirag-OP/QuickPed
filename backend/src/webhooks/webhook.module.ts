import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WalletModule } from '../wallet/wallet.module';
@Module({
  imports: [WalletModule],
  controllers: [WebhookController],
})
export class WebhookModule {}
