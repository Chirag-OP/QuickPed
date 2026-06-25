import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';
interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  institutionalEmail?: string;
  role: 'GUEST_RIDER' | 'VERIFIED_RIDER' | 'ADMIN' | 'SUPER_ADMIN';
  walletBalance: number;
  campusId?: string;
}
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<User | null>;
  setWalletBalance: (balance: number) => void;
  login: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otpCode: string) => Promise<void>;
  updateProfile: (name: string, campusId: string) => Promise<void>;
  verifyStudentEmail: (email: string, otpCode: string) => Promise<void>;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('qp_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const fetchUser = async (): Promise<User | null> => {
    if (!token) {
      setIsLoading(false);
      return null;
    }
    try {
      const response = await api.get('/users/me');
      const profile = response.data;
      setUser(profile);
      return profile;
    } catch (error) {
      setToken(null);
      setUser(null);
      localStorage.removeItem('qp_auth_token');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchUser();
  }, [token]);
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('unauthorized_redirect', handleUnauthorized);
    return () => window.removeEventListener('unauthorized_redirect', handleUnauthorized);
  }, []);
  const login = async (phone: string) => {
    await api.post('/auth/otp/send', { phoneNumber: phone });
  };
  const verifyOtp = async (phone: string, otpCode: string) => {
    const response = await api.post('/auth/otp/verify', { phoneNumber: phone, otpCode });
    if (response.data.token) {
      localStorage.setItem('qp_auth_token', response.data.token);
      setToken(response.data.token);
    }
  };
  const updateProfile = async (name: string, campusId: string) => {
    await api.put('/users/me/profile', { name, campusId });
    await fetchUser(); 
  };
  const setWalletBalance = (balance: number) => {
    const nextBalance = Math.max(0, Number.isFinite(balance) ? balance : 0);
    setUser((current) => {
      if (!current) return current;
      return { ...current, walletBalance: nextBalance };
    });
  };
  const verifyStudentEmail = async (email: string, otpCode: string) => {
    const response = await api.post('/auth/email-otp/verify', { email, otpCode });
    if (response.data.token) {
      localStorage.setItem('qp_auth_token', response.data.token);
      setToken(response.data.token);
      await fetchUser(); 
    }
  };
  const logout = () => {
    localStorage.removeItem('qp_auth_token');
    localStorage.removeItem('qp_user_profile');
    setToken(null);
    setUser(null);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        refreshUser: fetchUser,
        setWalletBalance,
        login,
        verifyOtp,
        updateProfile,
        verifyStudentEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
