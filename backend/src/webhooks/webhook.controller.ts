import { Controller, Post, Headers, Body, Req, UnauthorizedException, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';
import { PaymentProcessor } from '../wallet/services/payment.processor';
@Controller('webhooks')
export class WebhookController {
  constructor(private readonly paymentProcessor: PaymentProcessor) {}
  @Post('payment')
  @HttpCode(HttpStatus.OK)
  async handleRazorpayWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
    @Body() body: any,
  ) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_webhook_secret';
            const payloadString = JSON.stringify(body);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');
    if (expectedSignature !== signature) {
      throw new UnauthorizedException('Invalid signature');
    }
        if (body.event === 'payment.captured' || body.event === 'order.paid') {
      const orderId = body.payload.payment.entity.order_id;
      const amountInPaise = body.payload.payment.entity.amount;
      const amountInINR = amountInPaise / 100;
      try {
        await this.paymentProcessor.processSuccessfulPayment(orderId, amountInINR);
      } catch (err) {
        if (err instanceof NotFoundException) {
          return { status: 'already_processed' };
        }
        throw err;
      }
    }
    return { status: 'ok' };
  }
}
