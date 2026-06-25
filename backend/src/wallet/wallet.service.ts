import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { IPaymentGateway } from './interfaces/payment-gateway.interface';
import { TxStatus, TxType } from '@prisma/client';
import * as crypto from 'crypto';
import { PaymentProcessor } from './services/payment.processor';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    @Inject('PAYMENT_GATEWAY') private paymentGateway: IPaymentGateway,
    private paymentProcessor: PaymentProcessor,
    private configService: ConfigService,
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
  async cancelTopUp(userId: string, orderId: string) {
    return this.prisma.transaction.updateMany({
      where: { 
        userId, 
        referenceId: orderId,
        status: TxStatus.PENDING 
      },
      data: {
        status: TxStatus.FAILED,
      },
    });
  }
  async verifyTopUp(userId: string, orderId: string, paymentId: string, signature: string) {
    const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET') || 'test_secret';
        const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(orderId + '|' + paymentId)
      .digest('hex');
    if (expectedSignature !== signature) {
      throw new BadRequestException('Invalid signature');
    }
    const transaction = await this.prisma.transaction.findFirst({
      where: { referenceId: orderId, userId },
    });
    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }
    if (transaction.status === TxStatus.SUCCESS) {
      return { status: 'already_processed' };
    }
    await this.paymentProcessor.processSuccessfulPayment(orderId, Number(transaction.amount));
    return { status: 'success' };
  }
  async getUserTransactions(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
