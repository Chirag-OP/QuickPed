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
import { BottomNav } from './components/bottom-nav';

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
  | 'report-issue'
  | 'admin'
  | 'user-management'
  | 'fleet-management';

type LoginMode = 'choice' | 'user' | 'admin';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const [activeRide, setActiveRide] = useState(false);
  const [initialLoginMode, setInitialLoginMode] = useState<LoginMode>('choice');

  const handleWelcomeComplete = () => {
    setCurrentScreen('login');
    setInitialLoginMode('choice');
  };

  const handleUserLoginSuccess = () => {
    setCurrentScreen('home');
    setInitialLoginMode('choice');
  };

  const handleAdminLoginSuccess = () => {
    setCurrentScreen('admin');
  };

  const handleAdminGoogleLogin = () => {
    setCurrentScreen('admin');
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

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        {/* Welcome Screen */}
        {currentScreen === 'welcome' && (
          <WelcomeScreen onComplete={handleWelcomeComplete} />
        )}

        {/* Login Screen */}
        {currentScreen === 'login' && (
          <LoginScreen
            initialMode={initialLoginMode}
            onUserLoginSuccess={handleUserLoginSuccess}
            onAdminLoginSuccess={handleAdminLoginSuccess}
            onAdminGoogleLogin={handleAdminGoogleLogin}
          />
        )}

        {/* Home Screen */}
        {currentScreen === 'home' && (
          <HomeScreen
            onStartRide={handleStartRide}
            onNavigate={handleNavigate}
          />
        )}

        {/* Scan Screen */}
        {currentScreen === 'scan' && (
          <ScanScreen
            onScanSuccess={handleScanSuccess}
            onClose={() => setCurrentScreen('home')}
          />
        )}

        {/* Active Ride Screen */}
        {currentScreen === 'active-ride' && activeRide && (
          <ActiveRideScreen
            onEndRide={handleEndRide}
            onBack={() => setCurrentScreen('home')}
          />
        )}

        {/* Ride Complete Screen */}
        {currentScreen === 'ride-complete' && (
          <RideCompleteScreen
            rideData={{
              duration: 720,
              fare: 15,
              startDock: 'Main Gate Dock',
              endDock: 'Library Dock',
              distance: 2.3
            }}
            onContinue={handleRideCompleteNext}
          />
        )}

        {/* Report Issue Screen */}
        {currentScreen === 'report-issue' && (
          <ReportIssueScreen
            bikeId="QP-2847"
            onSubmit={handleReportComplete}
            onSkip={handleReportComplete}
          />
        )}

        {/* Wallet Screen */}
        {currentScreen === 'wallet' && (
          <WalletScreen onBack={() => setCurrentScreen('home')} />
        )}

        {/* History Screen */}
        {currentScreen === 'history' && (
          <HistoryScreen onBack={() => setCurrentScreen('home')} />
        )}

        {/* Profile Screen */}
        {currentScreen === 'profile' && (
          <ProfileScreen onBack={() => setCurrentScreen('home')} onLogout={handleLogout} />
        )}

        {/* Admin Dashboard and sub-pages */}
        {currentScreen === 'admin' && (
          <AdminDashboard onNavigate={(screen: 'user-management' | 'fleet-management') => setCurrentScreen(screen)} />
        )}

        {currentScreen === 'user-management' && (
          <UserManagement />
        )}

        {currentScreen === 'fleet-management' && (
          <FleetManagement />
        )}

        {/* Bottom Navigation - Show only on main screens */}
        {['home', 'wallet', 'history', 'profile'].includes(currentScreen) && (
          <BottomNav activeTab={currentScreen} onTabChange={handleTabChange} />
        )}

      </div>
    </ThemeProvider>
  );
}