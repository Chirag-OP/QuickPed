import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Bike, LayoutDashboard, Phone, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

interface LoginScreenProps {
  initialMode?: 'choice' | 'user' | 'admin';
  onUserLoginSuccess: () => void;
  onAdminLoginSuccess: () => void;
  onAdminGoogleLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  initialMode = 'choice',
  onUserLoginSuccess,
  onAdminLoginSuccess,
  onAdminGoogleLogin,
}) => {
  const [screen, setScreen] = useState<'choice' | 'user' | 'admin'>(initialMode);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      if (loadingTimer.current) {
        window.clearTimeout(loadingTimer.current);
      }
    };
  }, []);

  const handleUserPhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Please enter your mobile number.');
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
    setError('');
    onUserLoginSuccess();
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminId.trim() || !adminPassword.trim()) {
      setError('Provide both Admin ID and Password.');
      return;
    }

    setError('');
    setIsLoading(true);

    if (loadingTimer.current) {
      window.clearTimeout(loadingTimer.current);
    }

    loadingTimer.current = window.setTimeout(() => {
      setIsLoading(false);
      onAdminLoginSuccess();
    }, 750);
  };

  const handleAdminGoogle = () => {
    setError('');
    setIsLoading(true);

    if (loadingTimer.current) {
      window.clearTimeout(loadingTimer.current);
    }

    loadingTimer.current = window.setTimeout(() => {
      setIsLoading(false);
      onAdminGoogleLogin();
    }, 750);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col">
      <div className="bg-gradient-to-r from-primary to-secondary p-6 pb-16">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 text-white mb-4">
            <Bike size={40} />
            <h1 className="text-3xl font-bold">QuickPed</h1>
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
            {screen === 'choice' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-semibold mb-2">Sign in to QuickPed</h2>
                  <p className="text-muted-foreground">
                    Select the login type that fits your role.
                  </p>
                </div>

                <div className="space-y-4">
                  <Button
                    type="button"
                    size="lg"
                    className="w-full justify-between"
                    onClick={() => setScreen('user')}
                  >
                    <span className="flex items-center gap-2">
                      <Phone size={20} /> User Login
                    </span>
                    <ArrowRight size={20} />
                  </Button>

                  <Button
                    type="button"
                    size="lg"
                    className="w-full justify-between"
                    onClick={() => setScreen('admin')}
                  >
                    <span className="flex items-center gap-2">
                      <LayoutDashboard size={20} /> Admin Login
                    </span>
                    <ArrowRight size={20} />
                  </Button>
                </div>
              </div>
            )}

            {screen === 'user' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setScreen('choice')}
                    className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div>
                    <h2 className="text-2xl font-semibold">User Login</h2>
                    <p className="text-muted-foreground">Sign in with your mobile number.</p>
                  </div>
                </div>

                {step === 'phone' && (
                  <form onSubmit={handleUserPhoneSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Mobile Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pl-12 h-12 rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    {error && <p className="text-sm text-danger">{error}</p>}

                    <Button type="submit" size="lg" className="w-full">
                      Send OTP
                    </Button>
                  </form>
                )}

                {step === 'otp' && (
                  <form onSubmit={handleUserOtpSubmit} className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold">Enter OTP</h3>
                      <p className="text-muted-foreground">Code sent to {phone}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="otp">6-digit OTP</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        className="h-12 rounded-xl text-center text-2xl tracking-widest"
                        required
                      />
                    </div>

                    {error && <p className="text-sm text-danger">{error}</p>}

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => setStep('phone')}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button type="submit" size="lg" className="flex-1">
                        Verify <ArrowRight className="ml-2" size={20} />
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {screen === 'admin' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setScreen('choice')}
                    className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div>
                    <h2 className="text-2xl font-semibold">Admin Login</h2>
                    <p className="text-muted-foreground">Use Admin ID and password or sign in with Google.</p>
                  </div>
                </div>

                <form onSubmit={handleAdminSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="adminId">Admin ID</Label>
                    <Input
                      id="adminId"
                      type="text"
                      placeholder="admin@quickped"
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
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
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>

                  {error && <p className="text-sm text-danger">{error}</p>}

                  <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={18} /> Signing in...
                      </span>
                    ) : (
                      'Sign in as Admin'
                    )}
                  </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">or</div>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={handleAdminGoogle}
                  disabled={isLoading}
                >
                  <span className="flex items-center justify-center gap-2">
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={18} />
                        Please wait
                      </span>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        Login with Google
                      </>
                    )}
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
