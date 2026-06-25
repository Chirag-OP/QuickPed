import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AdminCampusService } from './admin-campus.service';
import { CreateCampusDto } from './dto/create-campus.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '@prisma/client';
@Controller('admin/campuses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminCampusController {
  constructor(private readonly adminCampusService: AdminCampusService) {}
  @Post()
  @Roles(Role.SUPER_ADMIN)
  createCampus(@Body() createCampusDto: CreateCampusDto) {
    return this.adminCampusService.createCampus(createCampusDto);
  }
}
