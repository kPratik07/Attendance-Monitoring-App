import { Bell, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Features', to: '/#features' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export function SiteHeader() {
  const { user, logout, displayName } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [toastMessage, setToastMessage] = useState('No new notifications.');
  const [toastOpen, setToastOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = displayName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'AM';
  const firstName = displayName.split(' ')[0] || displayName;
  const roleLabel = user?.role === 'admin' ? 'Admin' : 'Student';
  const showNavLinks = !user;

  const updateNotifications = () => {
    const stored = localStorage.getItem('attendance_notifications');
    const parsed: { id: string; message: string; createdAt: string; read: boolean }[] = stored ? JSON.parse(stored) : [];
    setNotificationCount(parsed.length);
    if (parsed.length) {
      setToastMessage(parsed[0].message);
    }
  };

  useEffect(() => {
    updateNotifications();
    const handleStorage = () => updateNotifications();
    const handleCustom = () => updateNotifications();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('attendanceNotificationsUpdated', handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('attendanceNotificationsUpdated', handleCustom);
    };
  }, []);

  const handleToast = () => {
    const stored = localStorage.getItem('attendance_notifications');
    const parsed: { id: string; message: string; createdAt: string; read: boolean }[] = stored ? JSON.parse(stored) : [];

    if (parsed.length) {
      const [next, ...remaining] = parsed;
      setToastMessage(next.message);
      setNotificationCount(remaining.length);
      localStorage.setItem('attendance_notifications', JSON.stringify(remaining));
      window.dispatchEvent(new CustomEvent('attendanceNotificationsUpdated'));
    } else {
      setToastMessage('No new notifications.');
    }

    setMenuOpen(false);
    setToastOpen(true);
    window.setTimeout(() => setToastOpen(false), 3600);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setMenuOpen((current) => !current);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  useEffect(() => {
    closeMenu();
  }, [location.pathname, location.hash]);

  return (
    <nav className="relative sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-lg shadow-slate-200/20 backdrop-blur-md">
      <div className="container-shell flex flex-wrap items-center justify-between gap-3 py-4">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2 shadow-lg shadow-slate-200/10 transition hover:bg-white"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-blue-500 to-cyan-500 shadow-xl shadow-brand-500/20 ring-1 ring-white/70 animate-[pulse_4s_ease-in-out_infinite]">
            <span className="text-base font-black text-white">A</span>
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-900">Attendance Monitor</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Campus attendance</span>
          </div>
        </Link>

        {showNavLinks ? (
          <div className="hidden items-center gap-5 md:flex">
            {navLinks.map((navLink) => (
              <Link
                key={navLink.label}
                to={navLink.to}
                className={`text-sm font-medium transition ${location.pathname === '/' && location.hash === navLink.to.replace('/#', '#') ? 'text-brand-600' : 'text-slate-600 hover:text-brand-600'}`}
              >
                {navLink.label}
              </Link>
            ))}
          </div>
        ) : null}

        <div className="flex items-center gap-3 md:gap-4">
          {user ? (
            <>
              <div className="hidden items-center gap-3 md:flex">
                <button onClick={handleToast} className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200" type="button" aria-label="Notifications" style={{transform: 'translateX(-6px)'}}>
                  <Bell size={18} />
                  {notificationCount > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">{notificationCount}</span>
                  ) : null}
                </button>
                <div className="flex min-w-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-slate-700 shadow-sm">
                  <span className="flex h-10 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 via-blue-600 to-cyan-500 text-base font-bold uppercase text-white shadow-md shadow-brand-200">{initials}</span>
                  <span className="hidden min-w-0 flex-col text-left sm:inline-flex">
                    <span className="truncate font-semibold">{firstName}</span>
                    <span className="truncate text-xs text-slate-500">{roleLabel}</span>
                  </span>
                </div>
                <button onClick={handleLogout} className="rounded-xl bg-gradient-to-r from-rose-400 via-red-500 to-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-rose-100 transition hover:from-rose-500 hover:via-red-600 hover:to-rose-600" type="button">
                  Logout
                </button>
              </div>

              <button onClick={toggleMenu} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden" type="button" aria-expanded={menuOpen} aria-label="Open menu">
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>

              {toastOpen ? (
                <div className="pointer-events-none absolute right-4 top-20 z-50 w-72 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-xl shadow-slate-300/30">
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Notification</div>
                  <div className="mt-2 font-medium text-slate-900">{toastMessage}</div>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <Link className="btn-secondary hidden md:inline-flex" to="/signup">
                Sign up
              </Link>
              <Link className="btn-primary hidden md:inline-flex" to="/login">
                Login
              </Link>
              <button onClick={toggleMenu} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden" type="button" aria-expanded={menuOpen} aria-label="Open menu">
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </>
          )}
        </div>
      </div>

      {menuOpen ? (
        <>
          <div onClick={closeMenu} className="fixed inset-0 z-30 bg-slate-900/10 md:hidden" />
          <div className="absolute left-1/2 top-full z-40 mt-2 w-[min(100vw-2rem,320px)] -translate-x-1/2 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/30 md:hidden">
            <div className="space-y-2 max-h-[calc(100vh-8rem)] overflow-y-auto">
              {user ? (
                <>
                  <button onClick={handleToast} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100" type="button">
                    <span>Notifications</span>
                    {notificationCount > 0 ? <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-brand-600 px-2 text-[10px] font-bold text-white">{notificationCount}</span> : null}
                  </button>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <div className="font-semibold text-slate-900 truncate">{displayName}</div>
                    <div className="text-xs text-slate-500">{roleLabel}</div>
                  </div>
                  <button onClick={handleLogout} className="w-full rounded-2xl bg-gradient-to-r from-rose-400 via-red-500 to-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-rose-500 hover:via-red-600 hover:to-rose-600" type="button">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {navLinks.map((navLink) => (
                    <Link
                      key={navLink.label}
                      to={navLink.to}
                      onClick={closeMenu}
                      className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      {navLink.label}
                    </Link>
                  ))}
                  <Link onClick={closeMenu} className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50" to="/signup">
                    Sign up
                  </Link>
                  <Link onClick={closeMenu} className="block rounded-2xl bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-700" to="/login">
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      ) : null}
    </nav>
  );
}
