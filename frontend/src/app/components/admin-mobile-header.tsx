import React from 'react';
import { Menu } from 'lucide-react';
import { NotificationBell } from './notification-bell';

interface AdminMobileHeaderProps {
  screenName: string;
  onMenuClick?: () => void;
}

export const AdminMobileHeader: React.FC<AdminMobileHeaderProps> = ({
  screenName,
  onMenuClick,
}) => (
  <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#eceae6] bg-white px-4 py-3.5 lg:hidden">
    <button
      type="button"
      onClick={onMenuClick}
      className="flex h-10 w-10 items-center justify-center rounded-xl text-[#1a1a1a]"
      aria-label="Menu"
    >
      <Menu size={22} />
    </button>

    <div className="text-center">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-[#9a9a9a]">ADMIN</p>
      <p className="text-[15px] font-bold text-[#1a1a1a]">{screenName}</p>
    </div>

    <NotificationBell className="border-0 bg-transparent shadow-none p-0 h-10 w-10" />
  </header>
);
