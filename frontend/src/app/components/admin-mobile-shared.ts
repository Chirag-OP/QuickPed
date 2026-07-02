import type { IssueReport } from '../lib/admin-data';

export const ORANGE = '#FF8C42';

export const formatRelativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

export const avatarColors = ['#FF8C42', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export const fallbackTickets: IssueReport[] = [];
