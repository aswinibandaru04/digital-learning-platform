import { useEffect, useState } from 'react';
import { FileText, Plus, Search } from 'lucide-react';
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
import { getLessons, createLesson } from '@/services/lessonService';
import { getSubjects } from '@/services/subjectService';
import { extractError } from '@/services/api';

const DIFFICULTY = ['Easy', 'Medium', 'Hard'];
const CONTENT_TYPES = ['Text', 'PDF', 'Video', 'Image'];

export default function TeacherLessons() {
  const toast = useToast();
  const [lessons, setLessons] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', subject: '', difficulty: 'Easy', contentType: 'Text',
    content: '', videoUrl: '', pdfUrl: '', imageUrl: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [lesRes, subRes] = await Promise.all([getLessons(), getSubjects()]);
      setLessons(lesRes.data.lessons || []);
      setSubjects(subRes.data.subjects || []);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const subjectOptions = subjects.map((s) => ({ value: s._id || s.id, label: `${s.name} (${s.class})` }));
  const subjectName = (id) => subjects.find((s) => (s._id || s.id) === id)?.name || '—';

  const filtered = lessons.filter((l) =>
    !search || l.title?.toLowerCase().includes(search.toLowerCase()) || subjectName(l.subject)?.toLowerCase().includes(search.toLowerCase())
  );

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.subject) e.subject = 'Select a subject';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = { ...form };
      Object.keys(payload).forEach((k) => { if (payload[k] === '') delete payload[k]; });
      await createLesson(payload);
      toast.success('Lesson created successfully');
      setModalOpen(false);
      setForm({ title: '', description: '', subject: '', difficulty: 'Easy', contentType: 'Text', content: '', videoUrl: '', pdfUrl: '', imageUrl: '' });
      load();
    } catch (err) {
      toast.error(extractError(err, 'Failed to create lesson'));
    } finally {
      setSubmitting(false);
    }
  };

  const difficultyColor = { Easy: 'emerald', Medium: 'amber', Hard: 'rose' };

  return (
    <div>
      <PageHeader
        title="Lessons"
        description="Create and manage lessons for your subjects"
        action={<Button onClick={() => setModalOpen(true)} disabled={subjects.length === 0}><Plus className="h-4 w-4" /> New Lesson</Button>}
      />

      {error && <ErrorMessage message={error} className="mb-6" />}

      {!loading && lessons.length > 0 && (
        <div className="mb-4 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lessons..."
            className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          />
        </div>
      )}

      {loading ? (
        <Loader label="Loading lessons..." />
      ) : lessons.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No lessons available yet"
          description={subjects.length === 0 ? 'Create a subject first, then add lessons.' : 'Create your first lesson.'}
          action={subjects.length > 0 ? <Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Create Lesson</Button> : null}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => (
            <div key={l._id || l.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
                  <FileText className="h-5 w-5 text-violet-600" />
                </div>
                <div className="flex gap-1.5">
                  <Badge color={difficultyColor[l.difficulty] || 'slate'}>{l.difficulty || '—'}</Badge>
                  <Badge color="indigo">{l.contentType || 'Text'}</Badge>
                </div>
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900">{l.title}</h3>
              <p className="mt-1 text-xs text-slate-400">Subject: {subjectName(l.subject)}</p>
              <p className="mt-1 text-sm text-slate-500 line-clamp-2">{l.description || 'No description'}</p>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Lesson"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={submitting} disabled={submitting}>Create</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Lesson title" name="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} error={formErrors.title} placeholder="e.g. Introduction to Algebra" required />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Subject" name="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} error={formErrors.subject} options={subjectOptions} placeholder="Select subject" required />
            <Select label="Difficulty" name="difficulty" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} options={DIFFICULTY.map((d) => ({ value: d, label: d }))} />
            <Select label="Content type" name="contentType" value={form.contentType} onChange={(e) => setForm({ ...form, contentType: e.target.value })} options={CONTENT_TYPES.map((c) => ({ value: c, label: c }))} />
          </div>
          <Input label="Description" name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief lesson description" />
          {form.contentType === 'Text' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Content</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={4}
                placeholder="Lesson text content"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
              />
            </div>
          )}
          {form.contentType === 'Video' && <Input label="Video URL" name="videoUrl" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://..." />}
          {form.contentType === 'PDF' && <Input label="PDF URL" name="pdfUrl" value={form.pdfUrl} onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })} placeholder="https://..." />}
          {form.contentType === 'Image' && <Input label="Image URL" name="imageUrl" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />}
        </form>
      </Modal>
    </div>
  );
}
