import { Controller, Post, Body, UseInterceptors, UseGuards, Req, Get } from '@nestjs/common';
import { IdempotencyInterceptor } from '../common/interceptors/idempotency.interceptor';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TopUpDto } from './dto/top-up.dto';

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}
  
  @UseInterceptors(IdempotencyInterceptor)
  @Post('topup/initiate')
  initiateTopup(@Body() dto: TopUpDto, @Req() req: any) {
    return this.walletService.initiateTopUp(req.user.sub, dto.amount);
  }

  @Get('transactions')
  getTransactions(@Req() req: any) {
    return this.walletService.getUserTransactions(req.user.sub);
  }
}
