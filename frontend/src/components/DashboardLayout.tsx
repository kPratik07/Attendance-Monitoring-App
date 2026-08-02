import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

function getGreetingDetails() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return { label: 'Good morning', icon: '☀️' };
  }

  if (hour < 17) {
    return { label: 'Good afternoon', icon: '🌤️' };
  }

  if (hour < 21) {
    return { label: 'Good evening', icon: '🌇' };
  }

  return { label: 'Good night', icon: '🌙' };
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { displayName, user } = useAuth();
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateThemePreference = (event: MediaQueryListEvent | MediaQueryList) => {
      setSystemPrefersDark(event.matches);
    };

    updateThemePreference(mediaQuery);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateThemePreference);
      return () => mediaQuery.removeEventListener('change', updateThemePreference);
    }

    mediaQuery.addListener(updateThemePreference);
    return () => mediaQuery.removeListener(updateThemePreference);
  }, []);

  const greeting = useMemo(() => getGreetingDetails(), []);
  const currentDayName = useMemo(() => new Date().toLocaleDateString('en-US', { weekday: 'long' }), []);
  const fullName = (displayName || user?.name || user?.email || 'User').trim();
  const roleLabel = user?.role === 'admin' ? 'Admin' : 'Student';
  const isNightMode = new Date().getHours() >= 18 || new Date().getHours() < 6;
  const isDarkTheme = isNightMode && systemPrefersDark;
  const currentDay = new Date().getDay();
  const dayAccentClass = (() => {
    switch (currentDay) {
      case 0:
        return isDarkTheme ? 'text-rose-300' : 'text-rose-600';
      case 1:
        return isDarkTheme ? 'text-sky-300' : 'text-sky-600';
      case 2:
        return isDarkTheme ? 'text-violet-300' : 'text-violet-600';
      case 3:
        return isDarkTheme ? 'text-amber-300' : 'text-amber-600';
      case 4:
        return isDarkTheme ? 'text-emerald-300' : 'text-emerald-600';
      case 5:
        return isDarkTheme ? 'text-cyan-300' : 'text-cyan-600';
      default:
        return isDarkTheme ? 'text-fuchsia-300' : 'text-fuchsia-600';
    }
  })();

  const rootClass = isDarkTheme
    ? 'min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100'
    : 'min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 text-slate-900';

  const panelClass = isDarkTheme
    ? 'overflow-hidden rounded-[40px] border border-slate-700 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl'
    : 'overflow-hidden rounded-[40px] border border-slate-200/70 bg-white/80 p-6 shadow-2xl shadow-slate-300/30 backdrop-blur-xl';

  const bannerClass = isDarkTheme
    ? 'mb-6 rounded-[28px] border border-cyan-500/20 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 p-4 shadow-sm'
    : 'mb-6 rounded-[28px] border border-brand-100 bg-gradient-to-r from-brand-50 via-white to-emerald-50 p-4 shadow-sm';

  const accentTextClass = isDarkTheme ? 'text-cyan-300' : 'text-brand-700';
  const titleTextClass = isDarkTheme ? 'text-slate-50' : 'text-slate-900';
  const badgeClass = isDarkTheme ? 'rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200' : 'rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600';
  const nameTextClass = isDarkTheme ? 'text-slate-100' : 'text-slate-900';

  return (
    <div className={rootClass}>
      <main className="container-shell py-10">
        <div className={panelClass}>
          <section className={bannerClass}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-lg ${isDarkTheme ? 'bg-cyan-500/15 text-cyan-300' : 'bg-brand-100 text-brand-700'}`}>
                  {greeting.icon}
                </div>
                <div>
                  <div className={`text-xs font-semibold uppercase tracking-[0.24em] ${dayAccentClass}`}>{currentDayName}</div>
                  <div className={`text-xl font-bold ${nameTextClass}`}>
                    {greeting.label}, {fullName || roleLabel}!
                  </div>
                </div>
              </div>
              <div className={badgeClass}>
                {user?.role === 'admin' ? 'Admin control center' : 'Student attendance hub'}
              </div>
            </div>
          </section>
          {children}
        </div>
      </main>
    </div>
  );
}
