import { useEffect, useState } from 'react';
import { ClipboardList, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Loader from '@/components/common/Loader';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';
import Badge from '@/components/common/Badge';
import { getStudentAssignments } from '@/services/assignmentService';
import { extractError } from '@/services/api';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getStudentAssignments();
        setAssignments(data.assignments || data || []);
      } catch (err) {
        setError(extractError(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—');
  const statusColor = { Draft: 'slate', Published: 'emerald', Completed: 'indigo' };

  return (
    <div>
      <PageHeader title="Assignments" description="Your assigned assignments" />
      {error && <ErrorMessage message={error} className="mb-6" />}

      {loading ? (
        <Loader label="Loading assignments..." />
      ) : assignments.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No assignments yet" description="Assignments will appear here once a teacher assigns them to you." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.map((a) => (
            <Link
              key={a._id || a.id}
              to={`/student/assignments/${a._id || a.id}`}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-indigo-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50"><ClipboardList className="h-5 w-5 text-indigo-600" /></div>
                <Badge color={statusColor[a.status] || 'slate'}>{a.status || 'Published'}</Badge>
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900">{a.title}</h3>
              <p className="mt-1 text-xs text-slate-400">Topic: {a.topic || '—'}</p>
              <p className="mt-1 text-sm text-slate-500 line-clamp-2">{a.description || 'No description'}</p>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="flex items-center gap-1.5 text-xs text-slate-500"><Calendar className="h-3.5 w-3.5" /> Due {formatDate(a.dueDate)}</span>
                <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-600" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
