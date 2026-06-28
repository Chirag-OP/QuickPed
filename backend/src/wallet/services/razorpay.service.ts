import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPaymentGateway } from '../interfaces/payment-gateway.interface';
const Razorpay = require('razorpay');
@Injectable()
export class RazorpayService implements IPaymentGateway {
  private razorpay: any;
  constructor(private configService: ConfigService) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID') || 'test_key',
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET') || 'test_secret',
    });
  }
  async createOrder(amount: number, receiptId: string): Promise<{ orderId: string; amount: number; currency: string }> {
    const amountInPaise = Math.round(amount * 100);
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
    };
        try {
      const order = await this.razorpay.orders.create(options);
      return {
        orderId: order.id,
        amount: amount,
        currency: 'INR',
      };
    } catch (error: any) {
      console.error('Razorpay SDK Error during createOrder:', error);
      if (error.response) {
        console.error('Razorpay Error Response Data:', error.response.data);
      }
      throw new Error('Failed to create Razorpay order');
    }
  }
  async verifyOrder(orderId: string): Promise<{ status: string; amount: number }> {
    const order = await this.razorpay.orders.fetch(orderId);
    return {
      status: order.status, 
      amount: order.amount / 100, 
    };
  }
}
