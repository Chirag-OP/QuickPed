import { Injectable, Logger } from '@nestjs/common';
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  async sendOtp(phoneNumber: string, otpCode: string): Promise<void> {
    if (process.env.NODE_ENV === 'development' || !process.env.TWILIO_API_KEY) {
      this.logger.log(`[MOCK SMS] OTP is: ${otpCode} (Target: ${phoneNumber})`);
      return;
    }
  }
}
