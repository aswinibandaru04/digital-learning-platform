import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { extractError } from '@/services/api';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import ErrorMessage from '@/components/common/ErrorMessage';
import SuccessMessage from '@/components/common/SuccessMessage';
import AuthBranding from '@/components/auth/AuthBranding';

const ROLES = [
  { value: 'Teacher', label: 'Teacher' },
  { value: 'Student', label: 'Student' },
  { value: 'Parent', label: 'Parent' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    else if (form.name.trim().length < 2) e.name = 'Name is too short';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!form.role) e.role = 'Please select a role';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: undefined });
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccess('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password, form.role);
      setSuccess('Account created successfully. Redirecting to login...');
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (err) {
      setServerError(extractError(err, 'Registration failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="hidden lg:block lg:w-1/2">
        <AuthBranding />
      </div>
      <div className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2 lg:px-20">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Join LearnHub and start your learning journey
            </p>
          </div>

          <ErrorMessage message={serverError} onDismiss={() => setServerError('')} className="mb-5" />
          <SuccessMessage message={success} className="mb-5" />

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Full name"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Jane Doe"
              icon={UserIcon}
              required
              autoComplete="name"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="you@example.com"
              icon={Mail}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="At least 6 characters"
              icon={Lock}
              hint="Minimum 6 characters"
              required
              autoComplete="new-password"
            />
            <Select
              label="Role"
              name="role"
              value={form.role}
              onChange={handleChange}
              error={errors.role}
              options={ROLES}
              placeholder="Select your role"
              required
            />

            <Button type="submit" fullWidth size="lg" loading={submitting} disabled={submitting} className="mt-2">
              {submitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
