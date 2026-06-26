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
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [pendingIntent, setPendingIntent] = useState<{orderId: string, amount: string, idempotencyKey: string} | null>(null);
  const [activeIdempotencyKey, setActiveIdempotencyKey] = useState<string>('');

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    const initData = async () => {
      const initialBalance = await fetchWalletData();
      
      const savedIntent = localStorage.getItem('qp_payment_intent');
      if (savedIntent) {
        try {
          const intent = JSON.parse(savedIntent);
          const now = Date.now();
          const intentTime = intent.timestamp || 0;
          
          if (now - intentTime < 15 * 60 * 1000) { // 15 mins
             setPendingIntent(intent);
             setShowCancelModal(true);
          } else {
             localStorage.removeItem('qp_payment_intent');
             setActiveIdempotencyKey(uuidv4());
          }
        } catch(e) {
          localStorage.removeItem('qp_payment_intent');
          setActiveIdempotencyKey(uuidv4());
        }
      } else {
        setActiveIdempotencyKey(uuidv4());
      }
    };
    initData();

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
      const fetchedBalance = Number(userRes.data.walletBalance) || 0;
      setBalance(fetchedBalance);
      setTransactions(txRes.data || []);
      return fetchedBalance;
    } catch (err) {
      console.error('Failed to fetch wallet data', err);
      return 0;
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
          localStorage.removeItem('qp_payment_intent');
          setBalance(currentBalance);
          setPaymentStatusMsg('');
          setIsProcessingPayment(false);
          setShowAddMoney(false);
          setAmount('');
          setActiveIdempotencyKey(uuidv4());
          
          const txRes = await api.get('/wallet/transactions');
          setTransactions(txRes.data || []);
          
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        } else if (attempts >= maxAttempts) {
          localStorage.removeItem('qp_payment_intent');
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

  const openRazorpay = (orderId: string, amt: string, idempotencyKey: string) => {
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

    const intent = { orderId, amount: amt, idempotencyKey, timestamp: Date.now() };
    localStorage.setItem('qp_payment_intent', JSON.stringify(intent));

    const options = {
      key: keyId,
      amount: Number(amt) * 100,
      currency: 'INR',
      name: 'QuickPed',
      description: 'Wallet Top-up',
      order_id: orderId,
      handler: async function (response: any) {
        setIsProcessingPayment(true);
        setPaymentStatusMsg('Verifying payment...');
        try {
          const verifyRes = await api.post('/wallet/topup/verify', {
            razorpay_order_id: response.razorpay_order_id || orderId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          localStorage.removeItem('qp_payment_intent');
          setBalance(Number(verifyRes.data.walletBalance));
          setPaymentStatusMsg('');
          setIsProcessingPayment(false);
          setShowAddMoney(false);
          setAmount('');
          setActiveIdempotencyKey(uuidv4());

          const txRes = await api.get('/wallet/transactions');
          setTransactions(txRes.data || []);
        } catch (err) {
          console.error('Verification error', err);
          startPolling(balance);
        }
      },
      modal: {
        ondismiss: function() {
          setPendingIntent({ orderId, amount: amt, idempotencyKey });
          setShowCancelModal(true);
        }
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
  };

  const handleAddMoney = async () => {
    if (!amount || isProcessingPayment) return;

    setIsProcessingPayment(true);

    try {
      let key = activeIdempotencyKey;
      if (!key) {
        key = uuidv4();
        setActiveIdempotencyKey(key);
      }
      
      const response = await api.post('/wallet/topup/initiate', 
        { amount: Number(amount) },
        { headers: { 'Idempotency-Key': key } }
      );

      openRazorpay(response.data.orderId, amount, key);
    } catch (err) {
      console.error('Failed to initiate top-up', err);
      setIsProcessingPayment(false);
    }
  };

  const resumePayment = () => {
    if (pendingIntent) {
      setShowCancelModal(false);
      openRazorpay(pendingIntent.orderId, pendingIntent.amount, pendingIntent.idempotencyKey);
    }
  };

  const cancelPayment = async () => {
    if (pendingIntent) {
      try {
        await api.post('/wallet/topup/cancel', { orderId: pendingIntent.orderId });
        const txRes = await api.get('/wallet/transactions');
        setTransactions(txRes.data || []);
      } catch (err) {
        console.error('Failed to cancel transaction on backend', err);
      }
    }
    
    localStorage.removeItem('qp_payment_intent');
    setPendingIntent(null);
    setShowCancelModal(false);
    setAmount('');
    setActiveIdempotencyKey(uuidv4());
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
      {showAddMoney && !showCancelModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-40"
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

      {/* Cancellation Modal */}
      {showCancelModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="w-full max-w-sm bg-card rounded-3xl p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Cancel Transaction?</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              You're almost there! Resume to complete your wallet top-up securely.
            </p>
            
            <div className="flex flex-col gap-3">
              <Button size="lg" className="w-full" onClick={resumePayment}>
                Resume Payment
              </Button>
              <Button variant="ghost" size="lg" className="w-full text-danger hover:text-danger hover:bg-danger/10" onClick={cancelPayment}>
                Cancel Payment
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
