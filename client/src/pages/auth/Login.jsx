import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { extractError } from '@/services/api';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import ErrorMessage from '@/components/common/ErrorMessage';
import AuthBranding from '@/components/auth/AuthBranding';

const roleHome = {
  Teacher: '/teacher/dashboard',
  Student: '/student/dashboard',
  Parent: '/parent/dashboard',
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
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
    if (!validate()) return;
    setSubmitting(true);
    try {
      const user = await login(form.email.trim(), form.password);
      navigate(roleHome[user.role] || '/login', { replace: true });
    } catch (err) {
      setServerError(extractError(err, 'Invalid email or password'));
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
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Sign in to access your learning dashboard
            </p>
          </div>

          <ErrorMessage message={serverError} onDismiss={() => setServerError('')} className="mb-5" />

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
              placeholder="Enter your password"
              icon={Lock}
              required
              autoComplete="current-password"
            />

            <Button type="submit" fullWidth size="lg" loading={submitting} disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
