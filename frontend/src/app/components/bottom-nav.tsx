import React from 'react';
import { BarChart3, Home, QrCode, Smile, User, WalletCards } from 'lucide-react';
import { cn } from '../lib/utils';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'history', label: 'Journey', icon: Smile },
    { id: 'scan', label: 'Scan', icon: QrCode },
    { id: 'wallet', label: 'Wallet', icon: WalletCards },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-0 safe-area-bottom">
      <div className="mx-auto max-w-screen-xl rounded-t-[32px] bg-white px-2 pb-3 pt-2 shadow-[0_-12px_30px_rgba(15,15,15,0.08)]">
        <div className="flex items-end justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isScan = tab.id === 'scan';

            if (isScan) {
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className="group relative -mt-[17px]"
                >
                  <div className="flex h-[66px] w-[66px] items-center justify-center rounded-full border-[5px] border-white bg-[#ff7331] shadow-[0_12px_22px_rgba(255,115,49,0.28)] transition-transform active:scale-95">
                    <Icon size={28} className="text-white" />
                  </div>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'relative flex min-w-[56px] flex-col items-center gap-[5px] rounded-xl px-2 py-1 transition-all',
                  isActive
                    ? 'text-[#ff7331]'
                    : 'text-[#747474] hover:text-[#222]'
                )}
              >
                <Icon
                  size={22}
                  className={cn(
                    'transition-transform',
                    isActive && 'scale-110'
                  )}
                />
                <span className="text-[12px] font-medium leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
