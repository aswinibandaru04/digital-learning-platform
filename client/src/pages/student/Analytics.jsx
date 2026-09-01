import { useEffect, useState } from 'react';
import { ClipboardList, CheckCircle, Percent, TrendingUp, Target, Crosshair } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/common/StatCard';
import Loader from '@/components/common/Loader';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';
import Badge from '@/components/common/Badge';
import { getStudentAnalytics } from '@/services/attemptService';
import { extractError } from '@/services/api';

export default function StudentAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getStudentAnalytics();
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
  if (!data) return <EmptyState icon={TrendingUp} title="No analytics available" description="Your analytics will appear after you submit assignments." />;

  return (
    <div>
      <PageHeader title="Analytics" description="Your learning progress and performance" />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={ClipboardList} label="Total Assignments" value={data.totalAssignments ?? 0} accent="indigo" />
        <StatCard icon={CheckCircle} label="Completed" value={data.completedAssignments ?? 0} accent="emerald" />
        <StatCard icon={Percent} label="Completion Rate" value={`${Number(data.completionRate ?? 0).toFixed(1)}%`} accent="amber" />
        <StatCard icon={TrendingUp} label="Average Score" value={`${Number(data.averageScore ?? 0).toFixed(1)}%`} accent="blue" />
        <StatCard icon={Crosshair} label="Accuracy" value={`${Number(data.accuracy ?? 0).toFixed(1)}%`} accent="violet" />
        <StatCard icon={Target} label="Learning Score" value={Number(data.learningScore ?? 0).toFixed(1)} accent="rose" />
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
    </div>
  );
}
