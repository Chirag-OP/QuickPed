import { Injectable } from '@nestjs/common';
import { IPaymentGateway } from '../interfaces/payment-gateway.interface';
const Razorpay = require('razorpay');

@Injectable()
export class RazorpayService implements IPaymentGateway {
  private razorpay: any;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'test_key',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret',
    });
  }

  async createOrder(amount: number, receiptId: string): Promise<{ orderId: string; amount: number; currency: string }> {
    const amountInPaise = Math.round(amount * 100);
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
    };
    const order = await this.razorpay.orders.create(options);
    return {
      orderId: order.id,
      amount: amount,
      currency: 'INR',
    };
  }

  async verifyOrder(orderId: string): Promise<{ status: string; amount: number }> {
    const order = await this.razorpay.orders.fetch(orderId);
    return {
      status: order.status, 
      amount: order.amount / 100, 
    };
  }
}
