import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { WelcomeScreen } from './screens/welcome-screen';
import { LoginScreen } from './screens/login-screen';
import type { AdminKey } from './screens/login-screen';
import { HomeScreen } from './screens/home-screen';
import { ActiveRideScreen } from './screens/active-ride-screen';
import { WalletScreen } from './screens/wallet-screen';
import { HistoryScreen } from './screens/history-screen';
import { ProfileScreen } from './screens/profile-screen';

import { ProfileSettingsScreen } from './screens/profile-settings-screen';
import { ProfileNotificationsScreen } from './screens/profile-notifications-screen';
import { SavedPlacesScreen } from './screens/saved-places-screen';
import { HelpSupportScreen } from './screens/help-support-screen';
import { ScanScreen } from './screens/scan-screen';
import { RideCompleteScreen } from './screens/ride-complete-screen';
import { ReportIssueScreen } from './screens/report-issue-screen';
import { AdminDashboard } from './screens/admin-dashboard';
import { UserManagement } from './screens/user-management';
import { FleetManagement } from './screens/fleet-management';
import { DockManagement } from './screens/dock-management';
import { PricingConfig } from './screens/pricing-config';
import { RevenueReports } from './screens/revenue-reports';
import { CampusSetup } from './screens/campus-setup';
import { AdminRideHistory } from './screens/admin-ride-history';
import { BottomNav } from './components/bottom-nav';
import { NotificationProvider } from './contexts/notification-context';
import { NotificationBell } from './components/notification-bell';
import {
  calculateRideFare,
  getCompletedRides,
  getInstituteRevenue,
  recalculateDockOccupancy,
  syncInstituteMetrics,
  type AdminUser,
  type InstituteData,
  type IssueReport,
  type RideHistoryRecord,
} from './lib/admin-data';
import { loadInstitutes, saveInstitutes, loadSelectedCampusId, saveSelectedCampusId } from './lib/admin-storage';
import { Toaster } from 'sonner';
import { X } from 'lucide-react';
import { AdminSidebar } from './components/admin-sidebar';
import { AdminMobileHeader } from './components/admin-mobile-header';
import { AdminMobileBottomNav } from './components/admin-mobile-bottom-nav';
import { AdminMobileUsers } from './components/admin-mobile-users';
import { AdminMobileFleetDocks } from './components/admin-mobile-fleet-docks';
import { AdminMobileSupport } from './components/admin-mobile-support';

type LoginMode = 'choice' | 'user' | 'admin';

const ADMIN_DISPLAY_NAMES: Record<AdminKey, string> = {
  parth: 'Parth Bansal',
  chirag: 'Chirag',
  arshpreet: 'Arshpreet',
};

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

function RootGatekeeper() {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/welcome" replace />;
  if (user?.role === 'SUPER_ADMIN') return <Navigate to="/hq-dashboard" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin-dashboard" replace />;
  if (!user?.campusId) return <Navigate to="/profile-setup" replace />;
  return <Navigate to="/dashboard" replace />;
}

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

const getMobileScreenName = (pathname: string, prefix: string) => {
  const rest = pathname.replace(`/${prefix}`, '').replace(/^\//, '');
  if (!rest) return 'Overview';
  if (rest.startsWith('campus')) return 'Campus';
  if (rest.startsWith('users')) return 'Users';
  if (rest.startsWith('fleet') || rest.startsWith('docks')) return 'Fleet & Docks';
  if (rest.startsWith('rides')) return 'Ride History';
  if (rest.startsWith('support')) return 'Support';
  return 'Overview';
};

function AdminLayout({
  institutes,
  selectedInstitute,
  selectedInstituteId,
  onSelectInstitute,
  onAddInstitute,
  onUpdateInstitute,
  adminKey,
  onExitAdmin,
}: any) {
  const navigate = useNavigate();
  const location = useLocation();

  const pathParts = location.pathname.split('/');
  const prefix = pathParts[1];

  const totalUsers = institutes.reduce((sum: number, institute: InstituteData) => sum + institute.users.length, 0);
  const totalSupport = institutes.reduce((sum: number, institute: InstituteData) => sum + institute.issueReports.length, 0);
  const adminDisplayName = ADMIN_DISPLAY_NAMES[adminKey as AdminKey] ?? 'Admin';
  const mobileScreenName = getMobileScreenName(location.pathname, prefix);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
      <div className="flex min-h-screen bg-[#F9F9F9]">
        <AdminSidebar
          prefix={prefix}
          adminName={adminDisplayName}
          adminRole={prefix === 'hq-dashboard' ? 'Super admin' : 'Campus admin'}
          userCount={totalUsers}
          supportCount={totalSupport || 12}
          onLogout={onExitAdmin}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminMobileHeader
            screenName={mobileScreenName}
            onMenuClick={() => setMobileMenuOpen((open) => !open)}
          />

          {mobileMenuOpen && (
            <div className="border-b border-[#eceae6] bg-white px-4 py-3 lg:hidden">
              <p className="text-xs font-semibold text-[#9a9a9a] mb-2">CAMPUS</p>
              <select
                value={selectedInstituteId ?? ''}
                onChange={(e) => {
                  onSelectInstitute(e.target.value);
                  setMobileMenuOpen(false);
                }}
                className="mb-3 w-full h-10 rounded-xl border border-[#eceae6] bg-[#fafafa] px-3 text-sm"
              >
                <option value="">Select campus...</option>
                {institutes.map((institute: InstituteData) => (
                  <option key={institute.id} value={institute.id}>{institute.name}</option>
                ))}
              </select>
              <button
                onClick={onExitAdmin}
                className="w-full rounded-xl bg-[#ef4444] py-2.5 text-sm font-semibold text-white"
              >
                Exit Admin
              </button>
            </div>
          )}

          <div className="hidden lg:flex items-center justify-end gap-3 border-b border-[#eceae6] bg-white px-4 py-3 lg:px-6">
            <NotificationBell />
            <button
              onClick={onExitAdmin}
              className="flex items-center gap-1.5 rounded-full bg-[#ef4444] px-3 py-1.5 text-xs font-medium text-white shadow-sm"
            >
              <X size={13} /> Exit Admin
            </button>
          </div>

          <main className="flex-1 overflow-auto lg:pb-0">
        <Routes>
          <Route 
            path="" 
            element={
              <AdminDashboard
                adminKey={adminKey}
                institutes={institutes}
                selectedInstitute={selectedInstitute}
                selectedInstituteId={selectedInstituteId}
                onSelectInstitute={(id) => {
                  onSelectInstitute(id);
                  navigate(`/${prefix}`);
                }}
                onAddInstitute={onAddInstitute}
                onUpdateInstitute={onUpdateInstitute}
                onNavigate={(screen) => {
                  if (screen === 'user-management') navigate(`/${prefix}/users`);
                  else if (screen === 'fleet-management') navigate(`/${prefix}/fleet`);
                  else navigate(`/${prefix}/${screen}`);
                }}
              />
            } 
          />

          <Route
            path="campus"
            element={
              <CampusSetup
                institutes={institutes}
                selectedInstituteId={selectedInstituteId}
                onSelectInstitute={(id: string) => {
                  onSelectInstitute(id);
                  navigate(`/${prefix}`);
                }}
                onAddInstitute={onAddInstitute}
                onNavigateDocks={() => selectedInstituteId && navigate(`/${prefix}/docks`)}
              />
            }
          />

          {selectedInstitute && (
            <>
              <Route
                path="fleet"
                element={
                  <>
                    <div className="lg:hidden">
                      <AdminMobileFleetDocks institute={selectedInstitute} />
                    </div>
                    <div className="hidden lg:block">
                      <FleetManagement institute={selectedInstitute} onUpdateInstitute={onUpdateInstitute} />
                    </div>
                  </>
                }
              />
              <Route
                path="users"
                element={
                  <>
                    <div className="lg:hidden">
                      <AdminMobileUsers institute={selectedInstitute} onUpdateInstitute={onUpdateInstitute} />
                    </div>
                    <div className="hidden lg:block">
                      <UserManagement institute={selectedInstitute} onUpdateInstitute={onUpdateInstitute} />
                    </div>
                  </>
                }
              />
              <Route
                path="support"
                element={
                  <div className="mx-auto max-w-lg lg:max-w-4xl">
                    <AdminMobileSupport institute={selectedInstitute} />
                  </div>
                }
              />
              <Route path="rides" element={<AdminRideHistory institute={selectedInstitute} />} />
              <Route path="docks" element={<DockManagement institute={selectedInstitute} onUpdateInstitute={onUpdateInstitute} />} />
              <Route path="pricing" element={<PricingConfig institute={selectedInstitute} onUpdateInstitute={onUpdateInstitute} />} />
              <Route path="revenue" element={<RevenueReports institute={selectedInstitute} />} />
            </>
          )}

          <Route path="*" element={<Navigate to={`/${prefix}`} replace />} />
        </Routes>
          </main>

          <AdminMobileBottomNav prefix={prefix} />
        </div>
      </div>
    </ProtectedRoute>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    
    if (isAuthenticated) {
      if (user?.role === 'SUPER_ADMIN') {
        if (location.pathname === '/login' || location.pathname === '/' || location.pathname === '/welcome') {
          navigate('/hq-dashboard');
        }
      } else if (user?.role === 'ADMIN') {
         if (location.pathname === '/login' || location.pathname === '/' || location.pathname === '/welcome') {
          navigate('/admin-dashboard');
        }
      } else {
        if (!user?.campusId) {
          if (location.pathname !== '/profile-setup') {
             navigate('/profile-setup');
          }
        } else if (location.pathname === '/login' || location.pathname === '/' || location.pathname === '/welcome' || location.pathname === '/profile-setup') {
          navigate('/dashboard');
        }
      }
    }
  }, [isAuthenticated, user, isLoading, location.pathname, navigate]);

  const [activeRide, setActiveRide] = useState(false);
  const [initialLoginMode, setInitialLoginMode] = useState<LoginMode>('choice');
  const [adminKey, setAdminKey] = useState<AdminKey>('parth');
  const [institutes, setInstitutes] = useState<InstituteData[]>(() => loadInstitutes());
  const [selectedInstituteId, setSelectedInstituteId] = useState<string | null>(() => loadSelectedCampusId());

  useEffect(() => {
    saveInstitutes(institutes);
  }, [institutes]);

  useEffect(() => {
    saveSelectedCampusId(selectedInstituteId);
  }, [selectedInstituteId]);

  const selectedInstitute = institutes.find((institute) => institute.id === selectedInstituteId) ?? null;
  const [lastCompletedRide, setLastCompletedRide] = useState<RideHistoryRecord | null>(null);
  const [userRideHistory, setUserRideHistory] = useState<RideHistoryRecord[]>([]);

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
    setInitialLoginMode('choice');
    navigate('/login');
  };

  const handleUserLoginSuccess = () => {
    setInitialLoginMode('choice');
    navigate('/dashboard');
  };

  const handleAdminLoginSuccess = (key: AdminKey) => {
    setAdminKey(key);
    setSelectedInstituteId(null);
    navigate('/hq-dashboard');
  };

  const handleAdminGoogleLogin = () => {
    setInitialLoginMode('admin');
    navigate('/login');
  };

  const handleStartRide = () => {
    navigate('/scan');
  };

  const handleScanSuccess = () => {
    setActiveRide(true);
    navigate('/active-ride');
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
    navigate('/ride-complete');
  };

  const handleRideCompleteContinue = () => {
    navigate('/dashboard');
  };

  const handleRideCompleteReport = () => {
    navigate('/report-issue');
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
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setSelectedInstituteId(null);
    logout();
    setInitialLoginMode('choice');
    navigate('/login');
  };

  const handleExitAdmin = () => {
    setSelectedInstituteId(null);
    logout();
    setInitialLoginMode('choice');
    navigate('/login');
  };

  const handleSelectInstitute = (instituteId: string) => {
    setSelectedInstituteId(instituteId);
  };

  const handleAddInstitute = (institute: InstituteData) => {
    setInstitutes((prev) => [...prev, institute]);
    setSelectedInstituteId(institute.id);
  };

  const handleUpdateSelectedInstitute = (updater: (institute: InstituteData) => InstituteData) => {
    setInstitutes((prev) =>
      prev.map((institute) =>
        institute.id === selectedInstituteId ? syncInstituteMetrics(updater(institute)) : institute
      )
    );
  };

  return (
    <NotificationProvider>
      <ThemeProvider>
        <Toaster position="top-center" richColors closeButton />
        <div className="relative min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<RootGatekeeper />} />
            <Route path="/welcome" element={<WelcomeScreen onComplete={handleWelcomeComplete} />} />
            
            <Route 
              path="/login" 
              element={
                <LoginScreen 
                  initialMode={initialLoginMode} 
                  onUserLoginSuccess={handleUserLoginSuccess} 
                  onAdminLoginSuccess={handleAdminLoginSuccess} 
                  onAdminGoogleLogin={handleAdminGoogleLogin} 
                />
              } 
            />
            
            <Route 
              path="/profile-setup" 
              element={
                <ProtectedRoute>
                  <LoginScreen 
                    initialMode="user" 
                    initialStep="profile" 
                    onUserLoginSuccess={handleUserLoginSuccess} 
                    onAdminLoginSuccess={handleAdminLoginSuccess} 
                    onAdminGoogleLogin={handleAdminGoogleLogin} 
                  />
                </ProtectedRoute>
              } 
            />
            
            <Route path="/dashboard" element={<ProtectedRoute><HomeScreen onStartRide={handleStartRide} onNavigate={(s) => navigate(s === 'home' ? '/dashboard' : `/${s}`)} /></ProtectedRoute>} />
            <Route path="/scan" element={<ProtectedRoute><ScanScreen onScanSuccess={handleScanSuccess} onClose={() => navigate('/dashboard')} /></ProtectedRoute>} />
            <Route path="/active-ride" element={<ProtectedRoute><ActiveRideScreen onEndRide={handleEndRide} onBack={() => navigate('/dashboard')} /></ProtectedRoute>} />
            <Route path="/ride-complete" element={<ProtectedRoute><RideCompleteScreen rideData={lastCompletedRide!} onContinue={handleRideCompleteContinue} onReportIssue={handleRideCompleteReport} /></ProtectedRoute>} />
            <Route path="/report-issue" element={<ProtectedRoute><ReportIssueScreen bikeId={lastCompletedRide?.vehicleId ?? RIDE_VEHICLE_ID} onSubmit={handleIssueSubmit} onSkip={handleReportComplete} /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><WalletScreen onBack={() => navigate('/dashboard')} /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><HistoryScreen rides={userRideHistory} onBack={() => navigate('/dashboard')} /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfileScreen onBack={() => navigate('/dashboard')} onAddMoney={() => navigate('/wallet')} onLogout={handleLogout} /></ProtectedRoute>} />

            <Route path="/profile/settings" element={<ProtectedRoute><ProfileSettingsScreen onBack={() => navigate('/profile')} /></ProtectedRoute>} />
            <Route path="/profile/notifications" element={<ProtectedRoute><ProfileNotificationsScreen onBack={() => navigate('/profile')} /></ProtectedRoute>} />
            <Route path="/profile/saved-places" element={<ProtectedRoute><SavedPlacesScreen onBack={() => navigate('/profile')} /></ProtectedRoute>} />
            <Route path="/profile/help-support" element={<ProtectedRoute><HelpSupportScreen onBack={() => navigate('/profile')} /></ProtectedRoute>} />

            
            <Route 
              path="/admin-dashboard/*" 
              element={
                <AdminLayout 
                  institutes={institutes}
                  selectedInstitute={selectedInstitute}
                  selectedInstituteId={selectedInstituteId}
                  onSelectInstitute={handleSelectInstitute}
                  onAddInstitute={handleAddInstitute}
                  onUpdateInstitute={handleUpdateSelectedInstitute}
                  adminKey={adminKey}
                  onExitAdmin={handleExitAdmin}
                />
              } 
            />
            
            <Route 
              path="/hq-dashboard/*" 
              element={
                <AdminLayout 
                  institutes={institutes}
                  selectedInstitute={selectedInstitute}
                  selectedInstituteId={selectedInstituteId}
                  onSelectInstitute={handleSelectInstitute}
                  onAddInstitute={handleAddInstitute}
                  onUpdateInstitute={handleUpdateSelectedInstitute}
                  adminKey={adminKey}
                  onExitAdmin={handleExitAdmin}
                />
              } 
            />
          </Routes>

          {['/dashboard', '/wallet', '/history', '/profile'].includes(location.pathname) && (
            <BottomNav 
              activeTab={location.pathname.replace('/', '') === 'dashboard' ? 'home' : location.pathname.replace('/', '')} 
              onTabChange={(tab) => {
                if (tab === 'scan') handleStartRide();
                else if (tab === 'home') navigate('/dashboard');
                else navigate(`/${tab}`);
              }} 
            />
          )}
        </div>
      </ThemeProvider>
    </NotificationProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
