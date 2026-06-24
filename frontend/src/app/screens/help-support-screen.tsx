import React from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Headphones,
  HelpCircle,
  Mail,
  Megaphone,
  Phone,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../components/ui/button';

interface HelpSupportScreenProps {
  onBack: () => void;
}

const securityNumbers = [
  { label: 'Security Guard', phone: '7340992754' },
  { label: 'Security Guard', phone: '78148 38214' },
];

const supportActions = [
  {
    label: 'Call Security Guard',
    description: 'Reach campus security immediately',
    icon: Phone,
    accent: 'bg-orange-50 text-orange-500',
    href: 'tel:7340992754',
  },
  {
    label: 'Report an Issue',
    description: 'Share cycle, dock, or ride concerns',
    icon: AlertTriangle,
    accent: 'bg-red-50 text-red-500',
  },
  {
    label: 'Contact Support',
    description: 'Get help from the QuickPed team',
    icon: Headphones,
    accent: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'FAQs',
    description: 'Answers for common rider questions',
    icon: HelpCircle,
    accent: 'bg-violet-50 text-violet-600',
  },
  {
    label: 'Email Support',
    description: 'Send details to support by email',
    icon: Mail,
    accent: 'bg-emerald-50 text-emerald-600',
    href: 'mailto:support@quickped.app',
  },
  {
    label: 'Emergency Help',
    description: 'Use for urgent safety situations',
    icon: ShieldAlert,
    accent: 'bg-amber-50 text-amber-600',
    href: 'tel:7340992754',
  },
];

export const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#f7f6f3] pb-10">
      <main className="mx-auto max-w-4xl px-4 py-5 sm:px-6">
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
          <div className="rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-orange-600">Help & Support</div>
        </div>

        <section className="mb-5 rounded-[30px] bg-[#ffdfbd] px-5 py-6">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-white text-orange-500 shadow-[0_10px_24px_rgba(249,115,22,0.12)]">
              <BookOpen size={26} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase tracking-[3px] text-orange-700">Rider Care</p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950">Help & Support</h1>
              <p className="mt-2 text-sm font-medium text-slate-600">Professional support for rides, wallet, safety, and campus assistance.</p>
            </div>
          </div>
        </section>

        <section className="mb-5 rounded-[26px] bg-white p-4 shadow-[0_16px_40px_rgba(31,31,31,0.06)]">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-red-50 text-red-500">
              <ShieldAlert size={21} />
            </span>
            <div>
              <h2 className="text-lg font-black leading-tight text-slate-950">Security Guard Contacts</h2>
              <p className="text-sm font-medium text-slate-500">Use these contacts for urgent campus safety needs.</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {securityNumbers.map((contact) => (
              <a
                key={contact.phone}
                href={`tel:${contact.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-3 rounded-[20px] bg-[#fff7ed] px-4 py-4 text-slate-950 transition-transform active:scale-[0.99]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-orange-500">
                  <Phone size={19} />
                </span>
                <span>
                  <span className="block text-sm font-bold text-slate-500">{contact.label}</span>
                  <span className="block text-lg font-black">{contact.phone}</span>
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          {supportActions.map((action, index) => {
            const Icon = action.icon;
            const content = (
              <>
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] ${action.accent}`}>
                  <Icon size={22} />
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-[15px] font-black leading-tight text-slate-950">{action.label}</span>
                  <span className="mt-1 block text-[13px] font-medium leading-5 text-slate-500">{action.description}</span>
                </span>
              </>
            );

            if (action.href) {
              return (
                <motion.a
                  key={action.label}
                  href={action.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="flex min-h-[88px] items-center gap-4 rounded-[24px] bg-white p-4 shadow-[0_12px_30px_rgba(31,31,31,0.05)] transition-transform active:scale-[0.99]"
                >
                  {content}
                </motion.a>
              );
            }

            return (
              <motion.button
                key={action.label}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="flex min-h-[88px] items-center gap-4 rounded-[24px] bg-white p-4 shadow-[0_12px_30px_rgba(31,31,31,0.05)] transition-transform active:scale-[0.99]"
              >
                {content}
              </motion.button>
            );
          })}
        </section>

        <section className="mt-5 rounded-[26px] bg-slate-950 p-5 text-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white/10 text-orange-300">
              <Megaphone size={21} />
            </span>
            <div>
              <h2 className="text-lg font-black leading-tight">Need quick help?</h2>
              <p className="mt-1 text-sm font-medium text-white/70">Call security for safety concerns and use support for app or wallet issues.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
