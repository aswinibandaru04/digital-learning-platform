import { Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Header({ onMenuClick }) {
  const { user } = useAuth();
  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur lg:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="hidden lg:block">
        <p className="text-sm font-semibold text-slate-800">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}
        </p>
        <p className="text-xs text-slate-500">{user?.email}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 sm:inline">
          {user?.role}
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
          {initials}
        </div>
      </div>
    </header>
  );
}
