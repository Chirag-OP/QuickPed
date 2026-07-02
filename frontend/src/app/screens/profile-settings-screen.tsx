import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Bell,
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
  UserRound,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../components/theme-provider';

interface ProfileSettingsScreenProps {
  onBack: () => void;
}

const sectionCard = 'rounded-[26px] border border-border bg-card text-card-foreground shadow-[0_16px_40px_rgba(0,0,0,0.03)] overflow-hidden transition-colors duration-200';

export const ProfileSettingsScreen: React.FC<ProfileSettingsScreenProps> = ({ onBack }) => {
  const { user, updateProfile, logout } = useAuth();
  const { theme: appTheme, setTheme } = useTheme();

  // ── Profile edit state ──
  const [profileData, setProfileData] = useState(() => {
    try {
      const saved = localStorage.getItem('qp_user_profile');
      const p = saved ? JSON.parse(saved) : {};
      return {
        name: p.name || user?.name || '',
        phone: p.phone || user?.phoneNumber || '',
        institution: p.institution || 'IIT Ropar',
      };
    } catch {
      return { name: user?.name || '', phone: user?.phoneNumber || '', institution: 'IIT Ropar' };
    }
  });

  // ── Language state ──
  const [language, setLanguage] = useState(() => localStorage.getItem('qp_app_language') || 'English');

  // ── Notification + privacy toggles ──
  const [toggles, setToggles] = useState({
    ride: true, wallet: true, promo: false, push: true, email: false,
    dataSharing: false, location: true,
  });
  const toggle = (key: keyof typeof toggles) => setToggles(c => ({ ...c, [key]: !c[key] }));

  // ── Dialog state ──
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const openDlg  = (name: string) => setOpenDialog(name);
  const closeDlg = () => setOpenDialog(null);

  // ── Edit Profile form ──
  const [tempName, setTempName] = useState(profileData.name);
  const [tempPhone, setTempPhone] = useState(profileData.phone);
  const [tempInstitution, setTempInstitution] = useState(profileData.institution);

  const [toast, setToast] = useState('');
  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 3000);
  };

  // ── Handlers ──
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(tempName, tempInstitution);
      const updated = { name: tempName, phone: tempPhone, institution: tempInstitution };
      localStorage.setItem('qp_user_profile', JSON.stringify(updated));
      setProfileData(updated);
      closeDlg();
      showToast('Profile updated successfully!');
    } catch {
      showToast('Could not update profile. Try again.');
    }
  };

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('qp_app_language', lang);
    closeDlg();
    showToast(`Language set to ${lang}`);
  };

  const handleLogout = () => { closeDlg(); logout(); };
  const handleDeleteAccount = () => { closeDlg(); logout(); };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QuickPed Bicycles',
          text: 'Ride smart across the campus with QuickPed!',
          url: window.location.origin,
        });
      } catch {
        showToast('Shared successfully!');
      }
    } else {
      showToast('Sharing link copied to clipboard!');
      navigator.clipboard.writeText(window.location.origin);
    }
  };

  // ── Reusable Row ──
  const Row = ({
    icon: Icon, label, description, isDanger, onClick, rightEl,
  }: {
    icon: React.ElementType; label: string; description?: string; isDanger?: boolean;
    onClick?: () => void; rightEl?: React.ReactNode;
  }) => (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={`flex min-h-[74px] items-center gap-4 border-b border-border px-4 last:border-b-0 transition-colors ${
        onClick ? 'cursor-pointer hover:bg-orange-500/5 dark:hover:bg-orange-950/10' : ''
      }`}
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] transition-colors ${
        isDanger 
          ? 'bg-red-500/10 text-red-500' 
          : 'bg-orange-500/10 text-orange-500'
      }`}>
        <Icon size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-[15px] font-bold transition-colors ${isDanger ? 'text-red-500' : 'text-foreground'}`}>{label}</span>
        {description && <span className="mt-0.5 block truncate text-[13px] text-muted-foreground transition-colors">{description}</span>}
      </span>
      {rightEl ?? (onClick && <ChevronRight size={18} className={isDanger ? 'text-red-500/40' : 'text-muted-foreground/40'} />)}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-16 transition-colors duration-200">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-14 left-1/2 z-[100] rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-xl dark:bg-slate-900 border border-slate-800"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <Button type="button" variant="ghost" size="icon" onClick={onBack}
            className="h-11 w-11 rounded-full bg-card text-orange-500 shadow-[0_8px_18px_rgba(0,0,0,0.04)] hover:bg-orange-500/10 border border-border">
            <ArrowLeft size={20} />
          </Button>
          <div className="rounded-full bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-600 dark:text-orange-400">Settings</div>
        </div>

        {/* Hero banner */}
        <section className="mb-6 rounded-[30px] bg-orange-100 dark:bg-orange-950/20 px-5 py-6 transition-colors duration-200">
          <p className="text-sm font-bold uppercase tracking-[3px] text-orange-700 dark:text-orange-400">QuickPed Profile</p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-slate-950 dark:text-white">Settings</h1>
          <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">Manage your account, appearance, notifications, and privacy.</p>
        </section>

        <div className="space-y-5">
          {/* Account */}
          <section>
            <h2 className="mb-3 px-1 text-[17px] font-black text-foreground">Account</h2>
            <Card className={sectionCard}>
              <CardContent className="p-0">
                <Row icon={UserRound} label="Edit Profile"
                  description={`${profileData.name} · ${profileData.institution}`}
                  onClick={() => { setTempName(profileData.name); setTempPhone(profileData.phone); setTempInstitution(profileData.institution); openDlg('edit-profile'); }} />
              </CardContent>
            </Card>
          </section>

          {/* Appearance */}
          <section>
            <h2 className="mb-3 px-1 text-[17px] font-black text-foreground">Appearance</h2>
            <Card className={sectionCard}>
              <CardContent className="grid grid-cols-2 gap-3 p-4">
                {([
                  { id: 'light', label: 'Light Mode', Icon: Sun },
                  { id: 'dark',  label: 'Dark Mode',  Icon: Moon },
                ] as const).map(({ id, label, Icon }) => {
                  const active = appTheme === id;
                  return (
                    <button key={id} type="button"
                      onClick={() => setTheme(id)}
                      className={`flex min-h-[90px] flex-col items-start justify-between rounded-[20px] border p-4 transition-all duration-200 ${
                        active
                          ? 'border-orange-500 bg-orange-500/10 text-orange-500 shadow-[0_10px_24px_rgba(249,115,22,0.1)]'
                          : 'border-border bg-muted/40 text-muted-foreground hover:bg-card hover:text-foreground'
                      }`}
                    >
                      <Icon size={22} className="transition-colors duration-200" />
                      <span className="text-sm font-bold transition-colors duration-200">{label}</span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </section>

          {/* Notification Preferences */}
          <section>
            <h2 className="mb-3 px-1 text-[17px] font-black text-foreground">Notification Preferences</h2>
            <Card className={sectionCard}>
              <CardContent className="p-0">
                {([
                  ['ride',   'Ride Notifications',        'Starts, completions, reservations'],
                  ['wallet', 'Wallet Notifications',       'Top-ups and low balance alerts'],
                  ['promo',  'Promotional Notifications',  'Offers, discounts, and events'],
                  ['push',   'Push Notifications',         'Mobile push alerts'],
                  ['email',  'Email Notifications',        'Updates delivered to email'],
                ] as const).map(([key, label, description]) => (
                  <div key={key} className="flex min-h-[70px] items-center gap-4 border-b border-border px-4 last:border-b-0">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-orange-500/10 text-orange-500">
                      <Bell size={19} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-bold text-foreground">{label}</span>
                      <span className="block text-[12px] text-muted-foreground">{description}</span>
                    </span>
                    <Switch checked={toggles[key]} onCheckedChange={() => toggle(key)} aria-label={label} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* Privacy & Security */}
          <section>
            <h2 className="mb-3 px-1 text-[17px] font-black text-foreground">Privacy & Security</h2>
            <Card className={sectionCard}>
              <CardContent className="p-0">
                <Row icon={Shield} label="Privacy Policy" description="How QuickPed protects your data"
                  onClick={() => openDlg('privacy-policy')} />
                <Row icon={FileText} label="Terms & Conditions" description="Usage policies and ride terms"
                  onClick={() => openDlg('terms-conditions')} />
                <Row icon={Globe2} label="Data Sharing" description="Allow anonymous service improvement analytics"
                  rightEl={<Switch checked={toggles.dataSharing} onCheckedChange={() => toggle('dataSharing')} aria-label="Data sharing" />} />
                <Row icon={Globe2} label="Location Permission" description="Enable real-time dock & cycle tracking"
                  rightEl={<Switch checked={toggles.location} onCheckedChange={() => toggle('location')} aria-label="Location" />} />
              </CardContent>
            </Card>
          </section>

          {/* App */}
          <section>
            <h2 className="mb-3 px-1 text-[17px] font-black text-foreground">App</h2>
            <Card className={sectionCard}>
              <CardContent className="p-0">
                <Row icon={Languages} label="Language" description={language} onClick={() => openDlg('language')} />
                <Row icon={Star}      label="Rate App" description="Share your QuickPed experience"
                  onClick={() => showToast('Thanks for your support! ⭐')} />
                <Row icon={Share2}    label="Share App" description="Invite friends to ride smarter"
                  onClick={handleShare} />
                <Row icon={RefreshCcw} label="Check for Updates" description="You are on the latest version (v1.0.0)"
                  onClick={() => showToast('QuickPed is up to date ✓')} />
                <Row icon={FileText}  label="About QuickPed" description="Campus mobility made simple"
                  onClick={() => openDlg('about')} />
                <Row icon={Smartphone} label="App Version" description="QuickPed v1.0.0" />
              </CardContent>
            </Card>
          </section>

          {/* Session / Danger Zone */}
          <section>
            <h2 className="mb-3 px-1 text-[17px] font-black text-foreground">Session</h2>
            <Card className={sectionCard}>
              <CardContent className="p-0">
                <Row icon={LogOut} label="Log Out" description="End your current session" isDanger
                  onClick={() => openDlg('logout')} />
                <Row icon={Trash2} label="Delete Account" description="Permanently remove your account" isDanger
                  onClick={() => openDlg('delete-account')} />
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      {/* ── DIALOGS ── */}

      {/* Edit Profile */}
      <Dialog open={openDialog === 'edit-profile'} onOpenChange={(o) => !o && closeDlg()}>
        <DialogContent className="rounded-3xl border border-border bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Profile</DialogTitle>
            <DialogDescription>Update your QuickPed display details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-muted-foreground">Full Name</label>
              <Input value={tempName} onChange={(e) => setTempName(e.target.value)} required className="rounded-xl" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-muted-foreground">Phone Number</label>
              <Input value={tempPhone} onChange={(e) => setTempPhone(e.target.value)} className="rounded-xl" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-muted-foreground">Campus / Institute</label>
              <Input value={tempInstitution} onChange={(e) => setTempInstitution(e.target.value)} required className="rounded-xl" />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={closeDlg}>Cancel</Button>
              <Button type="submit" className="flex-1 rounded-full bg-[#ee5f13] hover:bg-[#d65a13] text-white">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Language */}
      <Dialog open={openDialog === 'language'} onOpenChange={(o) => !o && closeDlg()}>
        <DialogContent className="rounded-3xl border border-border bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Select Language</DialogTitle>
            <DialogDescription>Choose your preferred app language.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            {['English', 'Hindi', 'Punjabi', 'Tamil', 'Telugu'].map((lang) => (
              <button key={lang} type="button" onClick={() => handleLanguageSelect(lang)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${
                  language === lang
                    ? 'border-[#ee5f13] bg-orange-500/10 font-bold text-orange-500'
                    : 'border-border text-foreground hover:bg-muted'
                }`}
              >
                <span>{lang}</span>
                {language === lang && <span className="text-orange-500">✓</span>}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy */}
      <Dialog open={openDialog === 'privacy-policy'} onOpenChange={(o) => !o && closeDlg()}>
        <DialogContent className="max-h-[75vh] overflow-y-auto rounded-3xl border border-border bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Privacy Policy</DialogTitle>
            <DialogDescription>Last updated: June 2026</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2 text-sm leading-relaxed text-muted-foreground">
            <p><strong className="text-foreground">1. Data We Collect</strong><br />We collect your name, phone number, institutional email, and real-time GPS location to manage rides, verify campus affiliation, and process payments securely.</p>
            <p><strong className="text-foreground">2. Ride Tracking</strong><br />Cycle GPS coordinates are recorded during active rides to ensure vehicle safety. This data is only accessible to authorized campus administrators.</p>
            <p><strong className="text-foreground">3. Analytics</strong><br />Anonymous usage analytics may be analyzed to improve routing, optimize dock placement, and enhance the app experience.</p>
            <p><strong className="text-foreground">4. Data Retention</strong><br />Your ride history is retained for 12 months. Account data is deleted within 30 days of account deletion request.</p>
          </div>
          <DialogFooter className="pt-4">
            <Button className="w-full rounded-full bg-[#ee5f13] hover:bg-[#d65a13] text-white" onClick={closeDlg}>I Understand</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terms & Conditions */}
      <Dialog open={openDialog === 'terms-conditions'} onOpenChange={(o) => !o && closeDlg()}>
        <DialogContent className="max-h-[75vh] overflow-y-auto rounded-3xl border border-border bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Terms & Conditions</DialogTitle>
            <DialogDescription>Last updated: June 2026</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2 text-sm leading-relaxed text-muted-foreground">
            <p><strong className="text-foreground">1. Eligibility</strong><br />You must be an active student, staff member, or registered guest of the campus to use QuickPed cycles.</p>
            <p><strong className="text-foreground">2. Safe Operation</strong><br />Riders are responsible for their own safety and must observe campus speed limits. Helmet usage is strongly advised.</p>
            <p><strong className="text-foreground">3. Docking</strong><br />Always lock and dock cycles securely at designated QuickPed stations. Failure to dock correctly will result in extended billing.</p>
            <p><strong className="text-foreground">4. Billing</strong><br />Ride fares are automatically deducted from your wallet based on the current pricing configured for your institution.</p>
            <p><strong className="text-foreground">5. Damage & Loss</strong><br />Users are liable for any damage caused during their active ride. Report damage immediately via the app.</p>
          </div>
          <DialogFooter className="pt-4">
            <Button className="w-full rounded-full bg-[#ee5f13] hover:bg-[#d65a13] text-white" onClick={closeDlg}>Accept & Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* About */}
      <Dialog open={openDialog === 'about'} onOpenChange={(o) => !o && closeDlg()}>
        <DialogContent className="rounded-3xl border border-border bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">About QuickPed</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2 text-center text-sm text-muted-foreground">
            <p className="text-lg font-black text-[#ee5f13]">Smart Campus Mobility 🚲</p>
            <p>QuickPed is an eco-friendly e-cycle sharing system built for seamless campus commutes — from hostels to classrooms, labs to libraries.</p>
            <p className="text-xs text-muted-foreground/60 pt-2">© 2026 QuickPed Technologies. All rights reserved.<br />Version 1.0.0 · Build 2026.06</p>
          </div>
          <DialogFooter className="pt-4">
            <Button className="w-full rounded-full bg-[#ee5f13] hover:bg-[#d65a13] text-white" onClick={closeDlg}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Confirm */}
      <Dialog open={openDialog === 'logout'} onOpenChange={(o) => !o && closeDlg()}>
        <DialogContent className="rounded-3xl border border-border bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Log Out?</DialogTitle>
            <DialogDescription>You will be signed out of your current QuickPed session.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" className="flex-1 rounded-full" onClick={closeDlg}>Cancel</Button>
            <Button className="flex-1 rounded-full bg-red-600 hover:bg-red-700 text-white" onClick={handleLogout}>Yes, Log Out</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirm */}
      <Dialog open={openDialog === 'delete-account'} onOpenChange={(o) => !o && closeDlg()}>
        <DialogContent className="rounded-3xl border border-border bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600">Delete Account</DialogTitle>
            <DialogDescription>This is irreversible. All wallet balance, ride history, and profile data will be permanently lost.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" className="flex-1 rounded-full" onClick={closeDlg}>Cancel</Button>
            <Button className="flex-1 rounded-full bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteAccount}>Delete Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
