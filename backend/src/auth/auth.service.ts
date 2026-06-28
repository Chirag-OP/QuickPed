import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from '../infrastructure/sms/sms.service';
import { EmailService } from '../infrastructure/email/email.service';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { parsePhoneNumberWithError } from 'libphonenumber-js';
import { Role } from '@prisma/client';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private smsService: SmsService,
    private emailService: EmailService,
    private jwtService: JwtService,
  ) {}
  private generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }
  private hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }
  private normalizePhone(phone: string): string {
    try {
      const phoneNumber = parsePhoneNumberWithError(phone, 'IN');
      return phoneNumber.format('E.164');
    } catch (error) {
      throw new HttpException('Invalid phone number format', HttpStatus.BAD_REQUEST);
    }
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
    const hashedOtp = this.hashOtp(otpCode);
    await this.prisma.otpTracker.upsert({
      where: { identifier: normalizedPhone },
      update: {
        otpCode: hashedOtp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), 
        lastRequestAt: new Date(),
        attempts: 0,
      },
      create: {
        identifier: normalizedPhone,
        otpCode: hashedOtp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });
        this.smsService.sendOtp(normalizedPhone, otpCode).catch(e => console.error('Failed to dispatch SMS', e));
    return { status: 'success', message: 'OTP sent.' };
  }
  async verifyPhoneOtp(phoneNumber: string, otpCode: string) {
    const normalizedPhone = this.normalizePhone(phoneNumber);
        const tracker = await this.prisma.otpTracker.findUnique({
      where: { identifier: normalizedPhone },
    });
    if (!tracker) {
      throw new HttpException('Invalid or expired OTP', HttpStatus.UNAUTHORIZED);
    }
    if (tracker.attempts >= 3) {
      throw new HttpException('Too many failed attempts. Please request a new OTP.', HttpStatus.FORBIDDEN);
    }
    const hashedInput = this.hashOtp(otpCode);
    if (tracker.otpCode !== hashedInput || tracker.expiresAt < new Date()) {
      await this.prisma.otpTracker.update({
        where: { identifier: normalizedPhone },
        data: { attempts: { increment: 1 } },
      });
      throw new HttpException('Invalid or expired OTP', HttpStatus.UNAUTHORIZED);
    }
    const user = await this.prisma.user.upsert({
      where: { phoneNumber: normalizedPhone },
      update: {},
      create: { phoneNumber: normalizedPhone, role: Role.GUEST_RIDER },
    });
    await this.prisma.otpTracker.delete({ where: { identifier: normalizedPhone } });
    const payload = { sub: user.id, role: user.role, campusId: user.campusId };
    return {
      status: 'success',
      token: this.jwtService.sign(payload),
    };
  }
  async sendEmailOtp(userId: string, email: string) {
    const tracker = await this.prisma.otpTracker.findUnique({
      where: { identifier: email },
    });
    if (tracker && tracker.lastRequestAt) {
      const diff = (new Date().getTime() - tracker.lastRequestAt.getTime()) / 1000;
      if (diff < 60) {
        throw new HttpException({ error: 'Please wait 60 seconds before requesting a new OTP.' }, HttpStatus.TOO_MANY_REQUESTS);
      }
    }
    const otpCode = this.generateOtp();
    const hashedOtp = this.hashOtp(otpCode);
    await this.prisma.otpTracker.upsert({
      where: { identifier: email },
      update: {
        otpCode: hashedOtp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        lastRequestAt: new Date(),
        attempts: 0,
      },
      create: {
        identifier: email,
        otpCode: hashedOtp,
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
    if (!tracker) {
      throw new HttpException('Invalid or expired OTP', HttpStatus.UNAUTHORIZED);
    }
    if (tracker.attempts >= 3) {
      throw new HttpException('Too many failed attempts. Please request a new OTP.', HttpStatus.FORBIDDEN);
    }
    const hashedInput = this.hashOtp(otpCode);
    if (tracker.otpCode !== hashedInput || tracker.expiresAt < new Date()) {
      await this.prisma.otpTracker.update({
        where: { identifier: email },
        data: { attempts: { increment: 1 } },
      });
      throw new HttpException('Invalid or expired OTP', HttpStatus.UNAUTHORIZED);
    }
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { institutionalEmail: email, role: Role.VERIFIED_RIDER },
    });
    await this.prisma.otpTracker.delete({ where: { identifier: email } });
    const payload = { sub: user.id, role: user.role, campusId: user.campusId };
    return {
      status: 'success',
      token: this.jwtService.sign(payload),
    };
  }
}
