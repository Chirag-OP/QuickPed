import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Bell,
  Camera,
  ChevronRight,
  FileText,
  Globe2,
  Languages,
  LogOut,
  Moon,
  RefreshCcw,
  Share2,
  Shield,
  Smartphone,
  Star,
  Sun,
  Trash2,
  User,
  UserRound,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
interface ProfileSettingsScreenProps {
  onBack: () => void;
}
type SettingsRow = {
  label: string;
  description?: string;
  icon: React.ElementType;
  action?: 'toggle' | 'chevron' | 'danger';
  enabled?: boolean;
};
const sectionClassName = 'rounded-[26px] border-0 bg-white shadow-[0_16px_40px_rgba(31,31,31,0.06)]';
export const ProfileSettingsScreen: React.FC<ProfileSettingsScreenProps> = ({ onBack }) => {
  const [theme, setTheme] = useState<'Light Mode' | 'Dark Mode' | 'System Theme'>('System Theme');
  const [toggles, setToggles] = useState({
    ride: true,
    wallet: true,
    promo: false,
    push: true,
    email: false,
    dataSharing: false,
    location: true,
  });
  const accountRows: SettingsRow[] = [
    { label: 'Edit Profile', description: 'Update your QuickPed account details', icon: UserRound },
    { label: 'Change Name', description: 'Personalize your display name', icon: User },
    { label: 'Change Profile Picture', description: 'Upload a new profile photo', icon: Camera },
    { label: 'Change Phone Number', description: 'Update your registered mobile number', icon: Smartphone },
  ];
  const privacyRows: SettingsRow[] = [
    { label: 'Privacy Policy', description: 'How QuickPed protects your data', icon: Shield },
    { label: 'Terms & Conditions', description: 'Usage policies and ride terms', icon: FileText },
    { label: 'Data Sharing', description: 'Allow service improvement analytics', icon: Share2, action: 'toggle', enabled: toggles.dataSharing },
    { label: 'Location Permission', description: 'Use location for nearby docks and rides', icon: Globe2, action: 'toggle', enabled: toggles.location },
  ];
  const appRows: SettingsRow[] = [
    { label: 'Language', description: 'English', icon: Languages },
    { label: 'Rate App', description: 'Share your QuickPed experience', icon: Star },
    { label: 'Share App', description: 'Invite friends to ride smarter', icon: Share2 },
    { label: 'App Version', description: 'QuickPed v1.0.0', icon: Smartphone },
    { label: 'About QuickPed', description: 'Campus mobility made simple', icon: FileText },
    { label: 'Check for Updates', description: 'Look for the newest frontend release', icon: RefreshCcw },
  ];
  const securityRows: SettingsRow[] = [
    { label: 'Logout from All Devices', description: 'End active QuickPed sessions', icon: LogOut, action: 'danger' },
    { label: 'Delete Account', description: 'Permanently remove your account', icon: Trash2, action: 'danger' },
  ];
  const renderRows = (rows: SettingsRow[]) =>
    rows.map((row, index) => {
      const Icon = row.icon;
      return (
        <motion.div
          key={row.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          className="flex min-h-[74px] w-full items-center gap-4 border-b border-slate-100 px-4 text-left last:border-b-0"
        >
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] ${
              row.action === 'danger' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'
            }`}
          >
            <Icon size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className={`block text-[15px] font-bold ${row.action === 'danger' ? 'text-red-600' : 'text-slate-900'}`}>
              {row.label}
            </span>
            {row.description && <span className="mt-1 block truncate text-[13px] text-slate-500">{row.description}</span>}
          </span>
          {row.action === 'toggle' ? (
            <Switch
              checked={Boolean(row.enabled)}
              onCheckedChange={(checked) =>
                setToggles((current) => ({
                  ...current,
                  [row.label === 'Data Sharing' ? 'dataSharing' : 'location']: checked,
                }))
              }
              aria-label={`${row.label} switch`}
            />
          ) : (
            <ChevronRight size={19} className={row.action === 'danger' ? 'text-red-200' : 'text-slate-300'} />
          )}
        </motion.div>
      );
    });
  const notificationOptions = [
    ['ride', 'Ride Notifications', 'Ride starts, completions, and reservations'],
    ['wallet', 'Wallet Notifications', 'Top-ups and low balance alerts'],
    ['promo', 'Promotional Notifications', 'Offers, discounts, and events'],
    ['push', 'Push Notifications', 'Mobile push alerts'],
    ['email', 'Email Notifications', 'Important updates by email'],
  ] as const;
  return (
    <div className="min-h-screen bg-[#f7f6f3] pb-10">
      <main className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
        <div className="mb-5 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-11 w-11 rounded-full bg-white text-orange-500 shadow-[0_8px_18px_rgba(15,15,15,0.08)] hover:bg-orange-50 hover:text-orange-500"
            aria-label="Back to profile"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-orange-600">Settings</div>
        </div>
        <section className="mb-6 rounded-[30px] bg-[#ffdfbd] px-5 py-6 text-slate-950">
          <p className="text-sm font-bold uppercase tracking-[3px] text-orange-700">QuickPed Profile</p>
          <h1 className="mt-3 text-3xl font-black leading-tight">Settings</h1>
          <p className="mt-2 max-w-xl text-sm font-medium text-slate-600">Tune your account, theme, alerts, privacy, and app preferences.</p>
        </section>
        <div className="space-y-5">
          <section>
            <h2 className="mb-3 px-1 text-lg font-black text-slate-950">Account</h2>
            <Card className={sectionClassName}>
              <CardContent className="p-0">{renderRows(accountRows)}</CardContent>
            </Card>
          </section>
          <section>
            <h2 className="mb-3 px-1 text-lg font-black text-slate-950">Appearance</h2>
            <Card className={sectionClassName}>
              <CardContent className="grid gap-3 p-4 sm:grid-cols-3">
                {[
                  { label: 'Light Mode', icon: Sun },
                  { label: 'Dark Mode', icon: Moon },
                  { label: 'System Theme', icon: Smartphone },
                ].map(({ label, icon: Icon }) => {
                  const isActive = theme === label;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setTheme(label as typeof theme)}
                      className={`flex min-h-[92px] flex-col items-start justify-between rounded-[20px] border p-4 text-left transition-all ${
                        isActive
                          ? 'border-orange-400 bg-orange-50 text-orange-600 shadow-[0_10px_24px_rgba(249,115,22,0.14)]'
                          : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <Icon size={22} />
                      <span className="text-sm font-bold">{label}</span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </section>
          <section>
            <h2 className="mb-3 px-1 text-lg font-black text-slate-950">Notifications</h2>
            <Card className={sectionClassName}>
              <CardContent className="p-0">
                {notificationOptions.map(([key, label, description], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex min-h-[74px] items-center gap-4 border-b border-slate-100 px-4 last:border-b-0"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-orange-50 text-orange-500">
                      <Bell size={20} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-bold text-slate-900">{label}</span>
                      <span className="mt-1 block truncate text-[13px] text-slate-500">{description}</span>
                    </span>
                    <Switch
                      checked={toggles[key]}
                      onCheckedChange={(checked) => setToggles((current) => ({ ...current, [key]: checked }))}
                      aria-label={`${label} switch`}
                    />
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </section>
          <section>
            <h2 className="mb-3 px-1 text-lg font-black text-slate-950">Privacy & Security</h2>
            <Card className={sectionClassName}>
              <CardContent className="p-0">{renderRows(privacyRows)}</CardContent>
            </Card>
          </section>
          <section>
            <h2 className="mb-3 px-1 text-lg font-black text-slate-950">App</h2>
            <Card className={sectionClassName}>
              <CardContent className="p-0">{renderRows(appRows)}</CardContent>
            </Card>
          </section>
          <section>
            <h2 className="mb-3 px-1 text-lg font-black text-slate-950">Security</h2>
            <Card className={sectionClassName}>
              <CardContent className="p-0">{renderRows(securityRows)}</CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
};
