import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LogOut, GraduationCap } from 'lucide-react';

const navByRole = {
  Teacher: [
    { to: '/teacher/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { to: '/teacher/courses', label: 'Courses', icon: 'BookOpen' },
    { to: '/teacher/subjects', label: 'Subjects', icon: 'Layers' },
    { to: '/teacher/lessons', label: 'Lessons', icon: 'FileText' },
    { to: '/teacher/assignments', label: 'Assignments', icon: 'ClipboardList' },
    { to: '/teacher/ai-generator', label: 'AI Question Generator', icon: 'Sparkles' },
    { to: '/teacher/analytics', label: 'Analytics', icon: 'BarChart3' },
    { to: '/teacher/profile', label: 'Profile', icon: 'UserCircle' },
  ],
  Student: [
    { to: '/student/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { to: '/student/courses', label: 'Courses', icon: 'BookOpen' },
    { to: '/student/subjects', label: 'Subjects', icon: 'Layers' },
    { to: '/student/lessons', label: 'Lessons', icon: 'FileText' },
    { to: '/student/assignments', label: 'Assignments', icon: 'ClipboardList' },
    { to: '/student/results', label: 'Results', icon: 'Award' },
    { to: '/student/weak-topics', label: 'Weak Topics', icon: 'Target' },
    { to: '/student/analytics', label: 'Analytics', icon: 'BarChart3' },
    { to: '/student/profile', label: 'Profile', icon: 'UserCircle' },
  ],
  Parent: [
    { to: '/parent/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { to: '/parent/link-student', label: 'Link Student', icon: 'Link' },
    { to: '/parent/analytics', label: 'Analytics', icon: 'BarChart3' },
    { to: '/parent/profile', label: 'Profile', icon: 'UserCircle' },
  ],
};

import * as Icons from 'lucide-react';

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = navByRole[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-slate-900">LearnHub</p>
            <p className="text-[11px] text-slate-500">Digital Learning</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {user?.role} Panel
          </p>
          {items.map((item) => {
            const Icon = Icons[item.icon] || Icons.Circle;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
