import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

export function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'student' | 'admin' | ''>('');
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    apiFetch<string[]>('/lookup/departments')
      .then((items) => {
        setDepartments(items);
        if (items.length) {
          setDepartment('');
        }
      })
      .catch(() => {
        setDepartments(['Computer Science']);
        setDepartment('');
      });
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setStatus('');

    if (!role || !department) {
      setError('Please select a department and role to continue.');
      return;
    }

    try {
      const payload = await apiFetch<{ token: string; user: { id: string; name: string; email: string; role: 'student' | 'admin'; accountId: string; department: string } }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role, department }),
      });

      login(payload.user, payload.token);

      if (payload.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to create account');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 p-4">
      <form onSubmit={handleSubmit} className="page-surface auth-card mx-auto w-full max-w-[420px] p-4">
        <div className="mb-4 space-y-1.5 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-brand-500 text-white shadow-xl shadow-brand-500/20">
            <span className="text-base font-black">A</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Create your account</h1>
          <p className="text-xs text-slate-500">Join the attendance workspace using a secure institution email.</p>
        </div>

        <div className="space-y-2.5">
          <input value={name} onChange={(event) => setName(event.target.value)} className="form-input" placeholder="Full name" />
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="form-input" placeholder="Email" />
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} className="form-input pr-12" placeholder="Password" />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute inset-y-0 right-3 flex items-center justify-center text-slate-400 transition hover:text-slate-600" aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <label className="sr-only" htmlFor="department">Department</label>
          <div className="dropdown-shell">
            <button
              type="button"
              id="department"
              className={`form-select-button ${department ? 'selected' : ''}`}
              onClick={() => {
                setIsDepartmentOpen((open) => !open);
                setIsRoleOpen(false);
              }}
            >
              <span className={department ? 'text-slate-900' : 'text-slate-400'}>{department || 'Choose department'}</span>
              <span className="dropdown-caret">▾</span>
            </button>

            {isDepartmentOpen ? (
              <div className="dropdown-panel">
                <div className="dropdown-scroll">
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      className={`dropdown-option ${department === dept ? 'selected' : ''}`}
                      onClick={() => {
                        setDepartment(dept);
                        setIsDepartmentOpen(false);
                      }}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="dropdown-shell mt-4">
            <button
              type="button"
              className={`form-select-button ${role ? 'selected' : ''}`}
              onClick={() => {
                setIsRoleOpen((open) => !open);
                setIsDepartmentOpen(false);
              }}
            >
              <span className={role ? 'text-slate-900' : 'text-slate-400'}>{role ? role[0].toUpperCase() + role.slice(1) : 'Choose role'}</span>
              <span className="dropdown-caret">▾</span>
            </button>

            {isRoleOpen ? (
              <div className="dropdown-panel">
                <div className="dropdown-scroll">
                  {(['student', 'admin'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`dropdown-option ${role === option ? 'selected' : ''}`}
                      onClick={() => {
                        setRole(option);
                        setIsRoleOpen(false);
                      }}
                    >
                      {option[0].toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {error ? <div className="rounded-3xl bg-rose-50 p-3 text-sm text-rose-600">{error}</div> : null}
          {status ? <div className="rounded-3xl bg-emerald-50 p-3 text-sm text-emerald-700">{status}</div> : null}

          <button type="submit" className="btn-primary-animated w-full inline-flex items-center justify-center gap-2">
            Sign up
            <ArrowRight size={16} />
          </button>

          <div className="text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="font-semibold text-brand-600">Login</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
