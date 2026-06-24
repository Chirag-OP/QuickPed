import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  BadgeCheck,
  Bell,
  Bike,
  ChevronRight,
  Gift,
  Leaf,
  LifeBuoy,
  LogOut,
  MapPin,
  Pencil,
  QrCode,
  Route,
  Settings,
  Wallet,
  Shield,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { useAuth } from '../../context/AuthContext';
import quickPedLogo from '../../assets/logo.jpeg';

interface ProfileScreenProps {
  onBack: () => void;
  onAddMoney: () => void;
  onLogout: () => void;
}

type ProfileStats = {
  totalRides?: number | string;
  totalDistance?: number | string;
  totalRideTime?: number | string;
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onAddMoney, onLogout }) => {
  const { user } = useAuth();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedInstitute] = useState(() => {
    try {
      const saved = localStorage.getItem('qp_user_profile');
      const profile = saved ? JSON.parse(saved) : {};
      return typeof profile.institution === 'string' ? profile.institution : '';
    } catch {
      return '';
    }
  });

  const profileStats = user as (typeof user & ProfileStats) | null;
  const instituteName = selectedInstitute || (user?.campusId ? 'Campus Enrolled' : 'None');
  const campusCode = user?.campusId || instituteName || 'BITS24';
  const riderCode = user?.phoneNumber?.replace(/\D/g, '').slice(-4) || '0892';

  const accountItems = [
    {
      icon: Settings,
      label: 'Settings',
      description: 'Notifications, language',
      iconClassName: 'bg-[#fff1de] text-[#f06b1f]',
    },
    {
      icon: Bell,
      label: 'Notifications',
      description: 'Rides, offers, alerts',
      iconClassName: 'bg-[#e8f2ff] text-[#1d68d8]',
    },
    {
      icon: MapPin,
      label: 'Saved places',
      description: 'Hostel, Library, Gate 3',
      iconClassName: 'bg-[#f0e8ff] text-[#7c48ec]',
    },
    {
      icon: LifeBuoy,
      label: 'Help & support',
      description: 'FAQ, contact us',
      iconClassName: 'bg-[#e8f8ef] text-[#219661]',
    },
  ];

  const handleLogout = () => {
    setIsConfirmOpen(false);
    onLogout();
  };

  return (
    <div className="min-h-screen bg-[#f7f6f3] pb-24">
      <div className="space-y-6 p-4">
        {user ? (
          <Card className="relative overflow-hidden rounded-[25px] border-0 bg-[#fbdec0] shadow-none">
            <CardContent className="relative h-[262px] px-[23px] pt-[27px] pb-0">
              <img
                src={quickPedLogo}
                alt="QuickPed"
                className="absolute left-[16px] top-[15px] z-30 h-[34px] w-[34px] rounded-full bg-white object-contain p-[3px] mix-blend-multiply"
              />
              <div className="pointer-events-none absolute right-[20px] top-[22px] h-[50px] w-[50px] rounded-full bg-white/50 blur-[3px]" />

              <div className="relative z-20 pl-[45px]">
                <p className="flex items-center gap-2 text-[14px] leading-none text-[#4b4c52]">
                  Your profile
                  <BadgeCheck size={15} className="text-[#ff6a2c]" strokeWidth={2} />
                </p>

                <h1 className="mt-[14px] text-[30px] font-bold leading-none text-[#1f2024]">
                  {user.name}
                </h1>

                <div className="mt-[12px] flex items-center gap-2 text-[13px] leading-none">
                  <span className="font-semibold text-[#078640]">+ Gold tier</span>
                  <span className="text-[#7e746c]">{'\u00b7'}</span>
                  <span className="text-[#55565b]">
                    {campusCode} {'\u00b7'} {riderCode}
                  </span>
                </div>
              </div>

              <div className="absolute bottom-[23px] left-0 right-0 z-30 grid grid-cols-4 px-[25px]">
                <button type="button" className="flex flex-col items-center hover:scale-[1.03] transition-transform duration-200">
                  <span className="flex h-[55px] w-[55px] items-center justify-center rounded-full bg-white text-[#20252a] hover:cursor-pointer">
                    <Pencil size={20} />
                  </span>
                  <span className="mt-[9px] text-[12px] leading-none text-[#2e3236]">Edit</span>
                </button>

                <button type="button" className="flex flex-col items-center hover:scale-[1.03] transition-transform duration-200">
                  <span className="flex h-[55px] w-[55px] items-center justify-center rounded-full bg-white text-[#20252a] hover:cursor-pointer">
                    <QrCode size={20} />
                  </span>
                  <span className="mt-[9px] text-[12px] leading-none text-[#2e3236]">My QR</span>
                </button>

                <button type="button" onClick={onAddMoney} className="flex flex-col items-center hover:scale-[1.03] transition-transform duration-200">
                  <span className="flex h-[55px] w-[55px] items-center justify-center rounded-full bg-white text-[#20252a] hover:cursor-pointer">
                    <Wallet size={20} />
                  </span>
                  <span className="mt-[9px] text-[12px] leading-none text-[#2e3236]">Wallet</span>
                </button>

                <button type="button" className="flex flex-col items-center hover:scale-[1.03] transition-transform duration-200">
                  <span className="flex h-[55px] w-[55px] items-center justify-center rounded-full bg-white text-[#20252a] hover:cursor-pointer">
                    <Shield size={20} />
                  </span>
                  <span className="mt-[9px] text-[12px] leading-none text-[#2e3236]">Safety</span>
                </button>
              </div>
            </CardContent>

            <div className="pointer-events-none absolute bottom-0 left-0 h-[92px] w-full overflow-hidden">
              <svg
                viewBox="0 0 400 120"
                className="absolute bottom-[-1px] left-0 h-[86px] w-full"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 76 C70 58 120 88 181 87 C239 86 285 62 337 63 C365 64 383 70 400 64 L400 120 L0 120 Z"
                  fill="#ff8544"
                />
              </svg>
            </div>
          </Card>
        ) : (
          <Card variant="elevated">
            <CardContent className="relative h-[300px] px-6 pt-6 pb-28">
              <div className="flex items-center gap-3 text-muted-foreground">
                <AlertCircle size={20} />
                <p className="text-sm">No profile information found. Please log in again.</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-[10px]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[20px] font-bold leading-none text-[#1f2024]">Your impact</h2>

            <div className="rounded-full bg-[#fff0df] px-[13px] py-[9px]">
              <p className="text-[12px] font-semibold leading-none text-[#d95400] hover:underline">This semester</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-[24px] bg-white p-4 shadow-sm hover:scale-[1.03] transition-transform duration-200">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">
                <Bike className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-[34px] font-bold leading-none text-slate-900">
                {profileStats?.totalRides ?? '--'}
              </h3>
              <p className="mt-3 text-[12px] font-medium uppercase tracking-[3px] text-slate-400">RIDES</p>
            </div>

            <div className="rounded-[24px] bg-white p-4 shadow-sm hover:scale-[1.03] transition-transform duration-200">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100">
                <Route className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-[34px] font-bold leading-none text-slate-900">
                {profileStats?.totalDistance ?? '--'}
              </h3>
              <p className="mt-3 text-[12px] font-medium uppercase tracking-[3px] text-slate-400">KM</p>
            </div>

            <div className="rounded-[24px] bg-white p-4 shadow-sm hover:scale-[1.03] transition-transform duration-200">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                <Leaf className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-[34px] font-bold leading-none text-slate-900">
                {profileStats?.totalRideTime ? `${profileStats.totalRideTime}kg` : '--'}
              </h3>
              <p className="mt-3 text-[12px] font-medium uppercase tracking-[3px] text-slate-400">CO2</p>
            </div>
          </div>
        </div>

        <section className="space-y-5">
          <h2 className="text-[22px] font-bold leading-none text-[#1f2024]">Account</h2>

          <Card className="overflow-hidden rounded-[19px] border-0 bg-white shadow-none">
            <CardContent className="p-2">
              {accountItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="group flex min-h-[76px] w-full items-center gap-4 border-b border-[#eeeeeb] px-4 text-left last:border-b-0 hover:cursor-pointer hover:scale-[1.03] transition-transform duration-200 lg:hover:scale-[1.01]"
                >
                  <span className={`flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[15px] ${item.iconClassName}`}>
                    <item.icon size={20} strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold leading-tight text-[#26272b]">{item.label}</span>
                    <span className="mt-1 block truncate text-[13px] leading-tight text-[#787a7f]">{item.description}</span>
                  </span>
                  <ChevronRight className="text-[#d1d1d1] transition-colors group-hover:text-[#ff7533]" size={20} />
                </motion.button>
              ))}
            </CardContent>
          </Card>

          <button
            type="button"
            className="flex min-h-[82px] w-full items-center gap-4 rounded-[19px] bg-[#ffdcb6] px-4 text-left hover:scale-[1.03] transition-transform duration-200 lg:hover:scale-[1.01]"
          >
            <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[15px] bg-white text-[#ea5d12]">
              <Gift size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold leading-tight text-[#27272a]">Refer & earn ₹50</span>
              <span className="mt-1 block truncate text-[13px] leading-tight text-[#66686d]">Invite a friend, both get credit</span>
            </span>
            <ChevronRight className="text-[#d65a13]" size={20} />
          </button>

          <button
            type="button"
            className="flex h-[55px] w-full items-center justify-center rounded-[19px] bg-white text-[15px] font-semibold text-[#d5251f] hover:scale-[1.03] transition-transform duration-200 hover:cursor-pointer lg:hover:scale-[1.01]"
            onClick={() => setIsConfirmOpen(true)}
          >
            <LogOut size={18} className="mr-2" />
            Log out
          </button>
        </section>

        <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Logout</DialogTitle>
              <DialogDescription>Are you sure you want to log out?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleLogout}>Yes, Logout</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <p className="text-center text-[11px] font-semibold uppercase tracking-[4px] text-[#aaa9a5]">
          QUICKPED {'\u00b7'} V1.0.0
        </p>
      </div>
    </div>
  );
};
