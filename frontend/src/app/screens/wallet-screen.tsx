import React, { useState } from 'react';
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

interface WalletScreenProps {
  onBack: () => void;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({ onBack }) => {
  const [balance] = useState(250);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState('');

  const transactions = [
    {
      id: 1,
      type: 'debit' as const,
      description: 'Ride #2847',
      amount: 15,
      date: new Date('2026-06-02T10:30:00'),
      status: 'completed'
    },
    {
      id: 2,
      type: 'credit' as const,
      description: 'Wallet Recharge',
      amount: 200,
      date: new Date('2026-06-02T09:00:00'),
      status: 'completed'
    },
    {
      id: 3,
      type: 'debit' as const,
      description: 'Ride #2846',
      amount: 12,
      date: new Date('2026-06-01T18:15:00'),
      status: 'completed'
    },
    {
      id: 4,
      type: 'debit' as const,
      description: 'Ride #2845',
      amount: 18,
      date: new Date('2026-06-01T14:20:00'),
      status: 'completed'
    },
    {
      id: 5,
      type: 'credit' as const,
      description: 'Welcome Bonus',
      amount: 50,
      date: new Date('2026-06-01T10:00:00'),
      status: 'completed'
    },
  ];

  const quickAmounts = [100, 200, 500, 1000];

  return (
    <div className="min-h-screen bg-background pb-24">
      {}
      <div className="bg-gradient-to-r from-primary to-secondary p-6 pb-12 rounded-b-3xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button onClick={onBack} className="text-white">
            ← Back
          </button>
          <NotificationBell className="border-0 bg-white/20 text-white shadow-none hover:bg-white/30" />
        </div>

        {}
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
        {}
        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((tx, index) => (
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
                        tx.type === 'credit'
                          ? 'bg-success/10 text-success'
                          : 'bg-danger/10 text-danger'
                      }`}
                    >
                      {tx.type === 'credit' ? (
                        <ArrowDownRight size={20} />
                      ) : (
                        <ArrowUpRight size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(tx.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        tx.type === 'credit' ? 'text-success' : 'text-danger'
                      }`}
                    >
                      {tx.type === 'credit' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </p>
                    <Badge variant="success" className="text-xs">
                      {tx.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {}
      {showAddMoney && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50"
          onClick={() => setShowAddMoney(false)}
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

            {}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-3">Quick Select</p>
              <div className="grid grid-cols-4 gap-3">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt.toString())}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      amount === amt.toString()
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <p className="font-bold">₹{amt}</p>
                  </button>
                ))}
              </div>
            </div>

            {}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Enter Amount</p>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-14 text-lg"
              />
            </div>

            {}
            <div className="space-y-3 mb-6">
              <Button variant="outline" size="lg" className="w-full justify-start">
                <Building className="mr-3" size={20} />
                UPI
              </Button>
              <Button variant="outline" size="lg" className="w-full justify-start">
                <CreditCard className="mr-3" size={20} />
                Card
              </Button>
            </div>

            {}
            <div className="flex gap-3">
              <Button
                onClick={() => setShowAddMoney(false)}
                variant="ghost"
                size="lg"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button size="lg" className="flex-1" disabled={!amount}>
                Add {amount && formatCurrency(Number(amount))}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
