// gurpreeet updated-26 jun
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StepIndicator } from '../components/stepIndicator';

import {
  Facebook
} from "lucide-react";
import { ArrowLeft, ArrowRight, Bike, LayoutDashboard, Phone, ShieldCheck, Loader2, Search, GraduationCap, User, CheckCircle2, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import landscape1 from "../../assets/landscape1.png";
import quickPedLogo from "../../assets/logo.jpeg";
import { NotificationBell } from '../components/notification-bell';
import { useAuth } from '../../context/AuthContext';

const STORAGE_KEY = 'qp_user_profile';
const OTP_RESEND_SECONDS = 30;
const AUTH_LANDSCAPE_HEIGHT = 'clamp(150px, 28dvh, 250px)';
const AUTH_LANDSCAPE_GAP = '32px';

const IIT_LIST = [
  'IIT Bhubaneswar', 'IIT Bombay', 'IIT Mandi', 'IIT Delhi', 'IIT Indore',
  'IIT Kharagpur', 'IIT Hyderabad', 'IIT Jodhpur', 'IIT Kanpur', 'IIT Madras',
  'IIT Gandhinagar', 'IIT Patna', 'IIT Roorkee', 'IIT Ropar', 'IIT Guwahati',
  'IIT Jammu', 'IIT Dharwad', 'IIT Goa', 'IIT Bhilai', 'IIT Tirupati',
  'IIT Palakkad', 'IIT Dhanbad (ISM)', 'IIT (BHU) Varanasi',
];


const ADMIN_CREDENTIALS: Record<string, { password: string; name: string }> = {
  'parth#rpr@quickped.in': { password: 'parth_+1', name: 'Parth Bansal' },
  'chirag#rpr@quickped.in': { password: 'chirag#_+', name: 'Chirag' },
  'arshpreet#rpr@quickped.in': { password: 'arsh_+#1', name: 'Arshpreet' },
};

export type AdminKey = 'parth' | 'chirag' | 'arshpreet';

const AuthLandscape: React.FC = () => (
  <div
    className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden bg-white"
    style={{ height: AUTH_LANDSCAPE_HEIGHT }}
    aria-hidden="true"
  >
    <img
      src={landscape1}
      alt=""
      className="h-full w-full object-cover object-bottom"
      draggable={false}
    />
  </div>
);

const AuthPanel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div
    className="relative overflow-hidden bg-white"
    style={{ minHeight: 'clamp(680px, calc(100dvh - 64px), 820px)' }}
  >
    <div
      className={`relative z-10 px-8 pt-8 ${className}`}
      style={{ paddingBottom: `calc(${AUTH_LANDSCAPE_HEIGHT} + ${AUTH_LANDSCAPE_GAP})` }}
    >
      {children}
    </div>
    <AuthLandscape />
  </div>
);

interface LoginScreenProps {
  initialMode?: 'choice' | 'user' | 'admin';
  initialStep?: 'phone' | 'otp' | 'profile';
  onUserLoginSuccess: () => void;
  onAdminLoginSuccess: (adminKey: AdminKey) => void;
  onAdminGoogleLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  initialMode = 'choice',
  initialStep = 'phone',
  onUserLoginSuccess,
  onAdminLoginSuccess,
  onAdminGoogleLogin,
}) => {
  const [screen, setScreen] = useState<'choice' | 'user' | 'admin'>(initialMode);
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>(initialStep);
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
  const [otpCountdown, setOtpCountdown] = useState(initialStep === 'otp' ? OTP_RESEND_SECONDS : 0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const loadingTimer = useRef<number | null>(null);

  const { login, verifyOtp, updateProfile, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user && !user.campusId) {
      setScreen('user');
      setStep('profile');
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated) {
      setScreen(initialMode);
      setStep(initialStep);
      setError('');
      setIsLoading(false);
      setOtpCountdown(initialStep === 'otp' ? OTP_RESEND_SECONDS : 0);
      setAdminId('');
      setAdminPassword('');
    }
  }, [initialMode, initialStep, isAuthenticated]);

  useEffect(() => {
    return () => {
      if (loadingTimer.current) window.clearTimeout(loadingTimer.current);
    };
  }, []);

  useEffect(() => {
    if (step !== 'otp' || otpCountdown <= 0) return;

    const timer = window.setInterval(() => {
      setOtpCountdown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [otpCountdown, step]);

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


  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(val);
    setError('');
  };

  const handleUserPhoneSubmit = async (e: React.FormEvent) => {
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
    setIsLoading(true);
    try {
      await login(phone);
      setStep('otp');
      setOtpCountdown(OTP_RESEND_SECONDS);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpCountdown > 0 || isLoading) return;

    setError('');
    setIsLoading(true);
    try {
      await login(phone);
      setOtp('');
      setOtpCountdown(OTP_RESEND_SECONDS);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the OTP.');
      return;
    }
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await verifyOtp(phone, otp);
      // Let AuthContext and App route gatekeeper handle the next step
    } catch (err: any) {
      setError('Incorrect OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

  const handleProfileSubmit = async (e: React.FormEvent) => {
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
    try {
      // Hardware-requested mock campus ID
      await updateProfile(name.trim(), '123e4567-e89b-12d3-a456-426614174000');
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ phone, name: name.trim(), institution }));

    } catch (err: any) {
      setError('Failed to save profile.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = adminId.trim();
    const trimmedPwd = adminPassword.trim();

    if (!trimmedId || !trimmedPwd) {
      setError('Provide both Admin ID and Password.');
      return;
    }


    const cred = ADMIN_CREDENTIALS[trimmedId];
    if (!cred) {
      setError('Invalid Admin ID');
      return;
    }


    if (trimmedPwd !== cred.password) {
      setError('Incorrect Password');
      return;
    }


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
  const getCurrentStep = () => {
    if (screen === "choice") return 0;
    if (step === "phone") return 1;
    if (step === "otp") return 2;
    if (step === "profile") return 3;

    return 0;
  };
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Decorative Header Background */}


      <div className="flex-1 px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto"        >
          <Card
            className="overflow-hidden rounded-[30px] border-0 shadow-xl bg-white p-0"
          >            {/* STEP: CHOICE */}
            {/* <StepIndicator currentStep={getCurrentStep()} /> */}
            {screen === 'choice' && (
              <AuthPanel className="flex flex-col items-center">
                <div className="text-center mb-10">
                  <img
                    src={quickPedLogo}
                    alt="QuickPed"
                    className="mx-auto mb-5 h-20 w-40 object-contain mix-blend-multiply"
                  />
                  <h2 className="text-4xl font-bold text-gray-900">
                    Welcome to QuickPed
                  </h2>

                  <p className="mt-4 leading-7 text-slate-500">
                    Create an Account to get started on your
                    <br />
                    Campus Mobility Journey
                  </p>
                </div>

                {/* phone login */}
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full h-14 rounded-full bg-orange-400 border-0 text-black text-lg mb-5 hover:scale-[1.03] transition-transform duration-200"
                  onClick={() => setScreen('user')}
                >
                  <Phone size={38} className="mr-2 text-black text-lg" />
                  <span className="text-lg text-black font-semibold">
                    Continue With Phone
                  </span>
                </Button>



                {/* email login */}
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-14 rounded-full bg-gray-50 border-0 text-black text-lg mb-5 hover:scale-[1.03] transition-transform duration-200"
                >
                  Continue With Email
                </Button>

                {/* social buttons */}
                <div className="grid grid-cols-2 gap-4 w-full mb-8">

                  <Button
                    variant="ghost"
                    className="h-16 rounded-full bg-gray-50 hover:bg-slate-50 hover:scale-[1.03] transition-transform duration-200"
                  >
                    <img
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      alt="Google"
                      className="w-10 h-10"
                    />
                    <span className="text-black font-semibold text-lg">
                      Google
                    </span>
                  </Button>

                  <Button
                    variant="ghost"
                    className="h-16 rounded-full bg-gray-50 hover:bg-slate-50 hover:scale-[1.03] transition-transform duration-200"                  >
                    <img
                      src="https://imgs.search.brave.com/FezUwRGIAsiVYTjCqJUNP5zUnnNd_uPQad1abyOSctI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNTEv/MTY4LzU3OS9zbWFs/bC9mYWNlYm9vay1s/b2dvLW9uLWEtYmx1/ZS1idXR0b24tZnJl/ZS1wbmcucG5n"
                      alt="Google"
                      className="w-12 h-12"
                    />
                    <span className="text-black font-semibold text-lg">
                      Facebook
                    </span>
                  </Button>


                </div>

                <div className="w-full flex items-center justify-center gap-1 mt-6">
                  <p className="text-gray-500 text-sm">
                    Already have an account?
                  </p>

                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-auto p-0 text-sm font-semibold text-black-700 hover:bg-transparent hover:text-orange-700 ${otpCountdown > 0 ? "opacity-45 blur-[0.3px]" : ""
                      }`}
                    onClick={() => setScreen("admin")}
                    disabled={isLoading}
                  >
                    Log in
                  </Button>
                </div>
              </AuthPanel>
            )}

            {/* USER FLOW */}
            {screen === 'user' && (
              <AuthPanel className="space-y-8">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => { setScreen('choice'); setStep('phone'); setError(''); setOtp(''); setOtpCountdown(0); }}
                    className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <img
                    src={quickPedLogo}
                    alt="QuickPed"
                    className="h-12 w-24 object-contain mix-blend-multiply"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      {step === 'phone' && 'Sign In'}
                      {step === 'otp' && 'Verify OTP'}
                      {step === 'profile' && 'Complete Profile'}
                    </h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                      {step === 'phone' && 'Enter your mobile number'}
                      {step === 'otp' && `Code sent to +91 ${phone}`}
                      {step === 'profile' && 'Tell us a bit about yourself'}
                    </p>
                  </div>
                </div>

                {/* ANIMATED STEPS */}
                <AnimatePresence mode="wait">
                  {/* STEP: PHONE */}
                  {step === 'phone' && (
                    <motion.form
                      key="phone"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleUserPhoneSubmit}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="ml-1 font-semibold text-slate-700">Mobile Number</Label>
                        <div className="relative group">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={25} />
                          <div className="absolute left-12 top-1/2 -translate-y-1/2 select-none text-base font-medium text-slate-600">+91</div>
                          <Input
                            id="phone"
                            type="tel"
                            inputMode="numeric"
                            placeholder="|"
                            value={phone}
                            onChange={handlePhoneChange}
                            className="pl-24 h-14 rounded-2xl text-lg tracking-wider border-slate-200 focus:border-orange-500 focus:ring-orange-500/20 bg-slate-50 focus:bg-white transition-all shadow-sm"
                            maxLength={10}
                            required
                          />

                        </div>

                      </div>
                      {error && <p className="text-sm text-red-500 font-medium ml-1">{error}</p>}
                      <Button type="submit" size="lg" className="w-full h-14 bg-orange-400 hover:scale-[1.03] duration-200 text-white rounded-2xl font-semibold text-base shadow-md hover:shadow-lg transition-all" disabled={phone.length !== 10}>
                        Continue <ArrowRight className="ml-2" size={18} />
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
                      <div className="p-5 bg-orange-50 border border-orange-100 rounded-2xl flex flex-col items-center">
                        <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mb-3">
                          <ShieldCheck size={24} />
                        </div>
                        <p className="text-sm text-slate-500 text-center font-medium">Authentication Code sent to</p>
                        <p className="text-center font-bold text-slate-800 text-lg mt-0.5">+91 {phone}</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="otp" className="text-slate-700 font-semibold ml-1">Enter 6-digit Code</Label>
                        <Input
                          id="otp"
                          type="text"
                          inputMode="numeric"
                          placeholder="· · · · · ·"
                          value={otp}
                          onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                          maxLength={6}
                          className="h-16 rounded-2xl text-center text-3xl tracking-[0.5em] font-extrabold border-slate-200 focus:border-orange-500 focus:ring-orange-500/20 bg-slate-50 focus:bg-white shadow-sm"
                          required
                        />
                        <div className="mt-3 flex items-center justify-end gap-3">
                          <span className="text-xs font-semibold text-slate-500">
                            {otpCountdown > 0 ? `${otpCountdown}s` : 'Ready'}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleResendOtp}
                            disabled={otpCountdown > 0 || isLoading}
                            className={`h-9 rounded-full px-4 text-orange-600 hover:bg-orange-50 hover:text-orange-700 ${otpCountdown > 0 ? 'opacity-45 blur-[0.3px]' : ''
                              }`}
                          >
                            Resend OTP
                          </Button>
                        </div>
                      </div>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 font-medium text-center"
                        >
                          {error}
                        </motion.p>
                      )}
                      <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" size="lg" onClick={() => { setStep('phone'); setOtp(''); setError(''); }} className="flex-1 h-14 rounded-2xl border-orange-200 bg-white text-slate-700 hover:bg-orange-50 font-semibold">
                          Back
                        </Button>
                        <Button type="submit" size="lg" className="flex-1 h-14 rounded-2xl bg-orange-500 text-white shadow-md hover:bg-orange-600 font-semibold" disabled={isLoading || otp.length !== 6}>
                          {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Verify Code'}
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
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="fullname" className="text-slate-700 font-semibold ml-1">Full Name</Label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                          <Input
                            id="fullname"
                            type="text"
                            placeholder="e.g. Gurpreet Singh"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setError(''); }}
                            className="pl-12 h-14 rounded-2xl text-base border-slate-200 focus:border-orange-500 focus:ring-orange-500/20 bg-slate-50 focus:bg-white transition-all shadow-sm"
                            required
                          />
                        </div>
                      </div>

                      {/* Institution Searchable Dropdown */}
                      <div className="space-y-2">
                        <Label htmlFor="institution-search" className="text-slate-700 font-semibold ml-1">Institution / College</Label>
                        <div className="relative" ref={dropdownRef}>
                          <div className="relative group">
                            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
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
                              className="pl-12 pr-10 h-14 rounded-2xl text-base border-slate-200 focus:border-orange-500 focus:ring-orange-500/20 bg-slate-50 focus:bg-white transition-all shadow-sm"
                              autoComplete="off"
                            />
                            <ChevronDown
                              className={`absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-transform duration-300 ${showInstitutionDropdown ? 'rotate-180' : ''}`}
                              size={20}
                            />
                          </div>

                          {/* Dropdown List */}
                          <AnimatePresence>
                            {showInstitutionDropdown && (
                              <motion.div
                                initial={{ opacity: 0, y: -4, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                                className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden"
                              >
                                {/* Search inside dropdown */}
                                <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                                  <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                      type="text"
                                      placeholder="Search institutions..."
                                      value={institutionSearch}
                                      onChange={(e) => { setInstitutionSearch(e.target.value); setInstitution(''); }}
                                      className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                      autoFocus
                                    />
                                  </div>
                                </div>
                                <div className="max-h-56 overflow-y-auto custom-scrollbar">
                                  {filteredIITs.length === 0 ? (
                                    <p className="text-center text-sm text-slate-500 py-6">No results found</p>
                                  ) : (
                                    filteredIITs.map((iit) => (
                                      <button
                                        key={iit}
                                        type="button"
                                        onClick={() => handleSelectInstitution(iit)}
                                        className={`w-full text-left px-4 py-3.5 text-sm transition-colors flex items-center gap-3 ${institution === iit ? 'bg-orange-50 text-orange-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                                      >
                                        <div className={`flex items-center justify-center w-5 h-5 rounded-full border ${institution === iit ? 'border-orange-500 bg-orange-500' : 'border-slate-300'}`}>
                                          {institution === iit && <CheckCircle2 size={12} className="text-white" />}
                                        </div>
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
                            initial={{ opacity: 0, scale: 0.9, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="flex items-center gap-2 px-4 py-2 mt-3 bg-orange-100/60 border border-orange-200 rounded-xl text-sm text-orange-700 font-semibold w-fit shadow-sm"
                          >
                            <CheckCircle2 size={16} className="text-orange-600" />
                            {institution}
                          </motion.div>
                        )}
                      </div>

                      {error && (
                        <motion.p
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="text-sm text-red-500 font-medium ml-1"
                        >
                          {error}
                        </motion.p>
                      )}

                      <Button type="submit" size="lg" className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-semibold text-base shadow-md hover:shadow-lg transition-all mt-4" disabled={isLoading || !name || !institution}>
                        {isLoading
                          ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={20} /> Saving...</span>
                          : <span className="flex items-center gap-2">Get Started <ArrowRight size={20} /></span>
                        }
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </AuthPanel>
            )}

            {/* ── ADMIN / SIGN UP FLOW ── */}
            {screen === 'admin' && (
              <AuthPanel className="space-y-8">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => { setScreen('choice'); setError(''); setAdminId(''); setAdminPassword(''); }}
                    className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <img
                    src={quickPedLogo}
                    alt="QuickPed"
                    className="h-12 w-24 object-contain mix-blend-multiply"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Sign Up / Admin</h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">Enter your details to continue.</p>
                  </div>
                </div>

                <form onSubmit={handleAdminSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="adminId" className="text-slate-700 font-semibold ml-1">Email / ID</Label>
                    <Input
                      id="adminId"
                      type="text"
                      placeholder="e.g. name@university.edu"
                      value={adminId}
                      onChange={(e) => { setAdminId(e.target.value); setError(''); }}
                      className="h-14 rounded-2xl text-base border-slate-200 focus:border-orange-500 focus:ring-orange-500/20 bg-slate-50 focus:bg-white transition-all shadow-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword" className="text-slate-700 font-semibold ml-1">Password</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      placeholder="Enter password"
                      value={adminPassword}
                      onChange={(e) => { setAdminPassword(e.target.value); setError(''); }}
                      className="h-14 rounded-2xl text-base border-slate-200 focus:border-orange-500 focus:ring-orange-500/20 bg-slate-50 focus:bg-white transition-all shadow-sm"
                      required
                    />
                  </div>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 font-semibold ml-1"
                    >
                      {error}
                    </motion.p>
                  )}
                  <Button type="submit" size="lg" className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-semibold text-base shadow-md hover:shadow-lg transition-all" disabled={isLoading}>
                    {isLoading
                      ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={20} /> Continuing...</span>
                      : 'Continue'
                    }
                  </Button>
                </form>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-500 font-medium">Or continue with</span>
                  </div>
                </div>

                <Button type="button" variant="outline" size="lg" className="w-full h-14 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-2xl font-semibold shadow-sm transition-all hover:-translate-y-0.5" onClick={handleAdminGoogle} disabled={isLoading}>
                  <span className="flex items-center justify-center gap-3">
                    {isLoading ? <><Loader2 className="animate-spin" size={20} /> Please wait</> : <><ShieldCheck size={20} className="text-slate-400" /> Continue with Google</>}
                  </span>
                </Button>
              </AuthPanel>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
