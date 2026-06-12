import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('otp/send')
  async sendPhoneOtp(@Body('phoneNumber') phoneNumber: string) {
    return this.authService.sendPhoneOtp(phoneNumber);
  }

  @Post('otp/verify')
  async verifyPhoneOtp(@Body() dto: { phoneNumber: string; otpCode: string }) {
    return this.authService.verifyPhoneOtp(dto.phoneNumber, dto.otpCode);
  }

  @UseGuards(JwtAuthGuard)
  @Post('email-otp/send')
  async sendEmailOtp(@Body('email') email: string, @Req() req: any) {
    return this.authService.sendEmailOtp(req.user.sub, email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('email-otp/verify')
  async verifyEmailOtp(@Body() dto: { email: string; otpCode: string }, @Req() req: any) {
    return this.authService.verifyEmailOtp(req.user.sub, dto.email, dto.otpCode);
  }
}
