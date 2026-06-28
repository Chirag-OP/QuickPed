import { Injectable, Logger } from '@nestjs/common';
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  async sendOtp(email: string, otpCode: string): Promise<void> {
    if (process.env.NODE_ENV === 'development' || !process.env.SENDGRID_API_KEY) {
      this.logger.log(`[MOCK EMAIL] OTP is: ${otpCode} (Target: ${email})`);
      return;
    }
      }
}
