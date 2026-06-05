import React, { useState } from 'react';
import { ThemeProvider } from './components/theme-provider';
import { WelcomeScreen } from './screens/welcome-screen';
import { LoginScreen } from './screens/login-screen';
import { HomeScreen } from './screens/home-screen';
import { ActiveRideScreen } from './screens/active-ride-screen';
import { WalletScreen } from './screens/wallet-screen';
import { HistoryScreen } from './screens/history-screen';
import { ProfileScreen } from './screens/profile-screen';
import { ScanScreen } from './screens/scan-screen';
import { RideCompleteScreen } from './screens/ride-complete-screen';
import { ReportIssueScreen } from './screens/report-issue-screen';
import { AdminDashboard } from './screens/admin-dashboard';
import { UserManagement } from './screens/user-management';
import { FleetManagement } from './screens/fleet-management';
import { DockManagement } from './screens/dock-management';
import { PricingConfig } from './screens/pricing-config';
import { RevenueReports } from './screens/revenue-reports';
import { BottomNav } from './components/bottom-nav';
import { LayoutDashboard, Bike, Users, MapPin, IndianRupee, BarChart3, X } from 'lucide-react';

type AppScreen =
  | 'welcome'
  | 'login'
  | 'home'
  | 'scan'
  | 'active-ride'
  | 'ride-complete'
  | 'wallet'
  | 'history'
  | 'profile'
  | 'report-issue';

type LoginMode = 'choice' | 'user' | 'admin';

type AdminScreen = 'admin' | 'fleet' | 'users' | 'docks' | 'pricing' | 'revenue';

const adminNavItems: { screen: AdminScreen; label: string; Icon: React.ElementType }[] = [
  { screen: 'admin', label: 'Dashboard', Icon: LayoutDashboard },
  { screen: 'fleet', label: 'Fleet', Icon: Bike },
  { screen: 'users', label: 'Users', Icon: Users },
  { screen: 'docks', label: 'Docks', Icon: MapPin },
  { screen: 'pricing', label: 'Pricing', Icon: IndianRupee },
  { screen: 'revenue', label: 'Revenue', Icon: BarChart3 },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const [activeRide, setActiveRide] = useState(false);
  const [initialLoginMode, setInitialLoginMode] = useState<LoginMode>('choice');
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminScreen, setAdminScreen] = useState<AdminScreen>('admin');

  const handleWelcomeComplete = () => {
    setCurrentScreen('login');
    setInitialLoginMode('choice');
  };

  const handleUserLoginSuccess = () => {
    setCurrentScreen('home');
    setInitialLoginMode('choice');
  };

  const handleAdminLoginSuccess = () => {
    setShowAdmin(true);
    setAdminScreen('admin');
  };

  const handleAdminGoogleLogin = () => {
    setShowAdmin(true);
    setAdminScreen('admin');
  };

  const handleStartRide = () => {
    setCurrentScreen('scan');
  };

  const handleScanSuccess = () => {
    setActiveRide(true);
    setCurrentScreen('active-ride');
  };

  const handleEndRide = () => {
    setActiveRide(false);
    setCurrentScreen('ride-complete');
  };

  const handleRideCompleteNext = () => {
    setCurrentScreen('report-issue');
  };

  const handleReportComplete = () => {
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setShowAdmin(false);
    setCurrentScreen('login');
    setInitialLoginMode('choice');
  };

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as AppScreen);
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'scan') {
      handleStartRide();
    } else {
      setCurrentScreen(tab as AppScreen);
    }
  };

  const handleExitAdmin = () => {
    setShowAdmin(false);
    setCurrentScreen('login');
    setInitialLoginMode('choice');
  };

  const handleAdminNavigate = (screen: 'user-management' | 'fleet-management') => {
    if (screen === 'user-management') {
      setAdminScreen('users');
    } else {
      setAdminScreen('fleet');
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        {showAdmin ? (
          <>
            <button
              onClick={handleExitAdmin}
              className="fixed top-5 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-danger text-white rounded-full shadow-lg text-xs font-medium"
            >
              <X size={13} /> Exit Admin
            </button>

            {adminScreen === 'admin' && <AdminDashboard onNavigate={handleAdminNavigate} />}
            {adminScreen === 'fleet' && <FleetManagement />}
            {adminScreen === 'users' && <UserManagement />}
            {adminScreen === 'docks' && <DockManagement />}
            {adminScreen === 'pricing' && <PricingConfig />}
            {adminScreen === 'revenue' && <RevenueReports />}

            <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border">
              <div className="flex items-stretch">
                {adminNavItems.map(({ screen, label, Icon }) => (
                  <button
                    key={screen}
                    onClick={() => setAdminScreen(screen)}
                    className={`relative flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all ${
                      adminScreen === screen ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-[10px] font-medium leading-none">{label}</span>
                    {adminScreen === screen && <span className="absolute bottom-1 h-0.5 w-8 rounded-full bg-primary" />}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {currentScreen === 'welcome' && <WelcomeScreen onComplete={handleWelcomeComplete} />}

            {currentScreen === 'login' && (
              <LoginScreen
                initialMode={initialLoginMode}
                onUserLoginSuccess={handleUserLoginSuccess}
                onAdminLoginSuccess={handleAdminLoginSuccess}
                onAdminGoogleLogin={handleAdminGoogleLogin}
              />
            )}

            {currentScreen === 'home' && <HomeScreen onStartRide={handleStartRide} onNavigate={handleNavigate} />}

            {currentScreen === 'scan' && <ScanScreen onScanSuccess={handleScanSuccess} onClose={() => setCurrentScreen('home')} />}

            {currentScreen === 'active-ride' && activeRide && (
              <ActiveRideScreen onEndRide={handleEndRide} onBack={() => setCurrentScreen('home')} />
            )}

            {currentScreen === 'ride-complete' && (
              <RideCompleteScreen
                rideData={{
                  duration: 720,
                  fare: 15,
                  startDock: 'Main Gate Dock',
                  endDock: 'Library Dock',
                  distance: 2.3,
                }}
                onContinue={handleRideCompleteNext}
              />
            )}

            {currentScreen === 'report-issue' && (
              <ReportIssueScreen bikeId="QP-2847" onSubmit={handleReportComplete} onSkip={handleReportComplete} />
            )}

            {currentScreen === 'wallet' && <WalletScreen onBack={() => setCurrentScreen('home')} />}

            {currentScreen === 'history' && <HistoryScreen onBack={() => setCurrentScreen('home')} />}

            {currentScreen === 'profile' && <ProfileScreen onBack={() => setCurrentScreen('home')} onLogout={handleLogout} />}

            {['home', 'wallet', 'history', 'profile'].includes(currentScreen) && (
              <BottomNav activeTab={currentScreen} onTabChange={handleTabChange} />
            )}
          </>
        )}
      </div>
    </ThemeProvider>
  );
}
