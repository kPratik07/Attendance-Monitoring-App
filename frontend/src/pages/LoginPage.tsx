import { FormEvent, useState } from 'react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setEmailError('Please enter your email address.');
      return;
    }
    setEmailError('');

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      const payload = await apiFetch<{ token: string; user: { id: string; email: string; role: 'student' | 'admin'; name: string; accountId?: string; department?: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      login(payload.user, payload.token);

      if (payload.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to login');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 p-4">
      <form onSubmit={handleSubmit} className="page-surface auth-card mx-auto w-full max-w-[420px] p-6">
        <div className="mb-6 space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-blue-500 text-white shadow-xl shadow-brand-500/20">
            <span className="text-xl font-black">A</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500">Sign in to continue to your attendance dashboard.</p>
        </div>
        <div className="space-y-4">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="form-input"
            placeholder="Email"
          />
          {emailError ? <div className="text-sm text-rose-600">{emailError}</div> : null}
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} className="form-input pr-12" placeholder="Password" />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute inset-y-0 right-3 flex items-center justify-center text-slate-400 transition hover:text-slate-600" aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {error ? <div className="rounded-3xl bg-rose-50 p-3 text-sm text-rose-600">{error}</div> : null}
          <button type="submit" className="btn-primary-animated w-full inline-flex items-center justify-center gap-2">
            Login
            <ArrowRight size={16} />
          </button>
          <div className="flex flex-col gap-2 text-[0.78rem] text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="whitespace-nowrap text-center sm:text-left">
              New here? <Link to="/signup" className="font-semibold text-brand-600">Sign up</Link>
            </div>
            <div className="whitespace-nowrap text-center sm:text-right">
              Need to reset your password? <Link to="/forgot-password" className="font-semibold text-brand-600">Forgot password</Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
