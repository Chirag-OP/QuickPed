import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampusDto } from './dto/create-campus.dto';
@Injectable()
export class AdminCampusService {
  constructor(private prisma: PrismaService) {}
  async createCampus(dto: CreateCampusDto) {
    try {
      const newCampus = await this.prisma.$transaction(async (tx) => {
        const campus = await tx.campus.create({
          data: {
            name: dto.name,
            config: {},
          },
        });
        if (dto.fareConfigurations && dto.fareConfigurations.length > 0) {
          await tx.fareConfiguration.createMany({
            data: dto.fareConfigurations.map(fc => ({
              campusId: campus.id,
              vehicleType: fc.vehicleType,
              userRole: fc.userRole,
              baseFare: fc.baseFare,
              baseDurationMinutes: fc.baseDurationMinutes,
              perMinuteRate: fc.perMinuteRate,
            })),
          });
        }
        return tx.campus.findUnique({
          where: { id: campus.id },
          include: { fareConfigurations: true },
        });
      });
      return newCampus;
    } catch (error) {
      throw new BadRequestException('Failed to create campus and fare configurations: ' + error.message);
    }
  }
  async getAllCampuses() {
    return this.prisma.campus.findMany({
      include: {
        docks: true,
        vehicles: true,
        fareConfigurations: true,
      }
    });
  }
}
