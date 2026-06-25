import { Module } from '@nestjs/common';
import { AdminCampusService } from './admin-campus.service';
import { AdminCampusController } from './admin-campus.controller';
import { CampusController } from './campus.controller';
import { PrismaModule } from '../prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  controllers: [AdminCampusController, CampusController],
  providers: [AdminCampusService],
})
export class CampusModule {}
