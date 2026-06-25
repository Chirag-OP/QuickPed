import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bike } from "lucide-react";
import { motion } from 'motion/react';
import {
  AlertCircle,
  ArrowDown,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUp,
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  Gift,
  IndianRupee,
  Loader2,
  MoreHorizontal,
  Plus,
  Printer,
  ReceiptText,
  RotateCcw,
  Send,
  Wallet,
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { formatCurrency } from '../lib/utils';
import quickPedLogo from '../../assets/logo.jpeg';

interface WalletScreenProps {
  onBack: () => void;
}

type TransactionType = 'CREDIT' | 'DEBIT';
type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';
type WalletFlow = 'wallet' | 'processing' | 'success';
type ActivityFilter = 'All' | 'Rides' | 'Deposits' | 'Refunds' | 'Transfers';

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

type ActivityItem = {
  id: string;
  title: string;
  timestamp: string;
  amount: number;
  isCredit: boolean;
  category: Exclude<ActivityFilter, 'All'>;
  accent: string;
  icon: React.ElementType;
  reference: string;
};

const TOP_UP_AMOUNTS = [100, 200, 500, 1000];
const PROCESSING_DURATION_MS = 2400;
const ACTIVITY_FILTERS: ActivityFilter[] = ['All', 'Rides', 'Deposits', 'Refunds', 'Transfers'];

const toAmount = (value: number | string | null | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

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

const formatShortTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getDatePart = (timestamp: string) =>
  new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(timestamp));

const getTimePart = (timestamp: string) =>
  new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(timestamp));

const sampleActivity: ActivityItem[] = [
];

const mapTransactionsToActivity = (items: WalletTransaction[]): ActivityItem[] =>
  items.map((tx, index) => {
    const isCredit = tx.type === 'CREDIT';
    const amount = toAmount(tx.amount);

    return {
      id: tx.id,
      title: isCredit ? 'Wallet Top-up' : 'Ride Fare',
      timestamp: formatShortTimestamp(tx.createdAt),
      amount,
      isCredit,
      category: isCredit ? 'Deposits' : 'Rides',
      accent: isCredit ? 'bg-orange-50 text-orange-500' : 'bg-rose-50 text-rose-500',
      icon: isCredit ? Wallet : ArrowDownLeft,
      reference: tx.referenceId || `tx-${String(index + 1).padStart(3, '0')}`,
    };
  });

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
<div className="relative mx-auto -mt-3 mb-8 h-44 w-44">
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
<div className="relative">

<div className="w-40 h-40 rounded-full bg-gradient-to-br from-orange-100 to-orange-300 flex items-center justify-center shadow-xl">
<CheckCircle2
size={82}
strokeWidth={2.8}
className="text-white"
/>

</div>

<div className="absolute bottom-5 right-3 w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">

<div className="w-10 h-10 rounded-2xl bg-green-900 flex items-center justify-center">
    <Bike
        size={26}
        className="text-white-600"
        strokeWidth={2}
    />
</div>

</div>

</div>            </motion.div>
          </div>

          <h1 className="text-2xl font-bold text-slate-950">Payment successful</h1>
          <p className="mt-2 text-slate-500">Your e-cycle is unlocked and ready</p>

          <div className="mt-8 rounded-[32px] bg-[#FFE7CF] px-6 py-7">

    <div className="flex justify-between items-center mb-6">
        <p className="text-[#7A4A18] font-semibold">
            Amount paid
        </p>

<p className="text-4xl font-black text-black">
              ₹{summary.amount}
        </p>
    </div>

   <div className="rounded-[28px] bg-white p-7 mt-4">

        <div className="flex justify-between items-center">

            <div className="flex gap-4">

               <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e7a03485]">
    <Bike
        size={26}
        color="darkorange"
        strokeWidth={2.2}
    />
</div>

                <div>

                    <h3 className="font-bold text-black">
                        QuickPad · QP-2417
                    </h3>

                    <p className="text-gray-500">
                        Hostel C Dock
                    </p>

                </div>

            </div>

            <div className="bg-green-100 text-green-700 rounded-full px-4 py-1 text-sm">
                Ready
            </div>

        </div>

        <hr className="my-5"/>

        <div className="flex justify-between">

            <div>

                <p className="text-gray-500">
                    Transaction ID
                </p>

                <p className="text-gray-500 mt-4">
                    Paid from wallet
                </p>

            </div>

            <div className="text-right">

                <p className="font-semibold text-black">
                    {summary.transactionId}
                </p>

                <p className="font-semibold mt-4 text-black">
                    Balance ₹{summary.updatedBalance}
                </p>

            </div>

        </div>

    </div>

</div>
{/* <div className="mt-6 rounded-3xl bg-white p-5">

<div className="flex gap-4">

<div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">

🕒

</div>

<div>

<h3 className="font-bold">
First 5 minutes free
</h3>

<p className="text-gray-500">
Ride starts now.
₹2/min after the free period.
</p>

</div>

</div>

</div> */}
        </div>

        <div className="grid grid-cols-2 gap-3 pb-4">
          
        
        </div>
        <Button

className="mt-8 h-14 w-full rounded-full bg-orange-300 text-white text-lg font-semibold"

onClick={onPrint}

>

<Bike
        size={20}
        className="text-white-600"
        strokeWidth={2}
    />  Print Receipt

</Button>
        
        <Button

className="mt-8 h-14 w-full rounded-full bg-black text-white text-lg font-semibold"

onClick={onContinue}

>

<Bike
        size={30}
        className="text-white-600"
        strokeWidth={2}
    /> Continue

</Button>
<p className="mt-5 text-center text-gray-400 text-sm">

Tap above to head to the ride screen

</p>
      </motion.div>
    </div>
  );
};

export const WalletScreen: React.FC<WalletScreenProps> = ({ onBack }) => {
  const location = useLocation();
  const routeState = location.state as { openAddMoney?: boolean } | null;
  const { user, setWalletBalance } = useAuth();
  const balance = toAmount(user?.walletBalance);
  const [amountInput, setAmountInput] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [flow, setFlow] = useState<WalletFlow>('wallet');
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [localTransactions, setLocalTransactions] = useState<WalletTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState('');
  const [activeFilter, setActiveFilter] = useState<ActivityFilter>('All');
  const [showAddMoney, setShowAddMoney] = useState(Boolean(routeState?.openAddMoney));
  const processingTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (processingTimer.current) window.clearTimeout(processingTimer.current);
    };
  }, []);

  useEffect(() => {
    if (routeState?.openAddMoney) {
      setShowAddMoney(true);
    }
  }, [routeState?.openAddMoney]);

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
      setTransactionsError('Could not load live wallet transactions.');
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

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
      setShowAddMoney(false);
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

  const activityItems = useMemo(() => {
const source = mapTransactionsToActivity(visibleTransactions);    return activeFilter === 'All' ? source : source.filter((item) => item.category === activeFilter);
  }, [activeFilter, visibleTransactions]);

  const allActivityItems = visibleTransactions.length ? mapTransactionsToActivity(visibleTransactions) : sampleActivity;
  const walletGrowth = balance > 0 ? '+2.35%' : '+0.00%';
  const userInitial = user?.name?.trim().charAt(0).toUpperCase() || 'Q';

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
          setActiveFilter('All');
        }}
        onPrint={() => window.print()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcfb] pb-28">
      <div className="mx-auto max-w-md px-4 pt-5">
        <div className="mb-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="-ml-2 h-9 w-9 rounded-full text-[#ff7a2f] hover:bg-orange-50 hover:text-[#ff7a2f]"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </Button>
            <img src={quickPedLogo} alt="QuickPed" className="h-11 w-24 object-contain mix-blend-multiply" />
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-base font-bold text-orange-500 shadow-[0_10px_20px_rgba(255,115,49,0.12)]">
            {userInitial}
          </div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[30px] bg-white px-5 pb-6 pt-5 shadow-[0_20px_45px_rgba(31,31,31,0.08)]"
        >
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-[radial-gradient(circle_at_20%_90%,rgba(255,255,255,0.95)_0_18%,transparent_19%),radial-gradient(circle_at_55%_96%,rgba(255,255,255,0.86)_0_14%,transparent_15%),linear-gradient(155deg,transparent_0_28%,#ffe7cf_29%,#ffc58f_58%,#fff3e6_100%)]" />
          <div className="pointer-events-none absolute right-6 top-8 h-3 w-3 rounded-full bg-orange-200/80" />

          <div className="relative z-10">
            <div className="mb-1 flex items-center gap-1.5">
              <p className="text-sm font-semibold text-slate-500">Your balance</p>
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-300">INR</span>
            </div>
            <p className="text-[44px] font-extrabold leading-tight tracking-normal text-slate-950">
              {formatCurrency(balance)}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs font-bold">
              <span className="text-emerald-500">{walletGrowth}</span>
              <span className="text-slate-400">Today</span>
            </div>

            <div className="mt-8 grid grid-cols-4 gap-3">
              {[
                { label: 'Send', icon: ArrowUp, onClick: () => setStatusMessage('Send will be available soon.') },
                { label: 'Receive', icon: ArrowDown, onClick: () => setStatusMessage('Receive will be available soon.') },
                { label: 'Add Money', icon: Plus, onClick: () => { setStatusMessage(''); setShowAddMoney((current) => !current); } },
                { label: 'More', icon: MoreHorizontal, onClick: () => setStatusMessage('More wallet actions are coming soon.') },
              ].map(({ label, icon: Icon, onClick }) => (
                <button
                  key={label}
                  type="button"
                  onClick={onClick}
                  className="group flex flex-col items-center gap-2 text-center text-[12px] font-semibold text-slate-700"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-800 shadow-[0_12px_28px_rgba(65,45,20,0.10)] transition-transform group-active:scale-95">
                    <Icon size={20} />
                  </span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {showAddMoney && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-[28px] bg-white p-5 shadow-[0_18px_40px_rgba(31,31,31,0.07)]"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-950">Adddfgh Money</h2>
                <p className="text-sm text-slate-400">Top up your QuickPed wallet.</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                <IndianRupee size={20} />
              </div>
            </div>

            <div className="relative">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" size={18} />
              <Input
                id="wallet-amount"
                type="number"
                inputMode="numeric"
                min="1"
                placeholder="Enter amount"
                value={amountInput}
                onChange={handleAmountChange}
                className="h-14 rounded-2xl border-orange-100 bg-orange-50/40 pl-11 text-lg font-bold focus:border-orange-400 focus:bg-white focus:ring-orange-400/20"
              />
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {TOP_UP_AMOUNTS.map((amount) => {
                const isSelected = Number(amountInput) === amount;
                return (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => {
                      setAmountInput(String(amount));
                      setStatusMessage('');
                    }}
                    className={`h-11 rounded-2xl text-sm font-bold transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                        : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                    }`}
                  >
                    {formatCurrency(amount)}
                  </button>
                );
              })}
            </div>

            {statusMessage && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-orange-50 p-3 text-sm font-semibold text-orange-700">
                <AlertCircle size={17} />
                {statusMessage}
              </div>
            )}

            <div className="mt-4 grid grid-cols-[0.8fr_1.2fr] gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-2xl border-orange-100 bg-white text-slate-600 hover:bg-orange-50"
                onClick={() => {
                  setShowAddMoney(false);
                  setStatusMessage('');
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="h-12 rounded-2xl bg-orange-500 text-white shadow-xl shadow-orange-500/20 hover:bg-orange-600"
                onClick={handleConfirmAddMoney}
              >
                <Plus size={1} />
                Add Money
              </Button>
            </div>
          </motion.section>
        )}

        <section className="mt-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-950">Activity</h2>
            <div className="flex items-center gap-2 text-sm font-bold text-orange-500">
              {transactionsLoading && <Loader2 className="animate-spin" size={14} />}
              {allActivityItems.length} records
            </div>
          </div>

          <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
            {ACTIVITY_FILTERS.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`min-w-[70px] rounded-2xl px-4 py-2 text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-white text-orange-500 shadow-[0_10px_25px_rgba(31,31,31,0.06)]'
                      : 'text-slate-500 hover:bg-white/70'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          {transactionsError && visibleTransactions.length > 0 && (
            <div className="mb-3 rounded-2xl bg-orange-50 p-3 text-sm font-semibold text-orange-700">
              {transactionsError}
            </div>
          )}

          <div className="space-y-3">
            {activityItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between rounded-[24px] bg-white px-4 py-4 shadow-[0_10px_30px_rgba(31,31,31,0.04)]"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.accent}`}>
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-slate-900">{item.title}</p>
                      <p className="mt-1 truncate text-xs font-medium text-slate-400">{item.timestamp}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-sm font-extrabold ${item.isCredit ? 'text-emerald-500' : 'text-slate-800'}`}>
                      {item.isCredit ? '+' : '-'}
                      {formatCurrency(item.amount)}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-400">{item.reference}</p>
                  </div>
                </motion.div>
              );
            })}

            {activityItems.length === 0 && (
              <div className="rounded-[24px] bg-white p-6 text-center text-sm font-semibold text-slate-400 shadow-[0_10px_30px_rgba(31,31,31,0.04)]">
                No activity in this category yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
