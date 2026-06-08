import React, { useState } from 'react';
import { ThemeProvider } from './components/theme-provider';
import { WelcomeScreen } from './screens/welcome-screen';
import { LoginScreen } from './screens/login-screen';
import type { AdminKey } from './screens/login-screen';
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
import { NotificationProvider } from './contexts/notification-context';
import { NotificationBell } from './components/notification-bell';
import {
  calculateRideFare,
  createInitialInstitutes,
  getCompletedRides,
  getInstituteRevenue,
  recalculateDockOccupancy,
  type AdminUser,
  type InstituteData,
  type IssueReport,
  type RideHistoryRecord,
} from './lib/admin-data';
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

const USER_PROFILE_KEY = 'qp_user_profile';
const RIDE_VEHICLE_ID = 'QP-2847';
const RIDE_START_DOCK = 'Main Gate Dock';
const RIDE_END_DOCK = 'Library Dock';

type StoredUserProfile = {
  phone?: string;
  name?: string;
  institution?: string;
};

type IssueReportSubmission = {
  bikeId: string;
  issueType: string;
  issueLabel: string;
  description: string;
};

const readUserProfile = (): StoredUserProfile => {
  try {
    const saved = localStorage.getItem(USER_PROFILE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const normalizePhone = (phone?: string) => phone?.replace(/\D/g, '') ?? '';

const getInitial = (name?: string) => (name?.trim().charAt(0).toUpperCase() || 'G');

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const [activeRide, setActiveRide] = useState(false);
  const [initialLoginMode, setInitialLoginMode] = useState<LoginMode>('choice');
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminScreen, setAdminScreen] = useState<AdminScreen>('admin');
  const [adminKey, setAdminKey] = useState<AdminKey>('parth');
  const [institutes, setInstitutes] = useState<InstituteData[]>(() => createInitialInstitutes());
  const [selectedInstituteId, setSelectedInstituteId] = useState<string | null>(null);
  const [lastCompletedRide, setLastCompletedRide] = useState<RideHistoryRecord | null>(null);
  const [userRideHistory, setUserRideHistory] = useState<RideHistoryRecord[]>([]);

  const selectedInstitute = institutes.find((institute) => institute.id === selectedInstituteId) ?? null;

  const resolveUserInstituteId = (profile: StoredUserProfile) => {
    const institution = profile.institution?.trim().toLowerCase();
    const matchingInstitute = institutes.find((institute) => institute.name.toLowerCase() === institution);
    return matchingInstitute?.id ?? institutes[0]?.id ?? null;
  };

  const upsertRideUser = (users: AdminUser[], profile: StoredUserProfile, fare: number): AdminUser[] => {
    const profilePhone = normalizePhone(profile.phone);
    const profileName = profile.name?.trim() || 'Guest User';
    const userIndex = users.findIndex((user) => {
      const userPhone = normalizePhone(user.phone);
      return (profilePhone && userPhone.endsWith(profilePhone)) || user.name.toLowerCase() === profileName.toLowerCase();
    });

    if (userIndex >= 0) {
      return users.map((user, index) =>
        index === userIndex
          ? {
              ...user,
              totalRides: user.totalRides + 1,
              walletBalance: Math.max(0, user.walletBalance - fare),
            }
          : user
      );
    }

    const newUser: AdminUser = {
      id: `u-${Date.now().toString(36)}`,
      name: profileName,
      email: 'Not provided',
      phone: profile.phone ? `+91 ${profile.phone}` : 'Not provided',
      role: 'verified',
      walletBalance: Math.max(0, 250 - fare),
      totalRides: 1,
      memberSince: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      institute: profile.institution || 'IIT Delhi',
      avatar: getInitial(profileName),
    };

    return [newUser, ...users];
  };

  const handleWelcomeComplete = () => {
    setCurrentScreen('login');
    setInitialLoginMode('choice');
  };

  const handleUserLoginSuccess = () => {
    setCurrentScreen('home');
    setInitialLoginMode('choice');
  };

  const handleAdminLoginSuccess = (key: AdminKey) => {
    setAdminKey(key);
    setSelectedInstituteId(null);
    setShowAdmin(true);
    setAdminScreen('admin');
  };

  const handleAdminGoogleLogin = () => {
    setShowAdmin(false);
    setCurrentScreen('login');
    setInitialLoginMode('admin');
  };

  const handleStartRide = () => {
    setCurrentScreen('scan');
  };

  const handleScanSuccess = () => {
    setActiveRide(true);
    setCurrentScreen('active-ride');
  };

  const handleEndRide = (durationSeconds: number) => {
    const profile = readUserProfile();
    const instituteId = resolveUserInstituteId(profile);
    const now = new Date();
    const safeDuration = Math.max(1, durationSeconds);
    const fare = calculateRideFare(safeDuration);
    const completedRide: RideHistoryRecord = {
      id: `R-${now.getTime().toString().slice(-6)}`,
      user: profile.name?.trim() || 'Guest User',
      userPhone: profile.phone ? `+91 ${profile.phone}` : undefined,
      vehicleId: RIDE_VEHICLE_ID,
      startDock: RIDE_START_DOCK,
      endDock: RIDE_END_DOCK,
      fare,
      duration: safeDuration,
      distance: 2.3,
      bikeType: 'Standard',
      status: 'completed',
      startedAt: new Date(now.getTime() - safeDuration * 1000).toISOString(),
      completedAt: now.toISOString(),
    };

    setLastCompletedRide(completedRide);
    setUserRideHistory((prev) => [completedRide, ...prev]);

    if (instituteId) {
      setInstitutes((prev) =>
        prev.map((institute) => {
          if (institute.id !== instituteId) return institute;

          const rideHistory = [completedRide, ...institute.rideHistory];
          const destinationDock = institute.docks.find((dock) => dock.name === RIDE_END_DOCK) ?? institute.docks[0];
          const vehicles = institute.vehicles.map((vehicle) =>
            vehicle.id === RIDE_VEHICLE_ID
              ? {
                  ...vehicle,
                  status: 'available' as const,
                  dockId: destinationDock?.id ?? vehicle.dockId,
                  location: destinationDock?.name ?? RIDE_END_DOCK,
                  lastRide: 'Just now',
                  totalRides: vehicle.totalRides + 1,
                }
              : vehicle
          );

          return {
            ...institute,
            rideHistory,
            users: upsertRideUser(institute.users, profile, fare),
            vehicles,
            docks: recalculateDockOccupancy(institute.docks, vehicles),
            revenue: getInstituteRevenue({ rideHistory }),
            completedRides: getCompletedRides(rideHistory).length,
            activeRides: rideHistory.filter((ride) => ride.status === 'active').length,
          };
        })
      );
    }

    setActiveRide(false);
    setCurrentScreen('ride-complete');
  };

  const handleRideCompleteContinue = () => {
    setCurrentScreen('home');
  };

  const handleRideCompleteReport = () => {
    setCurrentScreen('report-issue');
  };

  const handleIssueSubmit = (submission: IssueReportSubmission) => {
    const profile = readUserProfile();
    const instituteId = resolveUserInstituteId(profile);
    const institute = institutes.find((item) => item.id === instituteId);
    if (!instituteId || !institute) return;

    const issueReport: IssueReport = {
      id: `I-${Date.now().toString(36)}`,
      instituteId,
      instituteName: institute.name,
      user: profile.name?.trim() || 'Guest User',
      userPhone: profile.phone ? `+91 ${profile.phone}` : undefined,
      vehicleId: submission.bikeId,
      rideId: lastCompletedRide?.id,
      issueType: submission.issueType,
      issueLabel: submission.issueLabel,
      description: submission.description.trim(),
      reportedAt: new Date().toISOString(),
    };

    setInstitutes((prev) =>
      prev.map((item) =>
        item.id === instituteId
          ? { ...item, issueReports: [issueReport, ...item.issueReports] }
          : item
      )
    );
  };

  const handleReportComplete = () => {
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setShowAdmin(false);
    setSelectedInstituteId(null);
    localStorage.removeItem('qp_user_profile');
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
    setSelectedInstituteId(null);
    setCurrentScreen('login');
    setInitialLoginMode('choice');
  };

  const handleAdminNavigate = (screen: 'user-management' | 'fleet-management' | 'docks' | 'pricing' | 'revenue') => {
    if (screen === 'user-management') {
      setAdminScreen('users');
    } else if (screen === 'fleet-management') {
      setAdminScreen('fleet');
    } else if (screen === 'docks') {
      setAdminScreen('docks');
    } else if (screen === 'pricing') {
      setAdminScreen('pricing');
    } else if (screen === 'revenue') {
      setAdminScreen('revenue');
    }
  };

  const handleSelectInstitute = (instituteId: string) => {
    setSelectedInstituteId(instituteId);
    setAdminScreen('admin');
  };

  const handleAddInstitute = (institute: InstituteData) => {
    setInstitutes((prev) => [...prev, institute]);
    setSelectedInstituteId(institute.id);
    setAdminScreen('admin');
  };

  const handleUpdateSelectedInstitute = (updater: (institute: InstituteData) => InstituteData) => {
    setInstitutes((prev) =>
      prev.map((institute) => (institute.id === selectedInstituteId ? updater(institute) : institute))
    );
  };

  return (
    <NotificationProvider>
      <ThemeProvider>
      <div className="relative min-h-screen bg-background">
        {showAdmin ? (
          <>
            <div className="flex items-center justify-end gap-3 bg-background px-4 pt-4">
              <NotificationBell />
              <button
                onClick={handleExitAdmin}
                className="flex items-center gap-1.5 rounded-full bg-danger px-3 py-1.5 text-xs font-medium text-white shadow-lg"
              >
                <X size={13} /> Exit Admin
              </button>
            </div>

            {(adminScreen === 'admin' || !selectedInstitute) && (
              <AdminDashboard
                adminKey={adminKey}
                institutes={institutes}
                selectedInstitute={selectedInstitute}
                selectedInstituteId={selectedInstituteId}
                onSelectInstitute={handleSelectInstitute}
                onAddInstitute={handleAddInstitute}
                onUpdateInstitute={handleUpdateSelectedInstitute}
                onNavigate={handleAdminNavigate}
              />
            )}
            {adminScreen === 'fleet' && selectedInstitute && (
              <FleetManagement institute={selectedInstitute} onUpdateInstitute={handleUpdateSelectedInstitute} />
            )}
            {adminScreen === 'users' && selectedInstitute && (
              <UserManagement institute={selectedInstitute} onUpdateInstitute={handleUpdateSelectedInstitute} />
            )}
            {adminScreen === 'docks' && selectedInstitute && (
              <DockManagement institute={selectedInstitute} onUpdateInstitute={handleUpdateSelectedInstitute} />
            )}
            {adminScreen === 'pricing' && selectedInstitute && (
              <PricingConfig institute={selectedInstitute} onUpdateInstitute={handleUpdateSelectedInstitute} />
            )}
            {adminScreen === 'revenue' && selectedInstitute && <RevenueReports institute={selectedInstitute} />}

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

            {currentScreen === 'ride-complete' && lastCompletedRide && (
              <RideCompleteScreen
                rideData={lastCompletedRide}
                onContinue={handleRideCompleteContinue}
                onReportIssue={handleRideCompleteReport}
              />
            )}

            {currentScreen === 'report-issue' && (
              <ReportIssueScreen bikeId={lastCompletedRide?.vehicleId ?? RIDE_VEHICLE_ID} onSubmit={handleIssueSubmit} onSkip={handleReportComplete} />
            )}

            {currentScreen === 'wallet' && <WalletScreen onBack={() => setCurrentScreen('home')} />}

            {currentScreen === 'history' && <HistoryScreen rides={userRideHistory} onBack={() => setCurrentScreen('home')} />}

            {currentScreen === 'profile' && <ProfileScreen onBack={() => setCurrentScreen('home')} onLogout={handleLogout} />}

            {['home', 'wallet', 'history', 'profile'].includes(currentScreen) && (
              <BottomNav activeTab={currentScreen} onTabChange={handleTabChange} />
            )}
          </>
        )}
      </div>
      </ThemeProvider>
    </NotificationProvider>
  );
}
