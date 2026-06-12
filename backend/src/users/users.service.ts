import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, phoneNumber: true, role: true, walletBalance: true, campusId: true, institutionalEmail: true }
    });
  }

  async updateUserProfile(userId: string, name: string, campusId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { name, campusId },
    });
    return { status: 'success', message: 'Profile updated.' };
  }
}
