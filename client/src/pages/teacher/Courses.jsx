import { useEffect, useState } from 'react';
import { BookOpen, Plus } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import Loader from '@/components/common/Loader';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';
import Badge from '@/components/common/Badge';
import { useToast } from '@/components/common/Toast';
import { getCourses, createCourse } from '@/services/courseService';
import { extractError } from '@/services/api';

export default function TeacherCourses() {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', classLevel: '', description: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
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
  };

  useEffect(() => { load(); }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Course name is required';
    if (!form.classLevel.trim()) e.classLevel = 'Class level is required';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createCourse({
        name: form.name.trim(),
        classLevel: form.classLevel.trim(),
        description: form.description.trim(),
      });
      toast.success('Course created successfully');
      setModalOpen(false);
      setForm({ name: '', classLevel: '', description: '' });
      load();
    } catch (err) {
      toast.error(extractError(err, 'Failed to create course'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Courses"
        description="Create and manage your courses"
        action={<Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> New Course</Button>}
      />

      {error && <ErrorMessage message={error} className="mb-6" />}

      {loading ? (
        <Loader label="Loading courses..." />
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses available yet"
          description="Create your first course to start adding subjects and lessons."
          action={<Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Create Course</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <div key={c._id || c.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                </div>
                <Badge color="indigo">{c.classLevel}</Badge>
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900">{c.name}</h3>
              <p className="mt-1 text-sm text-slate-500 line-clamp-2">{c.description || 'No description'}</p>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Course"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={submitting} disabled={submitting}>Create</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Course name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={formErrors.name} placeholder="e.g. Mathematics" required />
          <Input label="Class level" name="classLevel" value={form.classLevel} onChange={(e) => setForm({ ...form, classLevel: e.target.value })} error={formErrors.classLevel} placeholder="e.g. Grade 10" required />
          <Input label="Description" name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief course description" />
        </form>
      </Modal>
    </div>
  );
}
