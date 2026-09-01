import { useState } from 'react';
import { Sparkles, Plus, Trash2, CheckCircle, Wand2 } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Loader from '@/components/common/Loader';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';
import Badge from '@/components/common/Badge';
import { useToast } from '@/components/common/Toast';
import { generateAIAssignment } from '@/services/assignmentService';
import { extractError } from '@/services/api';

const DIFFICULTY = ['Easy', 'Medium', 'Hard'];

export default function AIGenerator() {
  const toast = useToast();
  const [form, setForm] = useState({ topic: '', difficulty: 'Easy', numberOfQuestions: 5 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [formError, setFormError] = useState({});

  const validate = () => {
    const e = {};
    if (!form.topic.trim()) e.topic = 'Topic is required';
    if (!form.numberOfQuestions || form.numberOfQuestions < 1) e.numberOfQuestions = 'At least 1 question';
    if (form.numberOfQuestions > 20) e.numberOfQuestions = 'Max 20 questions';
    setFormError(e);
    return Object.keys(e).length === 0;
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    setQuestions([]);
    try {
      const { data } = await generateAIAssignment({
        topic: form.topic.trim(),
        difficulty: form.difficulty,
        numberOfQuestions: Number(form.numberOfQuestions),
      });
      const qs = data.questions || data.generatedQuestions || data.data?.questions || [];
      setQuestions(qs);
      if (qs.length === 0) setError('No questions were generated. Try a different topic.');
      else toast.success(`${qs.length} questions generated`);
    } catch (err) {
      setError(extractError(err, 'Failed to generate questions. Make sure the AI service is running.'));
    } finally {
      setLoading(false);
    }
  };

  const difficultyColor = { Easy: 'emerald', Medium: 'amber', Hard: 'rose' };

  return (
    <div>
      <PageHeader title="AI Question Generator" description="Generate assignment questions with AI, then review before using them" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                <Wand2 className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Generator</h3>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4">
              <Input label="Topic" name="topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} error={formError.topic} placeholder="e.g. Photosynthesis" required />
              <Select label="Difficulty" name="difficulty" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} options={DIFFICULTY.map((d) => ({ value: d, label: d }))} />
              <Input label="Number of questions" name="numberOfQuestions" type="number" min={1} max={20} value={form.numberOfQuestions} onChange={(e) => setForm({ ...form, numberOfQuestions: e.target.value })} error={formError.numberOfQuestions} required />
              <Button type="submit" fullWidth loading={loading} disabled={loading}><Sparkles className="h-4 w-4" /> Generate Questions</Button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          {error && <ErrorMessage message={error} className="mb-4" />}
          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10">
              <Loader size="lg" label="Generating questions with AI..." />
            </div>
          ) : questions.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No questions generated yet"
              description="Enter a topic and click Generate to create AI-powered questions for your assignments."
            />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">{questions.length} questions generated</p>
                <Button variant="ghost" size="sm" onClick={() => setQuestions([])}>Clear</Button>
              </div>
              {questions.map((q, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-slate-900"><span className="text-slate-400">Q{idx + 1}.</span> {q.questionText || q.question}</p>
                    <Badge color={difficultyColor[q.difficulty] || 'slate'}>{q.difficulty || '—'}</Badge>
                  </div>
                  <ul className="space-y-1.5">
                    {(q.options || []).map((opt, oIdx) => {
                      const correct = (q.correctAnswer || q.correct_answer) === opt;
                      return (
                        <li key={oIdx} className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm ${correct ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-600'}`}>
                          {correct ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <span className="h-4 w-4 rounded-full border border-slate-300" />}
                          {opt}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
