// gurpreet singh -17-jan-26
// gurpreet singh 19-jun-26
//  gurpreet singh 24-jun-26

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Battery,
  Bike,
  ChevronRight,
  Clock,
  MapPin,
  Navigation,
  QrCode,
  Search,
  Zap,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useTheme } from '../components/theme-provider';
import { formatCurrency } from '../lib/utils';
import { NotificationBell } from '../components/notification-bell';
import { useAuth } from '../../context/AuthContext';

interface HomeScreenProps {
  onStartRide: () => void;
  onNavigate: (screen: string) => void;
}

type NearbyDock = {
  id: number;
  name: string;
  bikes: number;
  distance: string;
  battery: number;
};

const getLocalGreeting = (date = new Date()) => {
  const hour = date.getHours();

  if (hour >= 4 && hour < 12) return '🌅 Good Morning';
  if (hour >= 12 && hour < 17) return '☀️ Good Afternoon';
  if (hour >= 17 && hour < 21) return '🌇 Good Evening';
  return '🌙 Good Night';
};

const useLocalGreeting = () => {
  const [greeting, setGreeting] = useState(() => getLocalGreeting());

  useEffect(() => {
    const updateGreeting = () => setGreeting(getLocalGreeting());
    updateGreeting();

    const interval = window.setInterval(updateGreeting, 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  return greeting;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartRide, onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const balance = Number(user?.walletBalance ?? 0);
  const greeting = useLocalGreeting();

  void theme;
  void toggleTheme;
  void balance;

  const nearbyDocks: NearbyDock[] = [
    { id: 1, name: 'Hostel Block C', bikes: 8, distance: '120m', battery: 92 },
    { id: 2, name: 'Main Library', bikes: 4, distance: '340m', battery: 78 },
    { id: 3, name: 'Gate 3 \u00b7 Sports Complex', bikes: 12, distance: '620m', battery: 88 },
    { id: 4, name: 'Sports Complex', bikes: 15, distance: '500m', battery: 92 },
  ];

  const visibleDocks = nearbyDocks.slice(0, 3);
  const userInitials = (user?.name || 'AM')
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f3f1ee] pb-[122px]">
      <header className="bg-white px-[30px] pb-[17px] pt-[18px]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium uppercase leading-none tracking-[4px] text-[#77736f]">
              {greeting}
            </p>
            <h1 className="mt-[9px] text-[16px] font-bold leading-none text-[#050505]">
              {user?.name || 'Aarav'}
            </h1>
          </div>

          <div className="flex items-center gap-[11px]">
            <NotificationBell className="h-[46px] w-[46px] rounded-full border-0 bg-white text-[#181818] shadow-[0_10px_23px_rgba(15,15,15,0.11)]" />
            <button
              onClick={() => onNavigate('profile')}
              className="relative flex h-[47px] w-[47px] items-center justify-center rounded-full bg-[#1f1714] text-[14px] font-bold text-white shadow-[0_10px_23px_rgba(15,15,15,0.13)] hover:cursor-pointer hover:-translate-y-0.5 transition-all duration-200"
            >
              {userInitials}
              <span className="absolute right-[2px] top-[2px] h-[10px] w-[10px] rounded-full border-2 border-white bg-[#ff7433]" />
            </button>
          </div>
        </div>
      </header>

      <main className="space-y-[18px] px-[30px] pt-[26px]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-[23px] bg-[#ffdfbd] px-[23px] pb-[22px] pt-[27px] shadow-[0_18px_34px_rgba(255,119,49,0.06)] hover:scale-[1.02] transition-transform duration-200"
        >
          <div className="pointer-events-none absolute right-[24px] top-[25px] h-[48px] w-[48px] rounded-full bg-white/52 blur-[3px]" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-[95px] w-full overflow-hidden">
            <svg className="absolute bottom-[-1px] left-0 h-[90px] w-full" viewBox="0 0 380 115" preserveAspectRatio="none">
              <path
                d="M0 84 C67 61 114 88 176 87 C242 86 280 61 333 62 C356 63 367 69 380 65 L380 115 L0 115 Z"
                fill="#ff8545"
              />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-[12px]">
              <p className="text-[14px] leading-none text-[#191919]">Ready to ride</p>
              <span className="inline-flex h-[22px] items-center gap-[7px] rounded-full bg-white px-[10px] text-[11px] font-semibold text-[#00794b]">
                <span className="h-[7px] w-[7px] rounded-full bg-[#11915c]" />
                42 cycles nearby
              </span>
            </div>

            <h2 className="mt-[13px] max-w-[250px] text-[30px] font-bold leading-[1.16] text-[#050505]">
              Scan to unlock
              <br />
              your e-cycle
            </h2>
            <p className="mt-[9px] text-[14px] leading-none text-[#303030]">
              {'\u20b92/min \u00b7 First 5 min free today'}
            </p>

            <div className="mt-[38px] flex items-center gap-[13px]">
              <Button
                onClick={onStartRide}
                size="lg"
                className="h-[56px] flex-1 rounded-full bg-[#181818] px-6 text-[15px] font-bold text-white shadow-[0_15px_25px_rgba(17,17,17,0.20)] hover:bg-[#111] active:scale-[0.98] hover:cursor-pointer"
              >
                <QrCode size={18} className="mr-[9px]" />
                Scan & Unlock
              </Button>
              <button className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-white text-[#181818] shadow-[0_12px_22px_rgba(15,15,15,0.12)]">
                <Navigation size={22} />
              </button>
            </div>
          </div>
        </motion.section>

        <div className="flex h-[51px] items-center rounded-full bg-white px-[18px] shadow-[0_10px_26px_rgba(15,15,15,0.045)]">
          <Search size={19} className="mr-[11px] shrink-0 text-[#9b9b9b]" />
          <input
            placeholder="Search docks, blocks, gates..."
            className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#9da1aa]"
          />
          <span className="ml-3 rounded-full bg-[#fff0df] px-[9px] py-[5px] text-[11px] font-semibold leading-none text-[#e6681d]">
            42
          </span>
        </div>

        <section className="space-y-[17px] pt-[13px]">
          <div className="flex items-center justify-between">
            <h2 className="text-[21px] font-bold leading-none text-[#030303]">Nearby docks</h2>
            <button className="text-[13px] font-semibold leading-none text-[#d95700] hover:cursor-pointer hover:underline">View map</button>
          </div>

          <div className="space-y-[12px]">
            {visibleDocks.map((dock, index) => (
              <motion.article
                key={dock.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * (index + 1), duration: 0.28 }}
                className="flex h-[83px] items-center rounded-[19px] bg-white px-[16px] shadow-[0_8px_18px_rgba(15,15,15,0.035)] transition-transform duration-200 hover:scale-[1.02]"
              >
                <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[16px] bg-[#fff0df] text-[#f05f12]">
                  <MapPin size={22} />
                </div>

                <div className="ml-[14px] min-w-0 flex-1">
                  <h3 className="truncate text-[16px] font-bold leading-none text-[#050505]">{dock.name}</h3>
                  <div className="mt-[10px] flex min-w-0 items-center gap-[8px] text-[12px] leading-none">
                    <span className="shrink-0 text-[#62666d]">{dock.distance.replace('m', ' m')}</span>
                    <span className="text-[#a8a8a8]">{'\u00b7'}</span>
                    <span className="flex shrink-0 items-center gap-[4px] font-medium text-[#008354]">
                      <Bike size={13} />
                      {dock.bikes} ready
                    </span>
                    <span className="text-[#a8a8a8]">{'\u00b7'}</span>
                    <span className="flex min-w-0 items-center gap-[4px] text-[#30343a]">
                      <Battery size={13} />
                      {dock.battery}%
                    </span>
                  </div>
                </div>

                <ChevronRight size={20} className="ml-[8px] shrink-0 text-[#d6d6d6]" />
              </motion.article>
            ))}
          </div>
        </section>

        <section className="space-y-[16px] pt-[18px]">
          <h2 className="text-[21px] font-bold leading-none text-[#030303]">Last ride</h2>

          <div className="flex h-[86px] items-center rounded-[19px] bg-white px-[18px] shadow-[0_8px_18px_rgba(15,15,15,0.035)] transition-transform duration-200 hover:scale-[1.02]">
            <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[16px] bg-[#e7f8ee] text-[#008354]">
              <Bike size={23} />
            </div>
            <div className="ml-[14px] min-w-0 flex-1">
              <h3 className="truncate text-[15px] font-bold leading-none text-[#050505]">
                Hostel C {'\u2192'} Library
              </h3>
              <div className="mt-[10px] flex items-center gap-[11px] text-[12px] leading-none text-[#686b71]">
                <span className="flex items-center gap-[4px]">
                  <Clock size={13} />
                  14 min
                </span>
                <span className="flex items-center gap-[4px]">
                  <Navigation size={13} />
                  2.4 km
                </span>
              </div>
            </div>
            <span className="text-[14px] font-bold leading-none text-[#050505]">{formatCurrency(28)}</span>
          </div>

          <button className="flex h-[82px] w-full items-center rounded-[19px] bg-[#ffdcb6] px-[18px] text-left transition-transform duration-200 hover:scale-[1.02] hover:cursor-pointer">
            <span className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[16px] bg-white text-[#ee5f13] ">
              <Zap size={23} />
            </span>
            <span className="ml-[14px] min-w-0 flex-1">
              <span className="block text-[15px] font-bold leading-none text-[#111]">
                Semester pass {'\u00b7'} {'\u20b9'}299
              </span>
              <span className="mt-[8px] block truncate text-[13px] leading-none text-[#55585e]">
                Unlimited 30-min rides for 60 days
              </span>
            </span>
            <ChevronRight size={20} className="text-[#d65a13]" />
          </button>

          <p className="pt-[8px] text-center text-[11px] font-semibold uppercase tracking-[4px] text-[#aaa9a5]">
            QUICKPAD {'\u00b7'} BITS PILANI
          </p>
        </section>
      </main>
    </div>
  );
};
