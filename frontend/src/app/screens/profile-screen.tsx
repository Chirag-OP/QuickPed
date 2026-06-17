import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  CheckCircle,
  ChevronRight,
  FileText,
  GraduationCap,
  HelpCircle,
  LogOut,
  Phone,
  Plus,
  Shield,
  User,
  Wallet,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { NotificationBell } from '../components/notification-bell';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../lib/utils';
import quickPedLogo from '../../assets/logo.jpeg';

interface ProfileScreenProps {
  onBack: () => void;
  onAddMoney: () => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack, onAddMoney, onLogout }) => {
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
  const instituteName = selectedInstitute || (user?.campusId ? 'Campus Enrolled' : 'None');

  const menuItems = [
    { icon: Bell, label: 'Notifications', description: 'Manage notification preferences', action: () => {} },
    { icon: Shield, label: 'Privacy & Security', description: 'Account security settings', action: () => {} },
    { icon: HelpCircle, label: 'Help & Support', description: 'Get help and contact support', action: () => {} },
    { icon: FileText, label: 'Terms & Conditions', description: 'Read our terms and policies', action: () => {} },
  ];

  const handleLogout = () => {
    setIsConfirmOpen(false);
    onLogout();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="rounded-b-3xl bg-gradient-to-r from-orange-500 to-orange-600 p-6 pb-16">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/25"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="flex items-center gap-3">
            <img src={quickPedLogo} alt="QuickPed" className="h-11 w-24 object-contain mix-blend-multiply" />
            <NotificationBell className="border-0 bg-white/20 text-white shadow-none hover:bg-white/30" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mb-4 inline-block">
            <img src={quickPedLogo} alt="QuickPed" className="mx-auto h-24 w-44 object-contain mix-blend-multiply" />
          </div>

          <h1 className="mb-1 text-2xl font-bold text-white">
            {user?.name ?? 'Guest User'}
          </h1>
          <Badge className="mb-2 border-white/40 bg-white/20 text-white">
            {user?.role === 'VERIFIED_RIDER' ? 'Verified Rider' : 'Regular Rider'}
          </Badge>
          <p className="text-sm text-white/80">{instituteName}</p>
        </motion.div>
      </div>

      <div className="-mt-8 space-y-6 px-6">
        {user ? (
          <Card variant="elevated" className="rounded-3xl border-0 shadow-xl shadow-slate-200/80">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3">
                <Phone className="text-primary flex-shrink-0" size={20} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Phone Number</p>
                  <p className="truncate font-semibold">{user.phoneNumber}</p>
                </div>
                <CheckCircle className="text-orange-500 flex-shrink-0" size={18} />
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3">
                <User className="text-primary flex-shrink-0" size={20} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Full Name</p>
                  <p className="truncate font-semibold">{user.name}</p>
                </div>
                <CheckCircle className="text-orange-500 flex-shrink-0" size={18} />
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3">
                <GraduationCap className="text-primary flex-shrink-0" size={20} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Institute</p>
                  <p className="truncate font-semibold">{instituteName}</p>
                </div>
                <CheckCircle className="text-orange-500 flex-shrink-0" size={18} />
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-orange-50 p-3">
                <Wallet className="text-orange-600 flex-shrink-0" size={20} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wide text-orange-700">Wallet Balance</p>
                  <p className="truncate font-semibold">{formatCurrency(user.walletBalance)}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={onAddMoney}
                  className="h-10 rounded-xl bg-orange-500 px-3 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 active:scale-[0.98]"
                >
                  <Plus size={16} />
                  Add Money
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <AlertCircle size={20} />
                <p className="text-sm">No profile information found. Please log in again.</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card variant="elevated" className="rounded-3xl border-0 shadow-xl shadow-slate-200/70">
          <CardContent className="p-4">
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={item.action}
                  className="group flex w-full items-center gap-4 rounded-xl p-4 transition-colors hover:bg-orange-50"
                >
                  <div className="rounded-lg bg-orange-100 p-2">
                    <item.icon className="text-orange-600" size={20} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="text-muted-foreground transition-colors group-hover:text-orange-600" size={20} />
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          size="lg"
          className="w-full border-2 border-danger/50 text-danger hover:bg-danger hover:text-white"
          onClick={() => setIsConfirmOpen(true)}
        >
          <LogOut size={20} className="mr-2" />
          Logout
        </Button>

        <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Logout</DialogTitle>
              <DialogDescription>Are you sure you want to log out?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
              <Button onClick={handleLogout}>Yes, Logout</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <p className="text-center text-sm text-muted-foreground">QuickPed v1.0.0</p>
      </div>
    </div>
  );
};
