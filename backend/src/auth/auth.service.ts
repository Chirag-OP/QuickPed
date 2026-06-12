import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from '../infrastructure/sms/sms.service';
import { EmailService } from '../infrastructure/email/email.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private smsService: SmsService,
    private emailService: EmailService,
    private jwtService: JwtService,
  ) {}

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private normalizePhone(phone: string): string {
    let cleaned = phone.replace(/[\s-]/g, '');
    if (!cleaned.startsWith('+')) {
      if (cleaned.length === 10) {
        cleaned = '+91' + cleaned;
      } else {
        cleaned = '+' + cleaned;
      }
    }
    return cleaned;
  }

  async sendPhoneOtp(phoneNumber: string) {
    const normalizedPhone = this.normalizePhone(phoneNumber);
    
    const tracker = await this.prisma.otpTracker.findUnique({
      where: { identifier: normalizedPhone },
    });

    if (tracker && tracker.lastRequestAt) {
      const diff = (new Date().getTime() - tracker.lastRequestAt.getTime()) / 1000;
      if (diff < 60) {
        throw new HttpException({ error: 'Please wait 60 seconds before requesting a new OTP.' }, HttpStatus.TOO_MANY_REQUESTS);
      }
    }

    const otpCode = this.generateOtp();
    await this.prisma.otpTracker.upsert({
      where: { identifier: normalizedPhone },
      update: {
        otpCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), 
        lastRequestAt: new Date(),
        attempts: 0,
      },
      create: {
        identifier: normalizedPhone,
        otpCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // Fire and forget, don't block response
    this.smsService.sendOtp(normalizedPhone, otpCode).catch(e => console.error('Failed to dispatch SMS', e));
    return { status: 'success', message: 'OTP sent.' };
  }

  async verifyPhoneOtp(phoneNumber: string, otpCode: string) {
    const normalizedPhone = this.normalizePhone(phoneNumber);
    
    const tracker = await this.prisma.otpTracker.findUnique({
      where: { identifier: normalizedPhone },
    });

    if (!tracker || tracker.otpCode !== otpCode || tracker.expiresAt < new Date()) {
      if (tracker) {
        await this.prisma.otpTracker.update({
          where: { identifier: normalizedPhone },
          data: { attempts: { increment: 1 } },
        });
        if (tracker.attempts >= 2) {
           await this.prisma.otpTracker.update({
             where: { identifier: normalizedPhone },
             data: { otpCode: 'INVALIDATED' },
           });
        }
      }
      throw new HttpException('Invalid or expired OTP', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.prisma.user.upsert({
      where: { phoneNumber: normalizedPhone },
      update: {},
      create: { phoneNumber: normalizedPhone, role: 'GUEST_RIDER' },
    });

    await this.prisma.otpTracker.delete({ where: { identifier: normalizedPhone } });

    const payload = { sub: user.id, role: user.role, campusId: user.campusId };
    return {
      status: 'success',
      token: this.jwtService.sign(payload),
    };
  }

  async sendEmailOtp(userId: string, email: string) {
    const otpCode = this.generateOtp();
    await this.prisma.otpTracker.upsert({
      where: { identifier: email },
      update: {
        otpCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        lastRequestAt: new Date(),
        attempts: 0,
      },
      create: {
        identifier: email,
        otpCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await this.emailService.sendOtp(email, otpCode);
    return { status: 'success', message: 'Email OTP sent.' };
  }

  async verifyEmailOtp(userId: string, email: string, otpCode: string) {
    const tracker = await this.prisma.otpTracker.findUnique({
      where: { identifier: email },
    });

    if (!tracker || tracker.otpCode !== otpCode || tracker.expiresAt < new Date()) {
      throw new HttpException('Invalid or expired OTP', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { institutionalEmail: email, role: 'VERIFIED_RIDER' },
    });

    await this.prisma.otpTracker.delete({ where: { identifier: email } });

    const payload = { sub: user.id, role: user.role, campusId: user.campusId };
    return {
      status: 'success',
      token: this.jwtService.sign(payload),
    };
  }
}
