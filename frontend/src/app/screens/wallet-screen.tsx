import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  History,
  IndianRupee,
  Loader2,
  Plus,
  Printer,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { formatCurrency } from '../lib/utils';
import { NotificationBell } from '../components/notification-bell';
import quickPedLogo from '../../assets/logo.jpeg';

interface WalletScreenProps {
  onBack: () => void;
}

type TransactionType = 'CREDIT' | 'DEBIT';
type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';
type WalletFlow = 'wallet' | 'processing' | 'success';

type WalletTransaction = {
  id: string;
  amount: number | string;
  type: TransactionType;
  status: TransactionStatus;
  createdAt: string;
  referenceId?: string | null;
};

type PaymentSummary = {
  amount: number;
  updatedBalance: number;
  transactionId: string;
  referenceNumber: string;
  createdAt: string;
  paymentMethod: string;
  status: TransactionStatus;
  walletName: string;
};

const TOP_UP_AMOUNTS = [100, 200, 500, 1000];
const PROCESSING_DURATION_MS = 2400;

const toAmount = (value: number | string | null | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  }).format(date);
};

const getDatePart = (timestamp: string) =>
  new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(timestamp));

const getTimePart = (timestamp: string) =>
  new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(timestamp));

const buildPaymentSummary = (amount: number, currentBalance: number): PaymentSummary => {
  const now = new Date();
  const stamp = now.getTime().toString();

  return {
    amount,
    updatedBalance: currentBalance + amount,
    transactionId: `QPTX${stamp.slice(-8)}`,
    referenceNumber: `QPREF${stamp.slice(-10)}`,
    createdAt: now.toISOString(),
    paymentMethod: 'Future: Razorpay',
    status: 'SUCCESS',
    walletName: 'QuickPed Wallet',
  };
};

const PaymentProcessingPage: React.FC<{ logo: string }> = ({ logo }) => (
  <div className="fixed inset-0 z-[60] flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#ffedd5_0%,#fff7ed_38%,#ffffff_78%)] px-6">
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="w-full max-w-sm text-center"
    >
      <img src={logo} alt="QuickPed" className="mx-auto mb-8 h-20 w-40 object-contain mix-blend-multiply" />

      <div className="relative mx-auto mb-8 h-36 w-36">
        <motion.div
          className="absolute inset-0 rounded-full border-[10px] border-orange-100"
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-[10px] border-transparent border-t-orange-500 border-r-orange-400"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-5 flex items-center justify-center rounded-full bg-white shadow-xl">
          <CreditCard className="text-orange-500" size={36} />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-slate-950">Processing Transaction...</h1>
      <p className="mt-2 text-base font-medium text-slate-500">Please wait...</p>
      <div className="mx-auto mt-8 h-2 w-48 overflow-hidden rounded-full bg-orange-100">
        <motion.div
          className="h-full rounded-full bg-orange-500"
          initial={{ width: '8%' }}
          animate={{ width: '100%' }}
          transition={{ duration: PROCESSING_DURATION_MS / 1000, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  </div>
);

const PaymentSuccessPage: React.FC<{
  summary: PaymentSummary;
  logo: string;
  onContinue: () => void;
  onPrint: () => void;
}> = ({ summary, logo, onContinue, onPrint }) => {
  const summaryRows = [
    ['Amount Added', formatCurrency(summary.amount)],
    ['Updated Wallet Balance', formatCurrency(summary.updatedBalance)],
    ['Transaction ID', summary.transactionId],
    ['Date', getDatePart(summary.createdAt)],
    ['Time', getTimePart(summary.createdAt)],
    ['Payment Method', summary.paymentMethod],
    ['Status', summary.status],
    ['Reference Number', summary.referenceNumber],
    ['Wallet Name', summary.walletName],
  ];

  return (
    <div className="fixed inset-0 z-[60] min-h-screen overflow-y-auto bg-slate-50 px-5 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col"
      >
        <div className="flex items-center justify-center gap-3">
          <img src={logo} alt="QuickPed" className="h-10 w-20 object-contain mix-blend-multiply" />
          <span className="font-bold text-slate-900">QuickPed</span>
        </div>

        <div className="flex flex-1 flex-col justify-center py-8 text-center">
          <div className="relative mx-auto mb-6 h-32 w-32">
            <motion.div
              className="absolute inset-0 rounded-full bg-blue-500/10"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: [0.6, 1.12, 1], opacity: [0, 1, 1] }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute inset-4 flex items-center justify-center rounded-full bg-blue-500 text-white shadow-2xl shadow-blue-500/30"
              initial={{ scale: 0.7, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.16, type: 'spring', stiffness: 180, damping: 12 }}
            >
              <CheckCircle2 size={68} strokeWidth={2.4} />
            </motion.div>
          </div>

          <h1 className="text-2xl font-bold text-slate-950">Money Added Successfully</h1>
          <p className="mt-2 text-slate-500">Money has been added to your wallet.</p>

          <Card className="mt-8 overflow-hidden rounded-2xl border-0 bg-white shadow-2xl shadow-slate-200/80">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-5 text-left text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-white/80">Receipt</p>
                  <p className="mt-1 text-3xl font-bold">{formatCurrency(summary.amount)}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <ReceiptText size={25} />
                </div>
              </div>
            </div>
            <CardContent className="space-y-3 p-5 text-left">
              {summaryRows.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="max-w-[58%] text-right text-sm font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-3 pb-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onPrint}
            className="h-12 rounded-2xl border-orange-200 bg-white text-orange-700 hover:bg-orange-50"
          >
            <Printer size={18} />
            Print Receipt
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={onContinue}
            className="h-12 rounded-2xl bg-orange-500 text-white shadow-xl shadow-orange-500/20 hover:bg-orange-600"
          >
            Continue
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export const WalletScreen: React.FC<WalletScreenProps> = ({ onBack }) => {
  const { user, setWalletBalance } = useAuth();
  const balance = toAmount(user?.walletBalance);
  const [activeTab, setActiveTab] = useState('topup');
  const [amountInput, setAmountInput] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [flow, setFlow] = useState<WalletFlow>('wallet');
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [localTransactions, setLocalTransactions] = useState<WalletTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState('');
  const processingTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (processingTimer.current) window.clearTimeout(processingTimer.current);
    };
  }, []);

  const loadTransactions = useCallback(async () => {
    setTransactionsLoading(true);
    setTransactionsError('');

    try {
      const response = await api.get<WalletTransaction[]>('/wallet/transactions');
      const chronological = [...response.data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setTransactions(chronological);
    } catch {
      setTransactionsError('Could not load wallet transactions.');
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      loadTransactions();
    }
  }, [activeTab, loadTransactions]);

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmountInput(event.target.value.replace(/[^\d]/g, '').slice(0, 6));
    setStatusMessage('');
  };

  const handleConfirmAddMoney = () => {
    const amount = Number(amountInput);

    if (!Number.isFinite(amount) || amount <= 0) {
      setStatusMessage('Enter a valid amount.');
      return;
    }

    const summary = buildPaymentSummary(amount, balance);
    setPaymentSummary(summary);
    setStatusMessage('');
    setFlow('processing');

    if (processingTimer.current) window.clearTimeout(processingTimer.current);
    processingTimer.current = window.setTimeout(() => {
      setWalletBalance(summary.updatedBalance);
      setLocalTransactions((current) => [
        {
          id: summary.transactionId,
          amount: summary.amount,
          type: 'CREDIT',
          status: 'SUCCESS',
          createdAt: summary.createdAt,
          referenceId: summary.referenceNumber,
        },
        ...current,
      ]);
      setAmountInput('');
      setPaymentSummary(summary);
      setFlow('success');
    }, PROCESSING_DURATION_MS);
  };

  const visibleTransactions = useMemo(
    () =>
      [...localTransactions, ...transactions].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [localTransactions, transactions],
  );

  if (flow === 'processing') {
    return <PaymentProcessingPage logo={quickPedLogo} />;
  }

  if (flow === 'success' && paymentSummary) {
    return (
      <PaymentSuccessPage
        summary={paymentSummary}
        logo={quickPedLogo}
        onContinue={() => {
          setFlow('wallet');
          setActiveTab('topup');
        }}
        onPrint={() => window.print()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <div className="bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 px-5 pb-10 pt-5 text-white">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-2xl text-white hover:bg-white/15 hover:text-white"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-3">
            <img src={quickPedLogo} alt="QuickPed" className="h-11 w-24 object-contain mix-blend-multiply" />
            <NotificationBell className="border-0 bg-white/15 text-white shadow-none hover:bg-white/25" />
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/15 shadow-2xl shadow-orange-950/20 backdrop-blur-xl">
            <div className="p-5">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-lg">
                    <Wallet size={25} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">QuickPed Wallet</p>
                    <p className="text-xs text-white/60">Ready for campus rides</p>
                  </div>
                </div>
                <Badge className="border-white/30 bg-white/15 text-white">
                  <ShieldCheck size={14} />
                  Secure
                </Badge>
              </div>

              <p className="text-sm text-white/75">Available Balance</p>
              <p className="mt-1 text-5xl font-bold tracking-normal">{formatCurrency(balance)}</p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  size="lg"
                  onClick={() => setActiveTab('topup')}
                  className="h-12 rounded-2xl bg-white text-orange-600 shadow-lg hover:bg-orange-50 hover:text-orange-700 active:scale-[0.98]"
                >
                  <Plus size={19} />
                  Top Up
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setActiveTab('history')}
                  className="h-12 rounded-2xl border-white/35 bg-white/10 text-white shadow-lg hover:bg-white/20 hover:text-white active:scale-[0.98]"
                >
                  <History size={18} />
                  History
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 border-t border-white/15 bg-white/10 px-4 py-3 text-center text-xs text-white/80">
              <div>
                <Sparkles className="mx-auto mb-1" size={16} />
                Instant
              </div>
              <div>
                <BadgeCheck className="mx-auto mb-1" size={16} />
                Verified
              </div>
              <div>
                <ReceiptText className="mx-auto mb-1" size={16} />
                Receipt
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="-mt-6 px-5">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
          <TabsList className="grid h-12 w-full grid-cols-2 rounded-2xl border border-orange-100 bg-white p-1 shadow-xl shadow-orange-100/70">
            <TabsTrigger
              value="topup"
              className="rounded-xl data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Wallet size={16} />
              Top Up
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-xl data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <ReceiptText size={16} />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="topup" className="space-y-4">
            <Card className="overflow-hidden rounded-3xl border-0 bg-white shadow-xl shadow-slate-200/80">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>Add Money</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">Choose an amount for your QuickPed Wallet.</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                    <IndianRupee size={22} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Wallet Balance</p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">{formatCurrency(balance)}</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="wallet-amount" className="text-sm font-semibold text-slate-800">
                    Amount
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
                    <Input
                      id="wallet-amount"
                      type="number"
                      inputMode="numeric"
                      min="1"
                      placeholder="Enter amount"
                      value={amountInput}
                      onChange={handleAmountChange}
                      className="h-14 rounded-2xl border-orange-100 bg-slate-50 pl-11 text-lg font-semibold shadow-sm focus:border-orange-500 focus:bg-white focus:ring-orange-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {TOP_UP_AMOUNTS.map((amount) => {
                    const isSelected = Number(amountInput) === amount;
                    return (
                      <Button
                        key={amount}
                        type="button"
                        variant="outline"
                        className={`h-12 rounded-2xl border-orange-100 font-bold active:scale-[0.98] ${
                          isSelected
                            ? 'bg-orange-500 text-white hover:bg-orange-600 hover:text-white'
                            : 'bg-white text-orange-700 hover:bg-orange-50 hover:text-orange-800'
                        }`}
                        onClick={() => {
                          setAmountInput(String(amount));
                          setStatusMessage('');
                        }}
                      >
                        {formatCurrency(amount)}
                      </Button>
                    );
                  })}
                </div>

                {statusMessage && (
                  <div className="flex items-center gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-3 text-sm font-medium text-orange-700">
                    <AlertCircle size={18} />
                    {statusMessage}
                  </div>
                )}

                <Button
                  type="button"
                  size="lg"
                  className="h-14 w-full rounded-2xl bg-orange-500 text-white shadow-xl shadow-orange-500/20 hover:bg-orange-600 active:scale-[0.99]"
                  onClick={handleConfirmAddMoney}
                >
                  <Plus size={20} />
                  Add Money
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="overflow-hidden rounded-3xl border-0 bg-white shadow-xl shadow-slate-200/80">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>Transaction History</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">Recent wallet activity and receipts.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={loadTransactions}
                    disabled={transactionsLoading}
                    className="rounded-xl border-orange-100 bg-orange-50 text-orange-700 hover:bg-orange-100"
                  >
                    {transactionsLoading ? <Loader2 className="animate-spin" /> : <Clock3 />}
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {transactionsLoading && (
                  <div className="flex items-center gap-3 rounded-2xl bg-orange-50 p-4 text-orange-700">
                    <Loader2 className="animate-spin" />
                    Loading transactions...
                  </div>
                )}

                {!transactionsLoading && transactionsError && visibleTransactions.length === 0 && (
                  <div className="flex items-center gap-3 rounded-2xl bg-danger/10 p-4 text-danger">
                    <AlertCircle size={18} />
                    {transactionsError}
                  </div>
                )}

                {!transactionsLoading && visibleTransactions.length === 0 && !transactionsError && (
                  <div className="rounded-2xl bg-slate-50 p-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                      <ReceiptText size={24} />
                    </div>
                    <p className="font-semibold text-slate-800">No wallet transactions yet.</p>
                    <p className="mt-1 text-sm text-muted-foreground">Top up your wallet to see receipts here.</p>
                  </div>
                )}

                {visibleTransactions.length > 0 && (
                  <div className="space-y-3">
                    {visibleTransactions.map((tx, index) => {
                      const isCredit = tx.type === 'CREDIT';
                      const amount = toAmount(tx.amount);

                      return (
                        <motion.div
                          key={tx.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${
                                isCredit ? 'bg-orange-50 text-orange-600' : 'bg-danger/10 text-danger'
                              }`}
                            >
                              {isCredit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">{isCredit ? 'Wallet top-up' : 'Ride fare deduction'}</p>
                              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                <CalendarDays size={13} />
                                {formatTimestamp(tx.createdAt)}
                              </p>
                              {tx.referenceId && (
                                <p className="truncate text-xs text-muted-foreground">{tx.referenceId}</p>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className={`font-bold ${isCredit ? 'text-orange-600' : 'text-danger'}`}>
                              {isCredit ? '+' : '-'}
                              {formatCurrency(amount)}
                            </p>
                            <Badge
                              variant="outline"
                              className={
                                tx.status === 'SUCCESS'
                                  ? 'border-orange-200 bg-orange-50 text-orange-700'
                                  : tx.status === 'FAILED'
                                    ? 'border-danger/30 text-danger'
                                    : 'border-warning/30 text-warning'
                              }
                            >
                              {tx.status}
                            </Badge>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
