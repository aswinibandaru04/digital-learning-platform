import { useEffect, useState } from 'react';
import { ClipboardList, CheckCircle, Percent, TrendingUp, Crosshair, User, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/common/StatCard';
import Loader from '@/components/common/Loader';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/common/Button';
import { getParentAnalytics } from '@/services/attemptService';
import { useAuth } from '@/context/AuthContext';
import { extractError } from '@/services/api';

export default function ParentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasChild, setHasChild] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getParentAnalytics();
        setData(data);
        setHasChild(!!(data.childName || data.child?.name || data.studentEmail || data.childEmail));
      } catch (err) {
        const msg = extractError(err);
        if (err.response?.status === 404 || msg.toLowerCase().includes('link') || msg.toLowerCase().includes('child') || msg.toLowerCase().includes('student')) {
          setHasChild(false);
        } else {
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <PageHeader title="Parent Dashboard" description={`Welcome${user?.name ? ', ' + user.name.split(' ')[0] : ''}`} />

      {error && <ErrorMessage message={error} className="mb-6" />}

      {loading ? (
        <Loader size="lg" label="Loading dashboard..." />
      ) : !hasChild ? (
        <EmptyState
          icon={LinkIcon}
          title="No linked student yet"
          description="Link your child's student account to view their performance and analytics."
          action={<Link to="/parent/link-student"><Button><LinkIcon className="h-4 w-4" /> Link a Student</Button></Link>}
        />
      ) : (
        <>
          <div className="mb-6 flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100"><User className="h-6 w-6 text-indigo-600" /></div>
            <div>
              <p className="text-base font-semibold text-slate-900">{data.childName || data.child?.name || 'Student'}</p>
              <p className="text-sm text-slate-500">{data.childEmail || data.studentEmail || data.child?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <StatCard icon={ClipboardList} label="Total Assignments" value={data.totalAssignments ?? 0} accent="indigo" />
            <StatCard icon={CheckCircle} label="Completed" value={data.completedAssignments ?? 0} accent="emerald" />
            <StatCard icon={Percent} label="Completion Rate" value={`${Number(data.completionRate ?? 0).toFixed(1)}%`} accent="amber" />
            <StatCard icon={TrendingUp} label="Average Score" value={`${Number(data.averageScore ?? 0).toFixed(1)}%`} accent="blue" />
            <StatCard icon={Crosshair} label="Accuracy" value={`${Number(data.accuracy ?? 0).toFixed(1)}%`} accent="violet" />
          </div>

          <div className="mt-6">
            <Link to="/parent/analytics"><Button variant="outline">View Full Analytics</Button></Link>
          </div>
        </>
      )}
    </div>
  );
}
