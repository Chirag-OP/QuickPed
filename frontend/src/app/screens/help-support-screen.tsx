import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Headphones,
  HelpCircle,
  Loader2,
  Mail,
  Megaphone,
  MessageSquare,
  Phone,
  Send,
  ShieldAlert,
  Star,
  ThumbsUp,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

interface HelpSupportScreenProps {
  onBack: () => void;
}

const SECURITY_NUMBERS = [
  { label: 'Security Guard (Main Gate)', phone: '7340992754' },
  { label: 'Security Guard (Academic)', phone: '7814838214' },
];

type FaqItem = { q: string; a: string };

const FAQS: FaqItem[] = [
  {
    q: 'How do I start a ride?',
    a: 'Go to the Home screen, tap "Start Ride", scan the QR code on any available QuickPed cycle, and your ride will begin automatically.',
  },
  {
    q: 'What if I forget to end a ride?',
    a: 'Your ride timer keeps running until you manually end it via the Active Ride screen. Contact support immediately if you face issues.',
  },
  {
    q: 'How do I add money to my wallet?',
    a: 'Go to Wallet from your profile or bottom navigation. Tap "Add Money", enter an amount, and proceed with your preferred payment method.',
  },
  {
    q: 'What happens if a cycle is damaged during my ride?',
    a: 'Report it immediately using the Report Issue button after ending your ride. The campus security team will be notified.',
  },
  {
    q: 'My wallet balance is not updating. What do I do?',
    a: 'Pull down to refresh the wallet screen. If the issue persists, contact support with your transaction ID at support@quickped.app.',
  },
  {
    q: 'Can I reserve a cycle in advance?',
    a: 'Yes! Tap "Reserve" on any available cycle from the Home screen dock view. Reservations are valid for 5 minutes.',
  },
  {
    q: 'What are the riding hours?',
    a: 'QuickPed cycles are available 24/7 on campus. However, peak hours (8 AM – 9 PM) have more cycles available at docks.',
  },
  {
    q: 'How are ride fares calculated?',
    a: 'Fares are time-based and set by your institution. You can view current rates in Settings → App → About QuickPed or ask your campus admin.',
  },
];

const REPORT_CATEGORIES = [
  'App / Technical Issue',
  'Billing / Wallet Problem',
  'Damaged Cycle',
  'Docking Issue',
  'Safety Concern',
  'Other',
];

export const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({ onBack }) => {
  // FAQ accordion
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Report dialog
  const [reportOpen, setReportOpen] = useState(false);
  const [reportSubject, setReportSubject] = useState('');
  const [reportCategory, setReportCategory] = useState(REPORT_CATEGORIES[0]);
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Feedback dialog
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHover, setFeedbackHover] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Toast
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => { setToast(msg); window.setTimeout(() => setToast(''), 3000); };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDescription.trim()) return;
    setReportSubmitting(true);
    window.setTimeout(() => {
      setReportSubmitting(false);
      setReportSuccess(true);
    }, 1800);
  };

  const handleReportClose = () => {
    setReportOpen(false);
    setReportSuccess(false);
    setReportSubject('');
    setReportDescription('');
    setReportCategory(REPORT_CATEGORIES[0]);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackRating === 0) return;
    setFeedbackSubmitting(true);
    window.setTimeout(() => {
      setFeedbackSubmitting(false);
      setFeedbackSuccess(true);
    }, 1500);
  };

  const handleFeedbackClose = () => {
    setFeedbackOpen(false);
    setFeedbackSuccess(false);
    setFeedbackRating(0);
    setFeedbackComment('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-10 transition-colors duration-200">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-14 left-1/2 z-[100] rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-xl dark:bg-slate-900 border border-slate-800">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-4xl px-4 py-5 sm:px-6">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <Button type="button" variant="ghost" size="icon" onClick={onBack}
            className="h-11 w-11 rounded-full bg-card text-orange-500 shadow-[0_8px_18px_rgba(0,0,0,0.04)] hover:bg-orange-500/10 border border-border">
            <ArrowLeft size={20} />
          </Button>
          <div className="rounded-full bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-600 dark:text-orange-400">Help & Support</div>
        </div>

        {/* Hero */}
        <section className="mb-5 rounded-[30px] bg-orange-100 dark:bg-orange-950/20 px-5 py-6 transition-colors duration-200">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-white dark:bg-slate-900 text-orange-500 shadow-[0_10px_24px_rgba(249,115,22,0.08)] border border-border">
              <BookOpen size={26} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase tracking-[3px] text-orange-700 dark:text-orange-400">Rider Care</p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950 dark:text-white">Help & Support</h1>
              <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">Professional support for rides, wallet, safety, and campus assistance.</p>
            </div>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            {
              icon: AlertTriangle, label: 'Report Issue', desc: 'Cycle, dock, or app problems',
              accent: 'bg-red-500/10 text-red-500', onClick: () => setReportOpen(true),
            },
            {
              icon: Star, label: 'Rate & Feedback', desc: 'Share your ride experience',
              accent: 'bg-amber-500/10 text-amber-500 dark:text-[#f59e0b]', onClick: () => setFeedbackOpen(true),
            },
            {
              icon: Mail, label: 'Email Support', desc: 'support@quickped.app',
              accent: 'bg-emerald-500/10 text-emerald-500 dark:text-[#10b981]',
              href: 'mailto:support@quickped.app',
            },
            {
              icon: MessageSquare, label: 'Live Chat', desc: 'Chat with our team',
              accent: 'bg-blue-500/10 text-blue-500 dark:text-[#3b82f6]',
              onClick: () => showToast('Live chat coming soon! Use email for now.'),
            },
            {
              icon: ShieldAlert, label: 'Emergency', desc: 'Urgent campus safety help',
              accent: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
              href: 'tel:7340992754',
            },
            {
              icon: Headphones, label: 'Contact Us', desc: 'QuickPed support team',
              accent: 'bg-violet-500/10 text-violet-500 dark:text-[#8b5cf6]',
              href: 'mailto:support@quickped.app',
            },
          ].map(({ icon: Icon, label, desc, accent, onClick, href }) => {
            const cls = `flex min-h-[100px] flex-col items-start gap-3 rounded-[24px] bg-card p-4 shadow-[0_12px_30px_rgba(0,0,0,0.01)] border border-border transition-transform active:scale-[0.98] hover:shadow-[0_16px_40px_rgba(0,0,0,0.04)] cursor-pointer text-left w-full`;
            const inner = (
              <>
                <span className={`flex h-11 w-11 items-center justify-center rounded-[16px] ${accent}`}>
                  <Icon size={20} />
                </span>
                <span>
                  <span className="block text-[14px] font-black leading-tight text-foreground">{label}</span>
                  <span className="mt-0.5 block text-[12px] font-medium text-muted-foreground">{desc}</span>
                </span>
              </>
            );
            if (href) return (
              <motion.a key={label} href={href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 }} className={cls}>
                {inner}
              </motion.a>
            );
            return (
              <motion.button key={label} type="button" onClick={onClick}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 }} className={cls}>
                {inner}
              </motion.button>
            );
          })}
        </section>

        {/* Security Contacts */}
        <section className="mb-5 rounded-[26px] bg-card p-4 shadow-[0_16px_40px_rgba(0,0,0,0.02)] border border-border transition-colors duration-200">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-red-500/10 text-red-500">
              <ShieldAlert size={20} />
            </span>
            <div>
              <h2 className="text-[16px] font-black text-foreground">Security Contacts</h2>
              <p className="text-[13px] text-muted-foreground">Call for urgent campus safety needs.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {SECURITY_NUMBERS.map((c) => (
              <a key={c.phone} href={`tel:${c.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-3 rounded-[20px] bg-orange-500/5 dark:bg-orange-950/10 border border-orange-500/10 dark:border-orange-950/20 px-4 py-4 transition-transform active:scale-[0.99]">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white dark:bg-slate-900 text-orange-500 shadow-sm">
                  <Phone size={19} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-muted-foreground">{c.label}</span>
                  <span className="block text-lg font-black text-foreground">{c.phone}</span>
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* FAQs Accordion */}
        <section className="mb-5">
          <div className="mb-3 flex items-center gap-2">
            <HelpCircle size={18} className="text-orange-500" />
            <h2 className="text-[17px] font-black text-foreground">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="overflow-hidden rounded-[20px] bg-card border border-border shadow-[0_8px_24px_rgba(0,0,0,0.01)] transition-colors duration-200">
                <button type="button" onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                  <span className="text-[14px] font-bold text-foreground">{faq.q}</span>
                  {expandedFaq === i
                    ? <ChevronUp size={18} className="shrink-0 text-orange-500" />
                    : <ChevronDown size={18} className="shrink-0 text-muted-foreground" />}
                </button>
                <AnimatePresence>
                  {expandedFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="overflow-hidden">
                      <p className="border-t border-border px-5 py-4 text-[13px] leading-relaxed text-muted-foreground">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Help Banner */}
        <section className="rounded-[26px] bg-slate-950 dark:bg-slate-900 border border-slate-900 dark:border-slate-800 p-5 text-white shadow-[0_16px_40px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white/10 text-orange-400">
              <Megaphone size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[16px] font-black leading-tight text-white">Need quick help?</h2>
              <p className="mt-1 text-[13px] font-medium text-white/70">
                Call security for urgent safety concerns. Use email or the Report Issue button for app or billing issues.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ── Report an Issue Dialog ── */}
      <Dialog open={reportOpen} onOpenChange={(o) => { if (!o) handleReportClose(); }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-3xl border border-border bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Report an Issue</DialogTitle>
            <DialogDescription>Let us know what went wrong and we'll get it fixed.</DialogDescription>
          </DialogHeader>

          {reportSuccess ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-8 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <ThumbsUp size={28} />
              </span>
              <p className="mt-4 text-lg font-black text-foreground">Report Submitted!</p>
              <p className="mt-2 text-sm text-muted-foreground">Our support team will review and respond within 24 hours.</p>
              <Button className="mt-6 w-full rounded-full bg-[#ee5f13] text-white hover:bg-[#d65a13]" onClick={handleReportClose}>
                Done
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleReportSubmit} className="space-y-4 pt-1">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-muted-foreground">Category</label>
                <div className="flex flex-wrap gap-2">
                  {REPORT_CATEGORIES.map((cat) => (
                    <button key={cat} type="button" onClick={() => setReportCategory(cat)}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                        reportCategory === cat
                          ? 'bg-orange-500 text-white shadow-[0_4px_12px_rgba(249,115,22,0.15)]'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-muted-foreground">Subject</label>
                <Input value={reportSubject} onChange={(e) => setReportSubject(e.target.value)}
                  placeholder="e.g. Cycle QR not scanning" className="rounded-xl animate-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-muted-foreground">Description *</label>
                <Textarea value={reportDescription} onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Describe the issue in detail…" rows={4} required
                  className="rounded-xl resize-none min-h-16 w-full" />
              </div>
              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={handleReportClose}>Cancel</Button>
                <Button type="submit" disabled={reportSubmitting}
                  className="flex-1 rounded-full bg-[#ee5f13] text-white hover:bg-[#d65a13] disabled:opacity-60">
                  {reportSubmitting ? (
                    <><Loader2 size={16} className="mr-2 animate-spin" />Sending…</>
                  ) : (
                    <><Send size={16} className="mr-2" />Submit Report</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Feedback Dialog ── */}
      <Dialog open={feedbackOpen} onOpenChange={(o) => { if (!o) handleFeedbackClose(); }}>
        <DialogContent className="rounded-3xl border border-border bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Rate Your Experience</DialogTitle>
            <DialogDescription>Your feedback helps us improve QuickPed.</DialogDescription>
          </DialogHeader>

          {feedbackSuccess ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-8 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                <Star size={28} fill="currentColor" />
              </span>
              <p className="mt-4 text-lg font-black text-foreground">Thanks for your feedback!</p>
              <p className="mt-2 text-sm text-muted-foreground">We appreciate you taking the time to rate QuickPed.</p>
              <Button className="mt-6 w-full rounded-full bg-[#ee5f13] text-white hover:bg-[#d65a13]" onClick={handleFeedbackClose}>
                Close
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-5 pt-1">
              {/* Star Rating */}
              <div>
                <label className="mb-3 block text-xs font-bold text-muted-foreground">Tap to rate</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button"
                      onMouseEnter={() => setFeedbackHover(star)}
                      onMouseLeave={() => setFeedbackHover(0)}
                      onClick={() => setFeedbackRating(star)}
                      className="transition-transform hover:scale-110 active:scale-95">
                      <Star size={36}
                        className={star <= (feedbackHover || feedbackRating) ? 'text-amber-400' : 'text-muted-foreground/30'}
                        fill={star <= (feedbackHover || feedbackRating) ? 'currentColor' : 'none'}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
                {feedbackRating > 0 && (
                  <p className="mt-2 text-center text-sm font-bold text-amber-600 dark:text-[#f59e0b]">
                    {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][feedbackRating]}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-muted-foreground">Additional Comments (optional)</label>
                <Textarea value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Tell us more about your experience…" rows={3}
                  className="rounded-xl resize-none min-h-16 w-full" />
              </div>
              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={handleFeedbackClose}>Cancel</Button>
                <Button type="submit" disabled={feedbackRating === 0 || feedbackSubmitting}
                  className="flex-1 rounded-full bg-[#ee5f13] text-white hover:bg-[#d65a13] disabled:opacity-50">
                  {feedbackSubmitting ? (
                    <><Loader2 size={16} className="mr-2 animate-spin" />Submitting…</>
                  ) : (
                    'Submit Feedback'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
