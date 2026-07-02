import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
      iconClassName: 'bg-orange-500/15 text-orange-500',
      path: '/profile/settings',
    },
    {
      icon: Bell,
      label: 'Notifications',
      description: 'Rides, offers, alerts',
      iconClassName: 'bg-blue-500/15 text-blue-500',
      path: '/profile/notifications',
    },
    {
      icon: MapPin,
      label: 'Saved Places',
      description: 'Hostel, Library, Gate 3',
      iconClassName: 'bg-violet-500/15 text-violet-500',
      path: '/profile/saved-places',
    },
    {
      icon: LifeBuoy,
      label: 'Help & Support',
      description: 'FAQ, contact us',
      iconClassName: 'bg-emerald-500/15 text-emerald-500',
      path: '/profile/help-support',
    },
  ];

  const handleLogout = () => {
    setIsConfirmOpen(false);
    onLogout();
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 transition-colors duration-200">
      <div className="space-y-6 px-4 py-5 max-w-3xl mx-auto sm:px-6">
        {user ? (
          <Card className="relative overflow-hidden rounded-[25px] border border-orange-500/10 bg-[#fbdec0] dark:bg-[#1a1512] shadow-none">
            <CardContent className="relative h-[262px] px-[23px] pt-[27px] pb-0">
              <img
                src={quickPedLogo}
                alt="QuickPed"
                className="absolute left-[16px] top-[15px] z-30 h-[60px] w-[70px] rounded-full bg-white object-contain p-[1px] mix-blend-multiply dark:mix-blend-normal"
              />
              <div className="pointer-events-none absolute right-[20px] top-[22px] h-[50px] w-[50px] rounded-full bg-white/50 dark:bg-black/20 blur-[3px]" />

              <div className="relative z-20 pl-[45px]">
                <p className="flex items-center gap-2 text-[14px] leading-none text-[#4b4c52] dark:text-orange-200/70">
                  Your profile
                  <BadgeCheck size={15} className="text-[#ff6a2c]" strokeWidth={2} />
                </p>

                <h1 className="mt-[14px] text-[30px] font-bold leading-none text-[#1f2024] dark:text-white">
                  {user.name}
                </h1>

                <div className="mt-[12px] flex items-center gap-2 text-[13px] leading-none">
                  <span className="font-semibold text-[#078640] dark:text-emerald-400">+ Gold tier</span>
                  <span className="text-[#7e746c] dark:text-[#a1948a]">{'\u00b7'}</span>
                  <span className="text-[#55565b] dark:text-orange-100/70">
                    {campusCode} {'\u00b7'} {riderCode}
                  </span>
                </div>
              </div>

              <div className="absolute bottom-[23px] left-0 right-0 z-30 grid grid-cols-4 px-[25px]">
                <button type="button" onClick={() => navigate('/profile/settings')} className="flex flex-col items-center">
                  <span className="flex h-[55px] w-[55px] items-center justify-center rounded-full bg-white dark:bg-slate-900 text-[#20252a] dark:text-white border border-border/10 shadow-sm active:scale-95 transition-transform">
                    <Pencil size={20} />
                  </span>
                  <span className="mt-[9px] text-[12px] leading-none text-[#2e3236] dark:text-orange-100">Edit</span>
                </button>

                <button type="button" className="flex flex-col items-center">
                  <span className="flex h-[55px] w-[55px] items-center justify-center rounded-full bg-white dark:bg-slate-900 text-[#20252a] dark:text-white border border-border/10 shadow-sm active:scale-95 transition-transform">
                    <QrCode size={20} />
                  </span>
                  <span className="mt-[9px] text-[12px] leading-none text-[#2e3236] dark:text-orange-100">My QR</span>
                </button>

                <button type="button" onClick={onAddMoney} className="flex flex-col items-center">
                  <span className="flex h-[55px] w-[55px] items-center justify-center rounded-full bg-white dark:bg-slate-900 text-[#20252a] dark:text-white border border-border/10 shadow-sm active:scale-95 transition-transform">
                    <Wallet size={20} />
                  </span>
                  <span className="mt-[9px] text-[12px] leading-none text-[#2e3236] dark:text-orange-100">Wallet</span>
                </button>

                <button type="button" className="flex flex-col items-center">
                  <span className="flex h-[55px] w-[55px] items-center justify-center rounded-full bg-white dark:bg-slate-900 text-[#20252a] dark:text-white border border-border/10 shadow-sm active:scale-95 transition-transform">
                    <Shield size={20} />
                  </span>
                  <span className="mt-[9px] text-[12px] leading-none text-[#2e3236] dark:text-orange-100">Safety</span>
                </button>
              </div>
            </CardContent>

            <div className="pointer-events-none absolute bottom-0 left-0 h-[92px] w-full overflow-hidden">
              <svg
                viewBox="0 0 400 120"
                className="absolute bottom-[-1px] left-0 h-[86px] w-full opacity-90 dark:opacity-40"
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
          <Card>
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
            <h2 className="text-[20px] font-bold leading-none text-foreground">Your impact</h2>

            <div className="rounded-full bg-orange-500/10 px-[13px] py-[9px]">
              <p className="text-[12px] font-semibold leading-none text-orange-600 dark:text-orange-400">This semester</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-[24px] bg-card p-4 shadow-sm border border-border">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10">
                <Bike className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-[34px] font-bold leading-none text-foreground">
                {profileStats?.totalRides ?? '--'}
              </h3>
              <p className="mt-3 text-[12px] font-medium uppercase tracking-[3px] text-muted-foreground/60">RIDES</p>
            </div>

            <div className="rounded-[24px] bg-card p-4 shadow-sm border border-border">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10">
                <Route className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="text-[34px] font-bold leading-none text-foreground">
                {profileStats?.totalDistance ?? '--'}
              </h3>
              <p className="mt-3 text-[12px] font-medium uppercase tracking-[3px] text-muted-foreground/60">KM</p>
            </div>

            <div className="rounded-[24px] bg-card p-4 shadow-sm border border-border">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10">
                <Leaf className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-[34px] font-bold leading-none text-foreground">
                {profileStats?.totalRideTime ? `${profileStats.totalRideTime}kg` : '--'}
              </h3>
              <p className="mt-3 text-[12px] font-medium uppercase tracking-[3px] text-muted-foreground/60">CO2</p>
            </div>
          </div>
        </div>

        <section className="space-y-5">
          <h2 className="text-[22px] font-bold leading-none text-foreground">Account</h2>

          <Card className="overflow-hidden rounded-[19px] border border-border bg-card shadow-none transition-colors duration-200">
            <CardContent className="p-0">
              {accountItems.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className="group flex min-h-[76px] w-full items-center gap-4 border-b border-border px-4 text-left last:border-b-0 hover:bg-orange-500/5 transition-colors"
                >
                  <span className={`flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[15px] ${item.iconClassName}`}>
                    <item.icon size={20} strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold leading-tight text-foreground">{item.label}</span>
                    <span className="mt-1 block truncate text-[13px] leading-tight text-muted-foreground">{item.description}</span>
                  </span>
                  <ChevronRight className="text-muted-foreground/40 transition-colors group-hover:text-orange-500" size={20} />
                </button>
              ))}
            </CardContent>
          </Card>

          <button
            type="button"
            className="flex min-h-[82px] w-full items-center gap-4 rounded-[19px] bg-orange-500/10 border border-orange-500/20 px-4 text-left hover:bg-orange-500/15 transition-colors"
          >
            <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[15px] bg-card border border-border/10 text-orange-500">
              <Gift size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold leading-tight text-foreground">Refer & earn ₹50</span>
              <span className="mt-1 block truncate text-[13px] leading-tight text-muted-foreground">Invite a friend, both get credit</span>
            </span>
            <ChevronRight className="text-orange-500" size={20} />
          </button>

          <button
            type="button"
            className="flex h-[55px] w-full items-center justify-center rounded-[19px] bg-card border border-border text-[15px] font-semibold text-red-500 hover:bg-red-500/5 transition-colors"
            onClick={() => setIsConfirmOpen(true)}
          >
            <LogOut size={18} className="mr-2" />
            Log out
          </button>
        </section>

        <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <DialogContent className="rounded-3xl border border-border bg-card text-card-foreground">
            <DialogHeader>
              <DialogTitle>Confirm Logout</DialogTitle>
              <DialogDescription>Are you sure you want to log out?</DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" className="rounded-full" onClick={() => setIsConfirmOpen(false)}>
                Cancel
              </Button>
              <Button className="rounded-full bg-red-600 hover:bg-red-700 text-white" onClick={handleLogout}>Yes, Logout</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <p className="text-center text-[11px] font-semibold uppercase tracking-[4px] text-muted-foreground/60">
          QUICKPED {'\u00b7'} V1.0.0
        </p>
      </div>
    </div>
  );
};
