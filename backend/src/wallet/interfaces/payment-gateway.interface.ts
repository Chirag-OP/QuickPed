export interface IPaymentGateway {
  createOrder(amount: number, receiptId: string): Promise<{ orderId: string; amount: number; currency: string }>;
  verifyOrder(orderId: string): Promise<{ status: string; amount: number }>;
}
