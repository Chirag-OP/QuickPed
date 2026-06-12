import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@Req() req: any) {
    return this.usersService.getUserProfile(req.user.sub);
  }

  @Put('me/profile')
  updateProfile(@Req() req: any, @Body() dto: { name: string; campusId: string }) {
    return this.usersService.updateUserProfile(req.user.sub, dto.name, dto.campusId);
  }
}
