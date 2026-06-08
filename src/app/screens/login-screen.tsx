import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Bike, LayoutDashboard, Phone, ShieldCheck, Loader2, Search, GraduationCap, User, CheckCircle2, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { NotificationBell } from '../components/notification-bell';

const STORAGE_KEY = 'qp_user_profile';

const IIT_LIST = [
  'IIT Bhubaneswar', 'IIT Bombay', 'IIT Mandi', 'IIT Delhi', 'IIT Indore',
  'IIT Kharagpur', 'IIT Hyderabad', 'IIT Jodhpur', 'IIT Kanpur', 'IIT Madras',
  'IIT Gandhinagar', 'IIT Patna', 'IIT Roorkee', 'IIT Ropar', 'IIT Guwahati',
  'IIT Jammu', 'IIT Dharwad', 'IIT Goa', 'IIT Bhilai', 'IIT Tirupati',
  'IIT Palakkad', 'IIT Dhanbad (ISM)', 'IIT (BHU) Varanasi',
];

// ── Admin credentials ────────────────────────────────────────────────────────
const ADMIN_CREDENTIALS: Record<string, { password: string; name: string }> = {
  'parth#rpr@quickped.in': { password: 'parth_+1', name: 'Parth Bansal' },
  'chirag#rpr@quickped.in': { password: 'chirag#_+', name: 'Chirag' },
  'arshpreet#rpr@quickped.in': { password: 'arsh_+#1', name: 'Arshpreet' },
};

export type AdminKey = 'parth' | 'chirag' | 'arshpreet';

interface LoginScreenProps {
  initialMode?: 'choice' | 'user' | 'admin';
  onUserLoginSuccess: () => void;
  onAdminLoginSuccess: (adminKey: AdminKey) => void;
  onAdminGoogleLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  initialMode = 'choice',
  onUserLoginSuccess,
  onAdminLoginSuccess,
  onAdminGoogleLogin,
}) => {
  const [screen, setScreen] = useState<'choice' | 'user' | 'admin'>(initialMode);
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [showInstitutionDropdown, setShowInstitutionDropdown] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const loadingTimer = useRef<number | null>(null);

  useEffect(() => {
    setScreen(initialMode);
    setStep('phone');
    setError('');
    setIsLoading(false);
    setAdminId('');
    setAdminPassword('');
  }, [initialMode]);

  useEffect(() => {
    return () => {
      if (loadingTimer.current) window.clearTimeout(loadingTimer.current);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowInstitutionDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Phone: only digits, max 10
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(val);
    setError('');
  };

  const handleUserPhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Please enter your mobile number.');
      return;
    }
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setError('');
    setStep('otp');
  };

  const handleUserOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the OTP.');
      return;
    }
    // Hardcoded OTP check
    if (otp !== '1234') {
      setError('Incorrect OTP. Please try again.');
      return;
    }
    setError('');
    setIsLoading(true);
    loadingTimer.current = window.setTimeout(() => {
      setIsLoading(false);
      // Check if profile already exists in localStorage
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.name && parsed.institution) {
            // Profile complete — go straight to home
            onUserLoginSuccess();
            return;
          }
        } catch { /* ignore */ }
      }
      // No profile yet — show profile setup
      setStep('profile');
    }, 800);
  };

  const filteredIITs = IIT_LIST.filter(iit =>
    iit.toLowerCase().includes(institutionSearch.toLowerCase())
  );

  const handleSelectInstitution = (iit: string) => {
    setInstitution(iit);
    setInstitutionSearch(iit);
    setShowInstitutionDropdown(false);
    setError('');
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!institution) {
      setError('Please select your institution.');
      return;
    }
    setError('');
    setIsLoading(true);
    // Save to localStorage
    const profileData = { phone, name: name.trim(), institution };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));
    loadingTimer.current = window.setTimeout(() => {
      setIsLoading(false);
      onUserLoginSuccess();
    }, 600);
  };

  // ── Admin auth ──────────────────────────────────────────────────────────────
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = adminId.trim();
    const trimmedPwd = adminPassword.trim();

    if (!trimmedId || !trimmedPwd) {
      setError('Provide both Admin ID and Password.');
      return;
    }

    // Step 1: Check if ID exists
    const cred = ADMIN_CREDENTIALS[trimmedId];
    if (!cred) {
      setError('Invalid Admin ID');
      return;
    }

    // Step 2: Check password
    if (trimmedPwd !== cred.password) {
      setError('Incorrect Password');
      return;
    }

    // All good → determine adminKey
    setError('');
    setIsLoading(true);
    if (loadingTimer.current) window.clearTimeout(loadingTimer.current);
    loadingTimer.current = window.setTimeout(() => {
      setIsLoading(false);
      let adminKey: AdminKey = 'parth';
      if (trimmedId.startsWith('chirag')) adminKey = 'chirag';
      else if (trimmedId.startsWith('arshpreet')) adminKey = 'arshpreet';
      onAdminLoginSuccess(adminKey);
    }, 750);
  };

  const handleAdminGoogle = () => {
    setIsLoading(false);
    setError('Use an approved Admin ID and Password to continue.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col">
      <div className="bg-gradient-to-r from-primary to-secondary p-6 pb-16">
        <div className="max-w-md mx-auto">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 text-white">
              <Bike size={40} />
              <h1 className="text-3xl font-bold">QuickPed</h1>
            </div>
            <NotificationBell className="border-0 bg-white/20 text-white shadow-none hover:bg-white/30" />
          </div>
          <p className="text-white/90">Choose how you want to access the app.</p>
        </div>
      </div>

      <div className="flex-1 -mt-8 px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <Card variant="elevated" className="p-8">
            {/* ── CHOICE ── */}
            {screen === 'choice' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-semibold mb-2">Sign in to QuickPed</h2>
                  <p className="text-muted-foreground">Select the login type that fits your role.</p>
                </div>
                <div className="space-y-4">
                  <Button type="button" size="lg" className="w-full justify-between" onClick={() => setScreen('user')}>
                    <span className="flex items-center gap-2"><Phone size={20} /> User Sign In</span>
                    <ArrowRight size={20} />
                  </Button>
                  <Button type="button" size="lg" className="w-full justify-between" onClick={() => setScreen('admin')}>
                    <span className="flex items-center gap-2"><LayoutDashboard size={20} /> Admin Login</span>
                    <ArrowRight size={20} />
                  </Button>
                </div>
              </div>
            )}

            {/* ── USER FLOW ── */}
            {screen === 'user' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setScreen('choice'); setStep('phone'); setError(''); setOtp(''); }}
                    className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {step === 'phone' && 'User Sign In'}
                      {step === 'otp' && 'Verify OTP'}
                      {step === 'profile' && 'Complete Profile'}
                    </h2>
                    <p className="text-muted-foreground">
                      {step === 'phone' && 'Sign in with your mobile number.'}
                      {step === 'otp' && `Code sent to +91 ${phone}`}
                      {step === 'profile' && 'Tell us a bit about yourself.'}
                    </p>
                  </div>
                </div>

                {/* STEP: PHONE */}
                <AnimatePresence mode="wait">
                  {step === 'phone' && (
                    <motion.form
                      key="phone"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleUserPhoneSubmit}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="phone">Mobile Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                          <div className="absolute left-10 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium select-none">+91</div>
                          <Input
                            id="phone"
                            type="tel"
                            inputMode="numeric"
                            placeholder="98765 43210"
                            value={phone}
                            onChange={handlePhoneChange}
                            className="pl-20 h-12 rounded-xl text-base tracking-wider"
                            maxLength={10}
                            required
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">{phone.length}/10 digits</p>
                      </div>
                      {error && <p className="text-sm text-danger font-medium">{error}</p>}
                      <Button type="submit" size="lg" className="w-full" disabled={phone.length !== 10}>
                        Send OTP <ArrowRight className="ml-2" size={18} />
                      </Button>
                    </motion.form>
                  )}

                  {/* STEP: OTP */}
                  {step === 'otp' && (
                    <motion.form
                      key="otp"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleUserOtpSubmit}
                      className="space-y-6"
                    >
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                        <p className="text-sm text-muted-foreground text-center">OTP sent to</p>
                        <p className="text-center font-semibold text-primary">+91 {phone}</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="otp">Enter OTP</Label>
                        <Input
                          id="otp"
                          type="text"
                          inputMode="numeric"
                          placeholder="· · · ·"
                          value={otp}
                          onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                          maxLength={6}
                          className="h-14 rounded-xl text-center text-3xl tracking-[0.6em] font-bold"
                          required
                        />
                      </div>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-danger font-medium text-center"
                        >
                          {error}
                        </motion.p>
                      )}
                      <div className="flex gap-3">
                        <Button type="button" variant="outline" size="lg" onClick={() => { setStep('phone'); setOtp(''); setError(''); }} className="flex-1">
                          Back
                        </Button>
                        <Button type="submit" size="lg" className="flex-1" disabled={isLoading}>
                          {isLoading ? <Loader2 className="animate-spin" size={18} /> : <>Verify <ArrowRight className="ml-1" size={18} /></>}
                        </Button>
                      </div>
                    </motion.form>
                  )}

                  {/* STEP: PROFILE */}
                  {step === 'profile' && (
                    <motion.form
                      key="profile"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleProfileSubmit}
                      className="space-y-5"
                    >
                      {/* Full Name */}
                      <div className="space-y-2">
                        <Label htmlFor="fullname">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                          <Input
                            id="fullname"
                            type="text"
                            placeholder="e.g. Gurpreet Singh"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setError(''); }}
                            className="pl-10 h-12 rounded-xl"
                            required
                          />
                        </div>
                      </div>

                      {/* Institution Searchable Dropdown */}
                      <div className="space-y-2">
                        <Label htmlFor="institution-search">Institution / College</Label>
                        <div className="relative" ref={dropdownRef}>
                          <div className="relative">
                            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input
                              id="institution-search"
                              type="text"
                              placeholder="Search IIT..."
                              value={institutionSearch}
                              onChange={(e) => {
                                setInstitutionSearch(e.target.value);
                                setInstitution('');
                                setShowInstitutionDropdown(true);
                                setError('');
                              }}
                              onFocus={() => setShowInstitutionDropdown(true)}
                              className="pl-10 pr-10 h-12 rounded-xl"
                              autoComplete="off"
                            />
                            <ChevronDown
                              className={`absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-transform ${showInstitutionDropdown ? 'rotate-180' : ''}`}
                              size={18}
                            />
                          </div>

                          {/* Dropdown List */}
                          <AnimatePresence>
                            {showInstitutionDropdown && (
                              <motion.div
                                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
                              >
                                {/* Search inside dropdown */}
                                <div className="p-2 border-b border-border">
                                  <div className="relative">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                                    <input
                                      type="text"
                                      placeholder="Search institutions..."
                                      value={institutionSearch}
                                      onChange={(e) => { setInstitutionSearch(e.target.value); setInstitution(''); }}
                                      className="w-full pl-7 pr-3 py-1.5 text-sm bg-muted rounded-lg outline-none"
                                      autoFocus
                                    />
                                  </div>
                                </div>
                                <div className="max-h-48 overflow-y-auto">
                                  {filteredIITs.length === 0 ? (
                                    <p className="text-center text-sm text-muted-foreground py-4">No results found</p>
                                  ) : (
                                    filteredIITs.map((iit) => (
                                      <button
                                        key={iit}
                                        type="button"
                                        onClick={() => handleSelectInstitution(iit)}
                                        className={`w-full text-left px-4 py-3 text-sm hover:bg-primary/10 transition-colors flex items-center gap-2 ${institution === iit ? 'bg-primary/10 text-primary font-medium' : ''}`}
                                      >
                                        {institution === iit && <CheckCircle2 size={14} className="text-primary flex-shrink-0" />}
                                        {iit}
                                      </button>
                                    ))
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Show selected pill */}
                        {institution && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm text-primary font-medium w-fit"
                          >
                            <CheckCircle2 size={14} />
                            {institution}
                          </motion.div>
                        )}
                      </div>

                      {error && (
                        <motion.p
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="text-sm text-danger font-medium"
                        >
                          {error}
                        </motion.p>
                      )}

                      <Button type="submit" size="lg" className="w-full" disabled={isLoading || !name || !institution}>
                        {isLoading
                          ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={18} /> Saving...</span>
                          : <span className="flex items-center gap-2">Get Started <ArrowRight size={18} /></span>
                        }
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ── ADMIN FLOW ── */}
            {screen === 'admin' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setScreen('choice'); setError(''); setAdminId(''); setAdminPassword(''); }}
                    className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div>
                    <h2 className="text-2xl font-semibold">Admin Login</h2>
                    <p className="text-muted-foreground">Enter your Admin ID and password.</p>
                  </div>
                </div>

                <form onSubmit={handleAdminSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="adminId">Admin ID</Label>
                    <Input
                      id="adminId"
                      type="text"
                      placeholder="e.g. parth#rpr@quickped.in"
                      value={adminId}
                      onChange={(e) => { setAdminId(e.target.value); setError(''); }}
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Password</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      placeholder="Enter password"
                      value={adminPassword}
                      onChange={(e) => { setAdminPassword(e.target.value); setError(''); }}
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-danger font-semibold"
                    >
                      {error}
                    </motion.p>
                  )}
                  <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading
                      ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} /> Signing in...</span>
                      : 'Sign in as Admin'
                    }
                  </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">or</div>

                <Button type="button" variant="outline" size="lg" className="w-full" onClick={handleAdminGoogle} disabled={isLoading}>
                  <span className="flex items-center justify-center gap-2">
                    {isLoading ? <><Loader2 className="animate-spin" size={18} /> Please wait</> : <><ShieldCheck size={18} /> Login with Google</>}
                  </span>
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
