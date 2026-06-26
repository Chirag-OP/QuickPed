import { Injectable, Inject, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { IPaymentGateway } from './interfaces/payment-gateway.interface';
import { TxStatus, TxType } from '@prisma/client';
import * as crypto from 'crypto';
import { PaymentProcessor } from './services/payment.processor';

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    @Inject('PAYMENT_GATEWAY') private paymentGateway: IPaymentGateway,
    private paymentProcessor: PaymentProcessor,
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

  /**
   * Verify the Razorpay payment signature returned by the client-side handler,
   * then credit the user's wallet if the signature is valid.
   *
   * Razorpay signs: HMAC-SHA256(orderId + "|" + paymentId, KEY_SECRET)
   */
  async verifyAndProcessPayment(
    userId: string,
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
  ) {
    const secret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET || '';
    if (!secret) {
      throw new BadRequestException('Payment gateway not configured');
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new UnauthorizedException('Payment signature verification failed');
    }

    // Signature is valid — credit the wallet
    await this.paymentProcessor.processSuccessfulPayment(razorpay_order_id, 0 /* amount fetched from DB inside processor */);

    // Return updated balance
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true },
    });

    return {
      status: 'success',
      message: 'Payment verified and wallet credited.',
      walletBalance: Number(user?.walletBalance ?? 0),
    };
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

  async getUserTransactions(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

