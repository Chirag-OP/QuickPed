import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentProcessor } from '../services/payment.processor';
import type { IPaymentGateway } from '../interfaces/payment-gateway.interface';
import { TxStatus } from '@prisma/client';
@Injectable()
export class ReconciliationCron {
  private readonly logger = new Logger(ReconciliationCron.name);
  constructor(
    private prisma: PrismaService,
    private paymentProcessor: PaymentProcessor,
    @Inject('PAYMENT_GATEWAY') private paymentGateway: IPaymentGateway,
  ) {}
  @Cron('*/15 * * * *')
  async reconcilePendingTransactions() {
    this.logger.log('Starting reconciliation cron for pending transactions...');
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const pendingTransactions = await this.prisma.transaction.findMany({
      where: {
        status: TxStatus.PENDING,
        createdAt: {
          lt: tenMinutesAgo,
        },
      },
    });
    for (const tx of pendingTransactions) {
      if (!tx.referenceId) continue;
      try {
        const orderInfo = await this.paymentGateway.verifyOrder(tx.referenceId);
        if (orderInfo.status === 'paid') {
          this.logger.log(`Order ${tx.referenceId} found paid during reconciliation. Processing...`);
          await this.paymentProcessor.processSuccessfulPayment(tx.referenceId, orderInfo.amount);
        } else if (orderInfo.status === 'created' || orderInfo.status === 'attempted') {
                    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          if (tx.createdAt < oneHourAgo) {
            await this.prisma.transaction.update({
              where: { id: tx.id },
              data: { status: TxStatus.FAILED },
            });
            this.logger.log(`Order ${tx.referenceId} marked FAILED (expired).`);
          }
        }
      } catch (error) {
        this.logger.error(`Failed to reconcile transaction ${tx.id}`, error);
      }
    }
  }
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupIdempotencyRecords() {
    this.logger.log('Running Idempotency cleanup cron...');
    try {
      await this.prisma.$executeRaw`DELETE FROM "IdempotencyRecord" WHERE "createdAt" < NOW() - INTERVAL '24 HOURS'`;
      this.logger.log('Idempotency cleanup completed.');
    } catch (error) {
      this.logger.error('Failed to cleanup idempotency records', error);
    }
  }
}
