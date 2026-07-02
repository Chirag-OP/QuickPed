import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Bike, Ticket } from 'lucide-react';

interface AdminMobileBottomNavProps {
  prefix: string;
}

const tabs = [
  { id: 'overview', label: 'Home', Icon: Home, path: '' },
  { id: 'users', label: 'Users', Icon: Users, path: 'users' },
  { id: 'fleet', label: 'Fleet', Icon: Bike, path: 'fleet' },
  { id: 'support', label: 'Tickets', Icon: Ticket, path: 'support' },
];

const resolveTab = (pathname: string, prefix: string) => {
  const rest = pathname.replace(`/${prefix}`, '').replace(/^\//, '');
  if (!rest) return 'overview';
  if (rest.startsWith('users')) return 'users';
  if (rest.startsWith('fleet') || rest.startsWith('docks')) return 'fleet';
  if (rest.startsWith('support')) return 'support';
  return 'overview';
};

export const AdminMobileBottomNav: React.FC<AdminMobileBottomNavProps> = ({ prefix }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = resolveTab(location.pathname, prefix);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe lg:hidden">
      <div className="mx-auto mb-3 flex max-w-md items-center justify-around rounded-full bg-[#1a1a1a] px-2 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
        {tabs.map(({ id, label, Icon, path }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => navigate(`/${prefix}${path ? `/${path}` : ''}`)}
              className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-full py-1.5 transition-all ${
                isActive ? 'text-[#FF8C42]' : 'text-[#888]'
              }`}
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                isActive ? 'bg-[#FF8C42]/15' : ''
              }`}>
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              </div>
              {isActive && (
                <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-[#FF8C42]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
