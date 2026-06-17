import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Building,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { formatCurrency, formatDate } from '../lib/utils';
import { NotificationBell } from '../components/notification-bell';
import { v4 as uuidv4 } from 'uuid';
import api from '../../api/axios';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface WalletScreenProps {
  onBack: () => void;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({ onBack }) => {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatusMsg, setPaymentStatusMsg] = useState('');

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    fetchWalletData();

    return () => {
      document.body.removeChild(script);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const fetchWalletData = async () => {
    try {
      const [userRes, txRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/wallet/transactions')
      ]);
      setBalance(Number(userRes.data.walletBalance) || 0);
      setTransactions(txRes.data || []);
    } catch (err) {
      console.error('Failed to fetch wallet data', err);
    }
  };

  const startPolling = (oldBalance: number) => {
    let attempts = 0;
    const maxAttempts = 15;

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    setPaymentStatusMsg('Verifying payment...');
    setIsProcessingPayment(true);

    pollingIntervalRef.current = setInterval(async () => {
      attempts++;
      try {
        const userRes = await api.get('/users/me');
        const currentBalance = Number(userRes.data.walletBalance) || 0;

        if (currentBalance > oldBalance) {
          setBalance(currentBalance);
          setPaymentStatusMsg('');
          setIsProcessingPayment(false);
          setShowAddMoney(false);
          setAmount('');
          
          const txRes = await api.get('/wallet/transactions');
          setTransactions(txRes.data || []);
          
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        } else if (attempts >= maxAttempts) {
          setPaymentStatusMsg('Payment Pending: Waiting for bank confirmation');
          setTimeout(() => {
            setIsProcessingPayment(false);
            setPaymentStatusMsg('');
            setShowAddMoney(false);
            setAmount('');
          }, 4000);
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        }
      } catch (err) {
        console.error('Polling error', err);
      }
    }, 2000);
  };

  const handleAddMoney = async () => {
    if (!amount || isProcessingPayment) return;

    try {
      const idempotencyKey = uuidv4();
      
      const response = await api.post('/wallet/topup/initiate', 
        { amount: Number(amount) },
        { headers: { 'Idempotency-Key': idempotencyKey } }
      );

      const orderId = response.data.orderId;
      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

      const options = {
        key: keyId,
        amount: Number(amount) * 100,
        currency: 'INR',
        name: 'QuickPed',
        description: 'Wallet Top-up',
        order_id: orderId,
        handler: function () {
          startPolling(balance);
        },
        prefill: {
          name: 'QuickPed User',
        },
        theme: {
          color: '#3399cc'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
        console.error('Payment failed');
      });
      rzp.open();
    } catch (err) {
      console.error('Failed to initiate top-up', err);
    }
  };

  const quickAmounts = [100, 200, 500, 1000];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header Profile Section */}
      <div className="bg-gradient-to-r from-primary to-secondary p-6 pb-12 rounded-b-3xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button onClick={onBack} className="text-white">
            ← Back
          </button>
          <NotificationBell className="border-0 bg-white/20 text-white shadow-none hover:bg-white/30" />
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Wallet size={32} />
                </div>
                <div>
                  <p className="text-sm text-white/80">Available Balance</p>
                  <p className="text-4xl font-bold">{formatCurrency(balance)}</p>
                </div>
              </div>
              <Button
                onClick={() => setShowAddMoney(true)}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                <Plus size={20} className="mr-2" />
                Add Money
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="px-6 -mt-8">
        {/* Transaction History */}
        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No transactions yet.</p>
              ) : (
                transactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          tx.type === 'CREDIT'
                            ? 'bg-success/10 text-success'
                            : 'bg-danger/10 text-danger'
                        }`}
                      >
                        {tx.type === 'CREDIT' ? (
                          <ArrowDownRight size={20} />
                        ) : (
                          <ArrowUpRight size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {tx.type === 'CREDIT' ? 'Wallet Recharge' : 'Ride Deduction'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(tx.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          tx.type === 'CREDIT' ? 'text-success' : 'text-danger'
                        }`}
                      >
                        {tx.type === 'CREDIT' ? '+' : '-'}
                        {formatCurrency(Number(tx.amount))}
                      </p>
                      <Badge variant={tx.status === 'SUCCESS' ? 'success' : tx.status === 'PENDING' ? 'secondary' : 'danger'} className="text-xs">
                        {tx.status.toLowerCase()}
                      </Badge>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Money Modal */}
      {showAddMoney && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50"
          onClick={() => !isProcessingPayment && setShowAddMoney(false)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6" />

            <h2 className="text-2xl font-bold mb-6">Add Money to Wallet</h2>

            {/* Quick Amounts */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-3">Quick Select</p>
              <div className="grid grid-cols-4 gap-3">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt.toString())}
                    disabled={isProcessingPayment}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      amount === amt.toString()
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    } ${isProcessingPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <p className="font-bold">₹{amt}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Enter Amount</p>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isProcessingPayment}
                className="h-14 text-lg"
              />
            </div>

            {/* Payment Methods */}
            <div className="space-y-3 mb-6">
              <Button variant="outline" size="lg" className="w-full justify-start" disabled={isProcessingPayment}>
                <Building className="mr-3" size={20} />
                UPI
              </Button>
              <Button variant="outline" size="lg" className="w-full justify-start" disabled={isProcessingPayment}>
                <CreditCard className="mr-3" size={20} />
                Card
              </Button>
            </div>

            {paymentStatusMsg && (
              <div className="mb-4 text-center text-sm font-medium text-primary">
                {paymentStatusMsg}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => setShowAddMoney(false)}
                variant="ghost"
                size="lg"
                className="flex-1"
                disabled={isProcessingPayment}
              >
                Cancel
              </Button>
              <Button 
                size="lg" 
                className="flex-1" 
                disabled={!amount || isProcessingPayment}
                onClick={handleAddMoney}
              >
                {isProcessingPayment ? 'Processing...' : `Add ${amount ? formatCurrency(Number(amount)) : ''}`}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
