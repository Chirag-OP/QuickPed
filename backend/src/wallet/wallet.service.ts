import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { IPaymentGateway } from './interfaces/payment-gateway.interface';
import { TxStatus, TxType } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    @Inject('PAYMENT_GATEWAY') private paymentGateway: IPaymentGateway,
  ) {}

  async initiateTopUp(userId: string, amount: number) {
    const internalReceiptId = crypto.randomUUID();

    const orderResponse = await this.paymentGateway.createOrder(amount, internalReceiptId);

    await this.prisma.transaction.create({
      data: {
        userId,
        amount,
        type: TxType.CREDIT,
        status: TxStatus.PENDING,
        referenceId: orderResponse.orderId,
      },
    });

    return orderResponse;
  }

  async getUserTransactions(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
