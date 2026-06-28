import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminCampusService } from './admin-campus.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
@Controller('campuses')
export class CampusController {
  constructor(private readonly campusService: AdminCampusService) {}
  @Get()
  @UseGuards(JwtAuthGuard)
  getAllCampuses() {
    return this.campusService.getAllCampuses();
  }
}
