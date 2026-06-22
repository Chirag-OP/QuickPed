import React from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowLeft,
  Bike,
  ChevronRight,
  Clock,
  Lock,
  MapPin,
  Pause,
  Route,
  Timer,
  WalletCards,
} from 'lucide-react';
import { formatCurrency, formatDate, formatDuration } from '../lib/utils';
import type { RideHistoryRecord } from '../lib/admin-data';

interface HistoryScreenProps {
  rides: RideHistoryRecord[];
  onBack: () => void;
}

const formatJourneyTimer = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ rides, onBack }) => {
  const totalRides = rides.length;
  const totalDuration = rides.reduce((sum, ride) => sum + ride.duration, 0);
  const totalSpent = rides.reduce((sum, ride) => sum + ride.fare, 0);
  const latestRide = rides[0];
  const displayDuration = latestRide?.duration ?? 758;
  const displayFare = latestRide?.fare ?? 25;
  const displayDistance = latestRide?.distance ?? 2.1;
  const displayDock = latestRide?.startDock ?? 'Hostel C dock';
  const displayVehicle = latestRide?.vehicleId ?? 'QP-2417';

  return (
    <div className="min-h-screen bg-[#f3f1ee] pb-[122px] text-[#080808]">
      <div className="sticky top-0 z-20 bg-white px-[34px] pb-[15px] pt-[10px]">
        <div className="relative flex h-[31px] items-center justify-center">
          <span className="absolute left-0 text-[14px] font-bold leading-none text-black">9:41</span>
          <span className="h-[26px] w-[128px] rounded-full bg-[#161616]" />
          <span className="absolute right-[2px] flex items-center gap-[4px]">
            <span className="h-[5px] w-[5px] rounded-full bg-black" />
            <span className="h-[5px] w-[5px] rounded-full bg-black" />
            <span className="h-[5px] w-[5px] rounded-full bg-black" />
            <span className="h-[5px] w-[5px] rounded-full bg-black" />
          </span>
        </div>
      </div>

      <main className="px-[34px] pt-[16px]">
        <div className="mb-[18px] flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex h-[43px] w-[43px] items-center justify-center rounded-full bg-white text-[#242424] shadow-[0_8px_18px_rgba(15,15,15,0.09)]"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex h-[34px] items-center gap-[8px] rounded-full bg-white px-[14px] text-[13px] font-semibold text-[#171717] shadow-[0_8px_18px_rgba(15,15,15,0.09)]">
            <span className="h-[9px] w-[9px] rounded-full bg-[#149662]" />
            Ride in progress
          </div>

          <button
            className="flex h-[43px] w-[43px] items-center justify-center rounded-full bg-white text-[#ef6421] shadow-[0_8px_18px_rgba(15,15,15,0.09)]"
            aria-label="Ride alert"
          >
            <AlertTriangle size={18} />
          </button>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
          className="relative mb-[20px] h-[121px] overflow-hidden rounded-[28px] bg-[#ffdfbd] px-[24px] py-[23px]"
        >
          <div className="pointer-events-none absolute right-[29px] top-[28px] h-[54px] w-[54px] rounded-full bg-white/48 blur-[3px]" />
          <svg className="pointer-events-none absolute bottom-0 left-0 h-[91px] w-full" viewBox="0 0 382 108" preserveAspectRatio="none">
            <path
              d="M0 68 C70 56 120 70 184 70 C250 70 284 34 333 39 C358 42 368 45 382 39 L382 108 L0 108 Z"
              fill="#ff8847"
            />
          </svg>
          <div className="relative z-10">
            <p className="text-[12px] font-medium uppercase leading-none tracking-[4px] text-[#9b5625]">ELAPSED</p>
            <div className="mt-[13px] flex items-end gap-[9px]">
              <motion.p
                key={displayDuration}
                initial={{ scale: 1.04 }}
                animate={{ scale: 1 }}
                className="text-[51px] font-semibold leading-[0.86] tracking-[0] text-[#111]"
              >
                {formatJourneyTimer(displayDuration)}
              </motion.p>
              <span className="pb-[3px] text-[14px] font-semibold leading-none text-[#222]">min</span>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.32 }}
          className="relative mb-[20px] h-[143px] overflow-hidden rounded-[23px] bg-[#f6f1e9]"
        >
          <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(#e6dfd4_1px,transparent_1px),linear-gradient(90deg,#e6dfd4_1px,transparent_1px)] [background-size:22px_22px]" />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 356 143" preserveAspectRatio="none">
            <path
              d="M28 116 C72 101 86 70 129 51 C169 33 190 35 212 46"
              fill="none"
              stroke="#ff742f"
              strokeLinecap="round"
              strokeWidth="3"
            />
            <path
              d="M212 46 C247 49 273 83 315 83 C329 83 339 78 347 72"
              fill="none"
              stroke="#b9b4ad"
              strokeDasharray="4 6"
              strokeLinecap="round"
              strokeWidth="3"
            />
            <circle cx="28" cy="116" r="5" fill="#13855a" />
            <circle cx="212" cy="46" r="7" fill="#fff" />
            <circle cx="212" cy="46" r="4" fill="#ff742f" />
            <circle cx="347" cy="72" r="5" fill="#141414" />
          </svg>
        </motion.section>

        <section className="mb-[20px] grid grid-cols-3 gap-[12px]">
          {[
            { icon: Route, color: 'text-[#1f70c7]', bg: 'bg-[#e8f2ff]', value: displayDistance.toFixed(1), unit: 'km', label: 'DISTANCE' },
            { icon: WalletCards, color: 'text-[#eb6a22]', bg: 'bg-[#fff0df]', value: formatCurrency(displayFare), unit: '', label: 'FARE' },
            { icon: Timer, color: 'text-[#19875a]', bg: 'bg-[#e4f5ec]', value: '03', unit: 'min', label: 'FREE LEFT' },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * (index + 1), duration: 0.25 }}
                className="h-[114px] rounded-[17px] bg-white px-[16px] py-[14px] shadow-[0_10px_20px_rgba(15,15,15,0.035)]"
              >
                <div className={`mb-[18px] flex h-[31px] w-[31px] items-center justify-center rounded-[9px] ${item.bg} ${item.color}`}>
                  <Icon size={18} />
                </div>
                <p className="text-[18px] font-bold leading-none text-black">
                  {item.value}
                  {item.unit && <span className="ml-[4px] text-[12px] font-medium">{item.unit}</span>}
                </p>
                <p className="mt-[8px] text-[11px] font-medium uppercase leading-none tracking-[2.4px] text-[#6f7177]">
                  {item.label}
                </p>
              </motion.div>
            );
          })}
        </section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.28 }}
          className="mb-[18px] flex h-[86px] items-center rounded-[19px] bg-white px-[20px] shadow-[0_8px_18px_rgba(15,15,15,0.035)]"
        >
          <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[16px] bg-[#fff0df] text-[#ed641d]">
            <Bike size={23} />
          </div>
          <div className="ml-[14px] min-w-0">
            <h2 className="truncate text-[15px] font-bold leading-none text-[#050505]">QuickPad · {displayVehicle}</h2>
            <p className="mt-[8px] truncate text-[13px] leading-none text-[#59606a]">e-Cycle · {displayDock}</p>
          </div>
        </motion.section>

        <div className="mb-[18px] flex items-center gap-[14px]">
          <button className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-white text-[#232323] shadow-[0_8px_18px_rgba(15,15,15,0.08)]" aria-label="Pause ride">
            <Pause size={20} />
          </button>
          <button className="flex h-[56px] flex-1 items-center justify-center rounded-full bg-[#171717] text-[15px] font-bold text-white shadow-[0_14px_25px_rgba(15,15,15,0.18)]">
            <Lock size={18} className="mr-[10px]" />
            End ride & lock
          </button>
        </div>

        <p className="mb-[86px] text-center text-[12px] leading-none text-[#69707a]">
          Park inside any QuickPad dock to end your ride
        </p>

        <section className="space-y-[14px]">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-[21px] font-bold leading-none text-[#030303]">All rides</h2>
              <p className="mt-[7px] text-[12px] text-[#77736f]">
                {totalRides} rides · {formatDuration(totalDuration)} · {formatCurrency(totalSpent)}
              </p>
            </div>
          </div>

          {rides.length === 0 && (
            <div className="rounded-[19px] bg-white px-[18px] py-[22px] text-center text-[13px] text-[#686b71] shadow-[0_8px_18px_rgba(15,15,15,0.035)]">
              Completed rides will appear here after you end a ride.
            </div>
          )}

          {rides.map((ride, index) => (
            <motion.article
              key={ride.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.26 }}
              className="flex min-h-[86px] items-center rounded-[19px] bg-white px-[18px] py-[16px] shadow-[0_8px_18px_rgba(15,15,15,0.035)]"
            >
              <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[16px] bg-[#e7f8ee] text-[#008354]">
                <Bike size={23} />
              </div>
              <div className="ml-[14px] min-w-0 flex-1">
                <h3 className="truncate text-[15px] font-bold leading-none text-[#050505]">
                  {ride.startDock} {'\u2192'} {ride.endDock}
                </h3>
                <div className="mt-[10px] flex min-w-0 items-center gap-[10px] text-[12px] leading-none text-[#686b71]">
                  <span className="flex shrink-0 items-center gap-[4px]">
                    <Clock size={13} />
                    {formatDuration(ride.duration)}
                  </span>
                  <span className="flex min-w-0 items-center gap-[4px] truncate">
                    <MapPin size={13} />
                    {formatDate(ride.completedAt)}
                  </span>
                </div>
              </div>
              <div className="ml-[10px] flex shrink-0 items-center gap-[8px]">
                <span className="text-[14px] font-bold leading-none text-[#050505]">{formatCurrency(ride.fare)}</span>
                <ChevronRight size={18} className="text-[#d6d6d6]" />
              </div>
            </motion.article>
          ))}
        </section>
      </main>
    </div>
  );
};
