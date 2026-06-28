import { Global, Module } from '@nestjs/common';
import { SmsService } from './sms/sms.service';
import { EmailService } from './email/email.service';
@Global()
@Module({
  providers: [SmsService, EmailService],
  exports: [SmsService, EmailService],
})
export class InfrastructureModule {}
