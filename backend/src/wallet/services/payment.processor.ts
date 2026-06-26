import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TxStatus } from '@prisma/client';

@Injectable()
export class PaymentProcessor {
  private readonly logger = new Logger(PaymentProcessor.name);

  constructor(private prisma: PrismaService) {}

  async processSuccessfulPayment(orderId: string, amountPaid: number) {
    this.logger.log(`Processing successful payment for order ${orderId} amount ${amountPaid}`);

    
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        referenceId: orderId,
        status: TxStatus.PENDING,
      },
    });

    if (!transaction) {
      this.logger.warn(`Transaction not found or not PENDING for order ${orderId}`);
      throw new NotFoundException('Transaction not found or already processed');
    }

    
    const dbAmount = Number(transaction.amount);
    // When amountPaid is 0, skip the mismatch check — the caller trusts the DB amount.
    if (amountPaid !== 0 && dbAmount !== amountPaid) {
      this.logger.error(`Amount mismatch for order ${orderId}. Expected ${dbAmount}, got ${amountPaid}`);
      throw new BadRequestException('Amount mismatch - Potential fraud detected');
    }

    const creditAmount = amountPaid === 0 ? dbAmount : amountPaid;
    
    await this.prisma.$transaction(async (prismaTx) => {
      
      await prismaTx.$executeRaw`SELECT * FROM "User" WHERE id = ${transaction.userId}::uuid FOR UPDATE`;

      
      await prismaTx.transaction.update({
        where: { id: transaction.id },
        data: { status: TxStatus.SUCCESS },
      });

      
      await prismaTx.user.update({
        where: { id: transaction.userId },
        data: {
          walletBalance: {
            increment: creditAmount,
          },
        },
      });
    });

    this.logger.log(`Successfully processed payment for order ${orderId}`);
  }
}
