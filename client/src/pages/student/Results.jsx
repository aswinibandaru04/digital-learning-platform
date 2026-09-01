import { useEffect, useState } from 'react';
import { Award } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Loader from '@/components/common/Loader';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';
import Badge from '@/components/common/Badge';
import { getMyResults } from '@/services/attemptService';
import { extractError } from '@/services/api';

export default function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getMyResults();
        setResults(data.results || data || []);
      } catch (err) {
        setError(extractError(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—');

  return (
    <div>
      <PageHeader title="My Results" description="Your assignment submission results" />
      {error && <ErrorMessage message={error} className="mb-6" />}

      {loading ? (
        <Loader label="Loading results..." />
      ) : results.length === 0 ? (
        <EmptyState icon={Award} title="No results yet" description="Your results will appear here after you submit assignments." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Assignment</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Topic</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Score</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Percentage</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((r, i) => {
                  const pct = r.percentage ?? 0;
                  return (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{r.assignment?.title || r.assignmentTitle || '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{r.topic || r.assignment?.topic || '—'}</td>
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
