import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompleteRideDto } from './dto/complete-ride.dto';
import { RidesService } from './rides.service';

@UseGuards(JwtAuthGuard)
@Controller('rides')
export class RidesController {
  constructor(private ridesService: RidesService) {}

  @Post('complete')
  completeRide(@Req() req: any, @Body() dto: CompleteRideDto) {
    return this.ridesService.completeRide(req.user.sub, dto);
  }

  @Get('history')
  getHistory(@Req() req: any) {
    return this.ridesService.getUserRideHistory(req.user.sub);
  }
}
