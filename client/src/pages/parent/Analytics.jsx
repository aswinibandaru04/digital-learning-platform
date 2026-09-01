import { useEffect, useState } from 'react';
import { TrendingUp, User, ClipboardList, CheckCircle, Percent, Crosshair } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/common/StatCard';
import Loader from '@/components/common/Loader';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';
import Badge from '@/components/common/Badge';
import { getParentAnalytics } from '@/services/attemptService';
import { extractError } from '@/services/api';

export default function ParentAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getParentAnalytics();
        setData(data);
      } catch (err) {
        setError(extractError(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader size="lg" label="Loading analytics..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return <EmptyState icon={User} title="No analytics available" description="Link a student to view their analytics." />;

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—');
  const recentResults = data.recentResults || data.results || [];

  return (
    <div>
      <PageHeader title="Analytics" description="Your child's performance overview" />

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

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {data.strongTopics?.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Strong Topics</h3>
            <div className="space-y-2">
              {data.strongTopics.map((t, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2">
                  <span className="text-sm font-medium text-slate-700">{t.topic || t.name}</span>
                  <Badge color="emerald">{Number(t.percentage || t.score || 0).toFixed(1)}%</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.weakTopics?.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Weak Topics</h3>
            <div className="space-y-2">
              {data.weakTopics.map((t, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-rose-50 px-3 py-2">
                  <span className="text-sm font-medium text-slate-700">{t.topic || t.name}</span>
                  <Badge color="rose">{Number(t.percentage || t.score || 0).toFixed(1)}%</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {recentResults.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-3"><h3 className="text-sm font-semibold text-slate-800">Recent Results</h3></div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Assignment</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Score</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Percentage</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentResults.map((r, i) => {
                  const pct = r.percentage ?? 0;
                  return (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{r.assignment?.title || r.assignmentTitle || '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{r.score}/{r.totalQuestions}</td>
                      <td className="px-5 py-3.5"><Badge color={pct >= 75 ? 'emerald' : pct >= 50 ? 'amber' : 'rose'}>{Number(pct).toFixed(1)}%</Badge></td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{formatDate(r.submittedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
