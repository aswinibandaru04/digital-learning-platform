import { useEffect, useState } from 'react';
import { Target } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Loader from '@/components/common/Loader';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';
import Badge from '@/components/common/Badge';
import { getWeakTopics } from '@/services/attemptService';
import { extractError } from '@/services/api';

export default function WeakTopics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getWeakTopics();
        setTopics(data.weakTopics || data.topics || data || []);
      } catch (err) {
        setError(extractError(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const levelColor = { Weak: 'rose', 'Needs Practice': 'amber', Strong: 'emerald' };

  return (
    <div>
      <PageHeader title="Weak Topics" description="Identify areas that need more practice" />
      {error && <ErrorMessage message={error} className="mb-6" />}

      {loading ? (
        <Loader label="Loading weak topics..." />
      ) : topics.length === 0 ? (
        <EmptyState icon={Target} title="No topic data yet" description="Your weak topics will appear here after you submit assignments." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t, i) => {
            const pct = t.percentage ?? t.score ?? 0;
            const level = t.level || (pct < 40 ? 'Weak' : pct < 70 ? 'Needs Practice' : 'Strong');
            return (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50"><Target className="h-5 w-5 text-rose-500" /></div>
                  <Badge color={levelColor[level] || 'slate'}>{level}</Badge>
                </div>
                <h3 className="mt-3 text-base font-semibold text-slate-900">{t.topic}</h3>
                <p className="mt-1 text-2xl font-bold text-slate-900">{Number(pct).toFixed(1)}%</p>
                <p className="text-xs text-slate-400">{t.attempts || 0} attempts</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${level === 'Weak' ? 'bg-rose-500' : level === 'Needs Practice' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
