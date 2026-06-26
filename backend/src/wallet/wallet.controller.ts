import { Controller, Post, Body, UseInterceptors, UseGuards, Req, Get } from '@nestjs/common';
import { IdempotencyInterceptor } from '../common/interceptors/idempotency.interceptor';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TopUpDto } from './dto/top-up.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}
  
  @UseInterceptors(IdempotencyInterceptor)
  @Post('topup/initiate')
  initiateTopup(@Body() dto: TopUpDto, @Req() req: any) {
    return this.walletService.initiateTopUp(req.user.sub, dto.amount);
  }

  @Post('topup/verify')
  verifyTopup(@Body() dto: VerifyPaymentDto, @Req() req: any) {
    return this.walletService.verifyAndProcessPayment(
      req.user.sub,
      dto.razorpay_order_id,
      dto.razorpay_payment_id,
      dto.razorpay_signature,
    );
  }

  @Post('topup/cancel')
  cancelTopup(@Body('orderId') orderId: string, @Req() req: any) {
    return this.walletService.cancelTopUp(req.user.sub, orderId);
  }

  @Get('transactions')
  getTransactions(@Req() req: any) {
    return this.walletService.getUserTransactions(req.user.sub);
  }
}

