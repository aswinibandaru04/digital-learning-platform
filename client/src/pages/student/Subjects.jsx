import { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Loader from '@/components/common/Loader';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';
import Badge from '@/components/common/Badge';
import { getSubjects } from '@/services/subjectService';
import { extractError } from '@/services/api';

export default function StudentSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getSubjects();
        setSubjects(data.subjects || []);
      } catch (err) {
        setError(extractError(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <PageHeader title="Subjects" description="Browse available subjects" />
      {error && <ErrorMessage message={error} className="mb-6" />}
      {loading ? (
        <Loader label="Loading subjects..." />
      ) : subjects.length === 0 ? (
        <EmptyState icon={Layers} title="No subjects available yet" description="Subjects will appear here once teachers create them." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <div key={s._id || s.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50"><Layers className="h-5 w-5 text-blue-600" /></div>
                <Badge color="blue">{s.class}</Badge>
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900">{s.name}</h3>
              <p className="mt-1 text-sm text-slate-500 line-clamp-2">{s.description || 'No description'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
