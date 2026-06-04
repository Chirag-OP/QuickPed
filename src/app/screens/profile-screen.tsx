import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  User,
  Mail,
  Phone,
  Shield,
  Bell,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  CheckCircle
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

interface ProfileScreenProps {
  onBack: () => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack, onLogout }) => {
  const user = {
    name: 'Gurpreet Singh',
    email: 'gurpreetsingh@iitropar.ac.in',
    phone: '+91 7340992754',
    verified: true,
    memberSince: 'June 2026',
    totalRides: 12
  };

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const menuItems = [
    {
      icon: Bell,
      label: 'Notifications',
      description: 'Manage notification preferences',
      action: () => {}
    },
    {
      icon: Shield,
      label: 'Privacy & Security',
      description: 'Account security settings',
      action: () => {}
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      description: 'Get help and contact support',
      action: () => {}
    },
    {
      icon: FileText,
      label: 'Terms & Conditions',
      description: 'Read our terms and policies',
      action: () => {}
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-6 pb-16 rounded-b-3xl">
        <button onClick={onBack} className="text-white mb-6">
          ← Back
        </button>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
              <User size={48} className="text-primary" />
            </div>
            {user.verified && (
              <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-1">
                <CheckCircle size={20} className="text-white" />
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">{user.name}</h1>
          <Badge className="bg-white/20 text-white border-white/40 mb-2">
            {user.verified ? 'Verified Rider' : 'Regular Rider'}
          </Badge>
          <p className="text-white/80 text-sm">Member since {user.memberSince}</p>
        </motion.div>
      </div>

      <div className="px-6 -mt-8 space-y-6">
        {/* Contact Information */}
        <Card variant="elevated">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
              <Mail className="text-primary" size={20} />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              {user.verified && <CheckCircle className="text-success" size={20} />}
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
              <Phone className="text-primary" size={20} />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{user.phone}</p>
              </div>
              <CheckCircle className="text-success" size={20} />
            </div>
          </CardContent>
        </Card>

        {/* Settings Menu */}
        <Card variant="elevated">
          <CardContent className="p-4">
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={item.action}
                  className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors group"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <item.icon className="text-primary" size={24} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight
                    className="text-muted-foreground group-hover:text-foreground transition-colors"
                    size={20}
                  />
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
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
              <DialogDescription>
                Are you sure you want to log out?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsConfirmOpen(false)}
              >
                No
              </Button>
              <Button
                onClick={() => {
                  setIsConfirmOpen(false);
                  onLogout();
                }}
              >
                Yes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* App Version */}
        <p className="text-center text-sm text-muted-foreground">
          QuickPed v1.0.0
        </p>
      </div>
    </div>
  );
};
