import { useEffect, useState } from 'react';
import { Layers, Plus } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Modal from '@/components/common/Modal';
import Loader from '@/components/common/Loader';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';
import Badge from '@/components/common/Badge';
import { useToast } from '@/components/common/Toast';
import { getSubjects, createSubject } from '@/services/subjectService';
import { getCourses } from '@/services/courseService';
import { extractError } from '@/services/api';

export default function TeacherSubjects() {
  const toast = useToast();
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', class: '', description: '', course: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [subRes, courseRes] = await Promise.all([
        getSubjects(),
        getCourses(),
      ]);
      setSubjects(subRes.data.subjects || []);
      setCourses(courseRes.data.courses || []);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const courseOptions = courses.map((c) => ({ value: c._id || c.id, label: `${c.name} (${c.classLevel})` }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Subject name is required';
    if (!form.class.trim()) e.class = 'Class is required';
    if (!form.course) e.course = 'Please select a course';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createSubject({
        name: form.name.trim(),
        class: form.class.trim(),
        description: form.description.trim(),
        course: form.course,
      });
      toast.success('Subject created successfully');
      setModalOpen(false);
      setForm({ name: '', class: '', description: '', course: '' });
      load();
    } catch (err) {
      toast.error(extractError(err, 'Failed to create subject'));
    } finally {
      setSubmitting(false);
    }
  };

  const courseName = (id) => {
    const c = courses.find((x) => (x._id || x.id) === id);
    return c ? c.name : '—';
  };

  return (
    <div>
      <PageHeader
        title="Subjects"
        description="Create and manage subjects under your courses"
        action={<Button onClick={() => setModalOpen(true)} disabled={courses.length === 0}><Plus className="h-4 w-4" /> New Subject</Button>}
      />

      {error && <ErrorMessage message={error} className="mb-6" />}

      {loading ? (
        <Loader label="Loading subjects..." />
      ) : subjects.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No subjects available yet"
          description={courses.length === 0 ? 'Create a course first, then add subjects to it.' : 'Create your first subject.'}
          action={courses.length > 0 ? <Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Create Subject</Button> : null}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <div key={s._id || s.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Layers className="h-5 w-5 text-blue-600" />
                </div>
                <Badge color="blue">{s.class}</Badge>
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900">{s.name}</h3>
              <p className="mt-1 text-xs text-slate-400">Course: {courseName(s.course)}</p>
              <p className="mt-1 text-sm text-slate-500 line-clamp-2">{s.description || 'No description'}</p>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Subject"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={submitting} disabled={submitting}>Create</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Subject name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={formErrors.name} placeholder="e.g. Algebra" required />
          <Input label="Class" name="class" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} error={formErrors.class} placeholder="e.g. Grade 10" required />
          <Select label="Course" name="course" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} error={formErrors.course} options={courseOptions} placeholder="Select a course" required />
          <Input label="Description" name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief subject description" />
        </form>
      </Modal>
    </div>
  );
}
