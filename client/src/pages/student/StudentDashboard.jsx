import { useEffect, useState } from 'react';
import { ClipboardList, TrendingUp, Award, Target, BookOpen, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/common/StatCard';
import Loader from '@/components/common/Loader';
import ErrorMessage from '@/components/common/ErrorMessage';
import { getStudentAssignments } from '@/services/assignmentService';
import { getStudentAnalytics } from '@/services/attemptService';
import { getCourses } from '@/services/courseService';
import { extractError } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [aRes, anRes, cRes] = await Promise.allSettled([
          getStudentAssignments(),
          getStudentAnalytics(),
          getCourses(),
        ]);
        const v = (r) => (r.status === 'fulfilled' ? r.value.data : null);
        setStats({
          assignments: v(aRes)?.count ?? v(aRes)?.assignments?.length ?? 0,
          courses: v(cRes)?.count ?? v(cRes)?.courses?.length ?? 0,
          completed: v(anRes)?.completedAssignments ?? 0,
          avgScore: v(anRes)?.averageScore ?? 0,
          completionRate: v(anRes)?.completionRate ?? 0,
        });
      } catch (err) {
        setError(extractError(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <PageHeader title="Student Dashboard" description={`Welcome${user?.name ? ', ' + user.name.split(' ')[0] : ''}! Keep up the great work.`} />

      {error && <ErrorMessage message={error} className="mb-6" />}

      {loading ? (
        <Loader size="lg" label="Loading dashboard..." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={BookOpen} label="Available Courses" value={stats?.courses ?? 0} accent="indigo" />
            <StatCard icon={ClipboardList} label="Assignments" value={stats?.assignments ?? 0} accent="blue" />
            <StatCard icon={CheckCircle} label="Completed" value={stats?.completed ?? 0} accent="emerald" />
            <StatCard icon={TrendingUp} label="Average Score" value={`${Number(stats?.avgScore ?? 0).toFixed(1)}%`} accent="violet" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/student/assignments" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-indigo-300">
              <ClipboardList className="h-6 w-6 text-indigo-600" />
              <p className="mt-2 text-sm font-semibold text-slate-800">My Assignments</p>
              <p className="text-xs text-slate-500">View and submit assignments</p>
            </Link>
            <Link to="/student/results" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-indigo-300">
              <Award className="h-6 w-6 text-amber-500" />
              <p className="mt-2 text-sm font-semibold text-slate-800">My Results</p>
              <p className="text-xs text-slate-500">Check your scores</p>
            </Link>
            <Link to="/student/weak-topics" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-indigo-300">
              <Target className="h-6 w-6 text-rose-500" />
              <p className="mt-2 text-sm font-semibold text-slate-800">Weak Topics</p>
              <p className="text-xs text-slate-500">Areas to improve</p>
            </Link>
            <Link to="/student/analytics" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-indigo-300">
              <TrendingUp className="h-6 w-6 text-emerald-500" />
              <p className="mt-2 text-sm font-semibold text-slate-800">Analytics</p>
              <p className="text-xs text-slate-500">Your learning progress</p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
