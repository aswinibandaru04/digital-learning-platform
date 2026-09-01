import { useState } from 'react';
import { Link as LinkIcon, Mail, CheckCircle } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import ErrorMessage from '@/components/common/ErrorMessage';
import SuccessMessage from '@/components/common/SuccessMessage';
import Loader from '@/components/common/Loader';
import { linkStudent } from '@/services/authService';
import { extractError } from '@/services/api';

export default function LinkStudent() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [linked, setLinked] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email.trim()) { setError('Student email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email'); return; }
    setSubmitting(true);
    try {
      const { data } = await linkStudent(email.trim());
      setLinked(data.student || data.user || { email: email.trim() });
      setSuccess(data.message || 'Student linked successfully.');
    } catch (err) {
      setError(extractError(err, 'Failed to link student.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Link Student" description="Connect to your child's student account by email" />

      <div className="mx-auto max-w-lg">
        {error && <ErrorMessage message={error} className="mb-5" />}
        {success && <SuccessMessage message={success} className="mb-5" />}

        {linked ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-7 w-7 text-emerald-600" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">Student Linked</h3>
            <p className="mt-1 text-sm text-slate-600">{linked.name || 'Student'}</p>
            <p className="text-xs text-slate-500">{linked.email}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50"><LinkIcon className="h-5 w-5 text-indigo-600" /></div>
              <h3 className="text-sm font-semibold text-slate-800">Link by Email</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Student email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error && !success ? null : undefined}
                placeholder="student@example.com"
                icon={Mail}
                hint="Enter the email your child used to register as a Student"
                required
              />
              <Button type="submit" fullWidth loading={submitting} disabled={submitting}>
                {submitting ? 'Linking...' : 'Link Student'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
