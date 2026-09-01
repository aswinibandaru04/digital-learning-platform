import { useEffect, useState } from 'react';
import { Users, ClipboardList, CheckCircle, Percent, TrendingUp, Star, AlertTriangle } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/common/StatCard';
import Loader from '@/components/common/Loader';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';
import Badge from '@/components/common/Badge';
import { getTeacherAnalytics } from '@/services/attemptService';
import { extractError } from '@/services/api';

export default function TeacherAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getTeacherAnalytics();
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
  if (!data) return <EmptyState icon={TrendingUp} title="No analytics available" description="Analytics will appear once students start submitting assignments." />;

  const topicPerf = data.topicPerformance || [];
  const maxTopic = Math.max(1, ...topicPerf.map((t) => t.percentage || t.score || 0));

  return (
    <div>
      <PageHeader title="Analytics" description="Class performance and student insights" />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard icon={Users} label="Total Students" value={data.totalStudents ?? 0} accent="indigo" />
        <StatCard icon={ClipboardList} label="Total Assignments" value={data.totalAssignments ?? 0} accent="blue" />
        <StatCard icon={CheckCircle} label="Completed Submissions" value={data.completedSubmissions ?? 0} accent="emerald" />
        <StatCard icon={Percent} label="Completion Rate" value={`${Number(data.completionRate ?? 0).toFixed(1)}%`} accent="amber" />
        <StatCard icon={TrendingUp} label="Average Class Score" value={`${Number(data.averageClassScore ?? 0).toFixed(1)}%`} accent="violet" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {data.strongStudents?.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2"><Star className="h-5 w-5 text-amber-500" /><h3 className="text-sm font-semibold text-slate-800">Strong Students</h3></div>
            <div className="space-y-2">
              {data.strongStudents.map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2">
                  <span className="text-sm font-medium text-slate-700">{s.name || s.studentName || 'Student'}</span>
                  <Badge color="amber">{s.averageScore || s.score || 0}%</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.studentsNeedingSupport?.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-rose-500" /><h3 className="text-sm font-semibold text-slate-800">Students Needing Support</h3></div>
            <div className="space-y-2">
              {data.studentsNeedingSupport.map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-rose-50 px-3 py-2">
                  <span className="text-sm font-medium text-slate-700">{s.name || s.studentName || 'Student'}</span>
                  <Badge color="rose">{s.averageScore || s.score || 0}%</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {topicPerf.length > 0 && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-800">Topic Performance</h3>
          <div className="space-y-3">
            {topicPerf.map((t, i) => (
              <div key={i}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{t.topic}</span>
                  <span className="text-slate-500">{Number(t.percentage || t.score || 0).toFixed(1)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${((t.percentage || t.score || 0) / maxTopic) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.studentPerformance?.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-3"><h3 className="text-sm font-semibold text-slate-800">Student Performance</h3></div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Student</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Completed</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Avg Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.studentPerformance.map((s, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-sm font-medium text-slate-900">{s.name || s.studentName || 'Student'}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{s.completedAssignments ?? s.completed ?? 0}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{Number(s.averageScore ?? s.score ?? 0).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
