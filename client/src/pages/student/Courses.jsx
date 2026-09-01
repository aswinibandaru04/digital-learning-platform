import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Loader from '@/components/common/Loader';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';
import Badge from '@/components/common/Badge';
import { getCourses } from '@/services/courseService';
import { extractError } from '@/services/api';

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getCourses();
        setCourses(data.courses || []);
      } catch (err) {
        setError(extractError(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <PageHeader title="Courses" description="Browse available courses" />
      {error && <ErrorMessage message={error} className="mb-6" />}
      {loading ? (
        <Loader label="Loading courses..." />
      ) : courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses available yet" description="Courses will appear here once teachers create them." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <div key={c._id || c.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50"><BookOpen className="h-5 w-5 text-indigo-600" /></div>
                <Badge color="indigo">{c.classLevel}</Badge>
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900">{c.name}</h3>
              <p className="mt-1 text-sm text-slate-500 line-clamp-2">{c.description || 'No description'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
