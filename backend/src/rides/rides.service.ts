import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TxStatus, TxType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CompleteRideDto } from './dto/complete-ride.dto';

type RideHistoryItem = {
  id: string;
  user: string;
  userPhone?: string;
  vehicleId: string;
  startDock: string;
  endDock: string;
  fare: number;
  duration: number;
  distance: number;
  bikeType?: string | null;
  status: 'active' | 'completed';
  completedAt: string;
  startedAt?: string;
};

const mapRide = (ride: any): RideHistoryItem => ({
  id: ride.id,
  user: ride.userName?.trim() || ride.name?.trim() || 'Guest User',
  userPhone: ride.userPhone || ride.phoneNumber || undefined,
  vehicleId: ride.vehicleId,
  startDock: ride.startDock,
  endDock: ride.endDock,
  fare: Number(ride.fare),
  duration: ride.duration,
  distance: Number(ride.distance),
  bikeType: ride.bikeType,
  status: String(ride.status).toUpperCase() === 'COMPLETED' ? 'completed' : 'active',
  completedAt: ride.completedAt instanceof Date ? ride.completedAt.toISOString() : String(ride.completedAt),
  startedAt: ride.startedAt instanceof Date ? ride.startedAt.toISOString() : String(ride.startedAt),
});

@Injectable()
export class RidesService {
  constructor(private prisma: PrismaService) {}

  async completeRide(userId: string, dto: CompleteRideDto) {
    const fare = Number(dto.fare);
    const duration = Math.max(1, Math.round(Number(dto.duration)));
    const distance = Number(dto.distance);

    if (!Number.isFinite(fare) || fare < 0) {
      throw new BadRequestException('Invalid fare.');
    }

    if (!Number.isFinite(distance) || distance < 0) {
      throw new BadRequestException('Invalid distance.');
    }

    const startedAt = dto.startedAt ? new Date(dto.startedAt) : new Date(Date.now() - duration * 1000);
    if (Number.isNaN(startedAt.getTime())) {
      throw new BadRequestException('Invalid start time.');
    }

    return this.prisma.$transaction(async (prismaTx) => {
      await prismaTx.$executeRaw`SELECT * FROM "User" WHERE id = ${userId}::uuid FOR UPDATE`;

      const user = await prismaTx.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, phoneNumber: true, walletBalance: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const completedAt = new Date();
      const nextBalance = Math.max(0, Number(user.walletBalance) - fare);

      const rideRows = await prismaTx.$queryRaw<any[]>`
        INSERT INTO "Ride" (
          "userId",
          "vehicleId",
          "startDock",
          "endDock",
          "fare",
          "duration",
          "distance",
          "bikeType",
          "status",
          "startedAt",
          "completedAt"
        ) VALUES (
          ${userId}::uuid,
          ${dto.vehicleId},
          ${dto.startDock},
          ${dto.endDock},
          ${fare},
          ${duration},
          ${distance},
          ${dto.bikeType ?? null},
          'COMPLETED',
          ${startedAt},
          ${completedAt}
        )
        RETURNING
          "id",
          "vehicleId",
          "startDock",
          "endDock",
          "fare",
          "duration",
          "distance",
          "bikeType",
          "status",
          "startedAt",
          "completedAt";
      `;

      const ride = rideRows[0];

      await prismaTx.transaction.create({
        data: {
          userId,
          amount: fare,
          type: TxType.DEBIT,
          status: TxStatus.SUCCESS,
          referenceId: ride.id,
        },
      });

      await prismaTx.user.update({
        where: { id: userId },
        data: { walletBalance: nextBalance },
      });

      return {
        ride: mapRide({
          ...ride,
          userName: user.name,
          userPhone: user.phoneNumber,
        }),
        walletBalance: nextBalance,
      };
    });
  }

  async getUserRideHistory(userId: string) {
    const rides = await this.prisma.$queryRaw<any[]>`
      SELECT
        r."id",
        r."vehicleId",
        r."startDock",
        r."endDock",
        r."fare",
        r."duration",
        r."distance",
        r."bikeType",
        r."status",
        r."startedAt",
        r."completedAt",
        u."name" AS "userName",
        u."phoneNumber" AS "userPhone"
      FROM "Ride" r
      LEFT JOIN "User" u ON u."id" = r."userId"
      WHERE r."userId" = ${userId}::uuid
      ORDER BY r."completedAt" DESC
    `;

    return rides.map(mapRide);
  }
}
