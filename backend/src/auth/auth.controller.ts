import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SendPhoneOtpDto } from './dto/send-phone-otp.dto';
import { VerifyPhoneOtpDto } from './dto/verify-phone-otp.dto';
import { SendEmailOtpDto } from './dto/send-email-otp.dto';
import { VerifyEmailOtpDto } from './dto/verify-email-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('otp/send')
  async sendPhoneOtp(@Body() dto: SendPhoneOtpDto) {
    return this.authService.sendPhoneOtp(dto.phoneNumber);
  }

  @Post('otp/verify')
  async verifyPhoneOtp(@Body() dto: VerifyPhoneOtpDto) {
    return this.authService.verifyPhoneOtp(dto.phoneNumber, dto.otpCode);
  }

  @UseGuards(JwtAuthGuard)
  @Post('email-otp/send')
  async sendEmailOtp(@Body() dto: SendEmailOtpDto, @Req() req: any) {
    return this.authService.sendEmailOtp(req.user.sub, dto.email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('email-otp/verify')
  async verifyEmailOtp(@Body() dto: VerifyEmailOtpDto, @Req() req: any) {
    return this.authService.verifyEmailOtp(req.user.sub, dto.email, dto.otpCode);
  }
}
