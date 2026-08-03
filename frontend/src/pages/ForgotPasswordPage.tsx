import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';

const getFriendlyForgotPasswordMessage = (message: string) => {
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid email')) {
    return 'Please enter a valid registered email address.';
  }

  if (normalized.includes('otp is invalid') || normalized.includes('expired')) {
    return 'The OTP is invalid or has expired. Please request a new one.';
  }

  return 'Unable to process your request right now. Please try again.';
};

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'request' | 'reset'>('request');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleRequestReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setStatus('');

    const raw = email.trim();
    if (!raw) {
      setEmailError('Please enter your email address.');
      return;
    }

    const emailValue = raw.toLowerCase();
    const tldRegex = /\.[a-z]{2,24}$/i;
    if (!tldRegex.test(emailValue)) {
      setEmailError('Please enter your email address.');
      return;
    }

    // If frontend has configured allowed domains, enforce them too
    const allowed = (import.meta.env.VITE_ALLOWED_EMAIL_DOMAINS ?? '')
      .split(',')
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean);
    if (allowed.length > 0) {
      const domain = emailValue.split('@')[1] ?? '';
      if (!allowed.includes(domain)) {
        setEmailError('Please enter your email address.');
        return;
      }
    }

    if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter your email address.');
      return;
    }
    setEmailError('');

    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: emailValue }),
      });

      setStatus('If the account exists, an OTP has been sent to your registered email.');
      setStep('reset');
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Unable to request password reset';
      setError(getFriendlyForgotPasswordMessage(message));
    }
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setStatus('');

    if (!otp.trim()) {
      setError('Please enter the OTP sent to your email.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('New password and confirm password must match.');
      return;
    }

    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim(), password }),
      });

      setStatus('Password reset successful. You can now sign in with the new password.');
      setStep('request');
      setOtp('');
      setPassword('');
      setConfirmPassword('');
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Unable to reset password';
      setError(getFriendlyForgotPasswordMessage(message));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 p-4">
      <div className="w-full max-w-[420px]">
        <form onSubmit={step === 'request' ? handleRequestReset : handleResetPassword} className="page-surface auth-card mx-auto w-full p-6 bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-2xl shadow-slate-300/20">
          <div className="mb-6 space-y-3 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">
              {step === 'request' ? 'Request reset' : 'Reset password'}
            </div>
            <h1 className="text-3xl font-bold text-slate-900">{step === 'request' ? 'Forgot password' : 'Reset password'}</h1>
            <p className="text-sm text-slate-500">
              {step === 'request'
                ? 'Enter your registered email and we’ll send an OTP for secure reset.'
                : 'Use the OTP sent to your email, then set and confirm your new password.'}
            </p>
          </div>

          <div className="space-y-4">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              placeholder="Registered email"
              disabled={step === 'reset'}
            />
            {step === 'request' && emailError ? <div className="text-sm text-rose-600">{emailError}</div> : null}

            {step === 'reset' ? (
              <>
                <input
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="OTP code"
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    placeholder="New password"
                  />
                  <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute inset-y-0 right-3 flex items-center justify-center text-slate-400 transition hover:text-slate-600" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    placeholder="Confirm password"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} className="absolute inset-y-0 right-3 flex items-center justify-center text-slate-400 transition hover:text-slate-600" aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </>
            ) : null}

            <div className="rounded-2xl border border-sky-100 bg-sky-50/70 px-3 py-2 text-left text-xs text-sky-700">
              <div className="font-semibold">Secure recovery</div>
              <div className="mt-1 text-sky-700/80">Verify your new password before you submit and keep your account protected.</div>
            </div>

            <button type="submit" className="btn-primary-animated w-full inline-flex items-center justify-center gap-2">
              {step === 'request' ? 'Request OTP' : 'Update password'}
              <ArrowRight size={16} />
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm text-slate-500">
          {error ? <div className="rounded-3xl bg-rose-50 p-4 text-sm text-rose-600">{error}</div> : null}
          {status ? <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700">{status}</div> : null}
          <div className="mt-4">
            <Link to="/login" className="font-semibold text-brand-600">Back to login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
