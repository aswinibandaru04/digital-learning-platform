import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/common/PageHeader';
import { Mail, UserCircle, Shield, IdCard } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  const fields = [
    { label: 'Full name', value: user?.name, icon: UserCircle },
    { label: 'Email address', value: user?.email, icon: Mail },
    { label: 'Role', value: user?.role, icon: Shield },
    { label: 'User ID', value: user?.id, icon: IdCard },
  ];

  return (
    <div>
      <PageHeader title="Profile" description="Your account information" />
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-slate-50 px-6 py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white">
            {(user?.name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {fields.map((f) => (
            <div key={f.label} className="flex items-center gap-4 px-6 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <f.icon className="h-5 w-5 text-slate-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{f.label}</p>
                <p className="mt-0.5 truncate text-sm font-medium text-slate-800">{f.value || '—'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-400">
        Profile editing is not available in the current backend.
      </p>
    </div>
  );
}
