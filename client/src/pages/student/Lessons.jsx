import { useEffect, useState } from 'react';
import { FileText, Search } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Loader from '@/components/common/Loader';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { getLessons } from '@/services/lessonService';
import { extractError } from '@/services/api';

export default function StudentLessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getLessons();
        setLessons(data.lessons || []);
      } catch (err) {
        setError(extractError(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = lessons.filter((l) => !search || l.title?.toLowerCase().includes(search.toLowerCase()));
  const difficultyColor = { Easy: 'emerald', Medium: 'amber', Hard: 'rose' };

  return (
    <div>
      <PageHeader title="Lessons" description="Browse and study your lessons" />
      {error && <ErrorMessage message={error} className="mb-6" />}

      {!loading && lessons.length > 0 && (
        <div className="mb-4 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search lessons..." className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500" />
        </div>
      )}

      {loading ? (
        <Loader label="Loading lessons..." />
      ) : lessons.length === 0 ? (
        <EmptyState icon={FileText} title="No lessons available yet" description="Lessons will appear here once teachers create them." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => (
            <button key={l._id || l.id} onClick={() => setSelected(l)} className="text-left rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-indigo-300">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50"><FileText className="h-5 w-5 text-violet-600" /></div>
                <div className="flex gap-1.5">
                  <Badge color={difficultyColor[l.difficulty] || 'slate'}>{l.difficulty || '—'}</Badge>
                  <Badge color="indigo">{l.contentType || 'Text'}</Badge>
                </div>
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900">{l.title}</h3>
              <p className="mt-1 text-sm text-slate-500 line-clamp-2">{l.description || 'No description'}</p>
            </button>
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title || 'Lesson'} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Badge color={difficultyColor[selected.difficulty] || 'slate'}>{selected.difficulty}</Badge>
              <Badge color="indigo">{selected.contentType}</Badge>
            </div>
            {selected.description && <p className="text-sm text-slate-600">{selected.description}</p>}
            {selected.content && <div className="rounded-lg bg-slate-50 p-4 text-sm whitespace-pre-wrap text-slate-700">{selected.content}</div>}
            {selected.videoUrl && <a href={selected.videoUrl} target="_blank" rel="noreferrer" className="block"><Button variant="outline">Watch Video</Button></a>}
            {selected.pdfUrl && <a href={selected.pdfUrl} target="_blank" rel="noreferrer" className="block"><Button variant="outline">View PDF</Button></a>}
            {selected.imageUrl && <img src={selected.imageUrl} alt={selected.title} className="rounded-lg max-w-full" />}
          </div>
        )}
      </Modal>
    </div>
  );
}
