import { useEffect, useMemo, useState } from 'react';
import { BellRing, Building2, MapPin, School, ShieldCheck, UserCircle2 } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../hooks/useAuth';

type Notification = {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
};

type StudentProfile = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
};

type AttendanceHistoryRecord = {
  id: string;
  date: string;
  status: string;
  checkInTime?: string;
};

const getFriendlyAttendanceError = (message: string) => {
  const normalized = message.toLowerCase();

  if (normalized.includes('not within the allowed city list') || normalized.includes('outside the allowed city range')) {
    return 'You are outside the allowed city range. Please move into the listed city area and try again.';
  }

  if (normalized.includes('attendance has already been marked') || normalized.includes('duplicate attendance attempt')) {
    return 'Your attendance has already been marked for today.';
  }

  if (normalized.includes('latitude and longitude are required') || normalized.includes('location access is required')) {
    return 'Location access is required to mark attendance. Please enable location permission and try again.';
  }

  if (normalized.includes('failed to fetch') || normalized.includes('networkerror')) {
    return 'Unable to reach the attendance service right now. Please check your connection and try again.';
  }

  if (normalized.includes('unexpected end of json input')) {
    return 'The attendance request could not be completed. Please allow location access and try again from a listed city.';
  }

  return 'Unable to complete attendance check. Please try again.';
};

export function StudentDashboard() {
  const { user, displayName } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [history, setHistory] = useState<AttendanceHistoryRecord[]>([]);
  const [attendanceStatus, setAttendanceStatus] = useState('No attendance action yet.');
  const [attendanceError, setAttendanceError] = useState('');
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [lastDistance, setLastDistance] = useState<number | null>(null);

  const refreshDashboardData = async () => {
    try {
      const [profileData, apiNotifications, historyData] = await Promise.all([
        apiFetch<StudentProfile>('/student/profile'),
        apiFetch<Notification[]>('/notifications'),
        apiFetch<AttendanceHistoryRecord[]>('/student/history'),
      ]);

      setProfile(profileData);
      setNotifications(apiNotifications);
      setHistory(historyData);
    } catch {
      setProfile(null);
      setNotifications([]);
      setHistory([]);
    }
  };

  useEffect(() => {
    void refreshDashboardData();

    const stored = localStorage.getItem('attendance_notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    const refreshNotifications = () => {
      const stored = localStorage.getItem('attendance_notifications');
      setNotifications(stored ? JSON.parse(stored) : []);
    };

    window.addEventListener('attendanceNotificationsUpdated', refreshNotifications);
    window.addEventListener('storage', refreshNotifications);
    return () => {
      window.removeEventListener('attendanceNotificationsUpdated', refreshNotifications);
      window.removeEventListener('storage', refreshNotifications);
    };
  }, []);

  const recentNotifications = useMemo(() => notifications.slice(0, 2), [notifications]);
  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.read).length, [notifications]);

  const markNotificationRead = async (notificationId: string) => {
    try {
      await apiFetch(`/notifications/${notificationId}/read`, { method: 'PATCH' });
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification,
        ),
      );
    } catch {
      // Ignore read update failures in the UI
    }
  };

  useEffect(() => {
    const unreadNotifications = notifications.filter((notification) => !notification.read);
    localStorage.setItem('attendance_notifications', JSON.stringify(unreadNotifications));
    window.dispatchEvent(new CustomEvent('attendanceNotificationsUpdated'));
  }, [notifications]);

  const formatHistoryDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(`${dateString}T00:00:00`));
    } catch {
      return dateString;
    }
  };

  const formatHistoryStatus = (status: string) => status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

  const filteredHistory = useMemo(() => {
    const now = new Date();
    return history.filter((r) => {
      try {
        const d = new Date(`${r.date}T00:00:00`);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      } catch {
        return false;
      }
    });
  }, [history]);

  const markAttendance = async () => {
    setAttendanceError('');
    setAttendanceLoading(true);
    const now = new Date();
    const currentHour = now.getHours();
    const dayOfWeek = now.getDay();
    const isAttendanceWindow = currentHour >= 9 && currentHour < 12;
    const isWorkingDay = dayOfWeek >= 1 && dayOfWeek <= 6;
    const holidayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const isNationalHoliday = ['2026-01-26', '2026-08-15', '2026-10-02'].includes(holidayKey);
    const lateWarning = 'Late attendance warning: attendance is only on-time between 9 AM and 12 PM.';

    if (!isWorkingDay || isNationalHoliday) {
      setAttendanceError('Attendance can be marked only from Monday to Saturday, excluding national holidays.');
      setAttendanceStatus('Attendance unavailable for today.');
      setAttendanceLoading(false);
      return;
    }

    if (!isAttendanceWindow) {
      setAttendanceError(lateWarning);
      setAttendanceStatus('Attendance will be marked late.');
    } else {
      setAttendanceStatus('Checking location...');
    }

    const sendAttendance = async (latitude: number, longitude: number) => {
      try {
        const response = await apiFetch<{ attendance: unknown; distanceMeters: number; status: string }>('/student/mark-attendance', {
          method: 'POST',
          body: JSON.stringify({ latitude, longitude }),
        });

        setLastDistance(response.distanceMeters);
        if (response.status === 'marked') {
          setAttendanceStatus('Attendance marked successfully.');
        } else {
          setAttendanceStatus(response.status);
        }

        setNotifications((current) => [
          {
            id: Date.now().toString(),
            message: response.status === 'marked' ? 'Attendance marked successfully.' : 'Attendance attempt completed.',
            createdAt: new Date().toISOString(),
            read: false,
          },
          ...current,
        ]);
        await refreshDashboardData();
      } catch (caughtError) {
        const message = caughtError instanceof Error ? caughtError.message : 'Unable to mark attendance.';
        setAttendanceError(getFriendlyAttendanceError(message));
        setAttendanceStatus('Unable to complete attendance check.');
      } finally {
        setAttendanceLoading(false);
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => sendAttendance(position.coords.latitude, position.coords.longitude),
        () => {
          setAttendanceError('Location access is required to mark attendance. Please enable location permission and try again.');
          setAttendanceStatus('Unable to complete attendance check.');
          setAttendanceLoading(false);
        },
        { timeout: 10000, enableHighAccuracy: true },
      );
    } else {
      setAttendanceError('Geolocation is not supported in this browser. Please use a browser that allows location access.');
      setAttendanceStatus('Unable to complete attendance check.');
      setAttendanceLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="grid gap-4 xl:grid-cols-3">
          <div className="card-surface relative h-full overflow-hidden border-violet-200 bg-gradient-to-br from-violet-50 via-white to-slate-50 p-6 shadow-sm">
            <div className="absolute inset-y-0 right-0 hidden sm:flex items-center justify-center pr-4 text-violet-200/70">
              <Building2 size={84} className="animate-pulse" />
            </div>
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="text-sm font-semibold text-violet-700 flex items-center gap-2">
                  <UserCircle2 size={16} className="text-violet-700" />
                  <span>Profile</span>
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900">{profile?.name ?? user?.name ?? displayName}</div>
                <div className="mt-2 text-xs text-slate-700">
                  <span className="font-semibold">{user?.role === 'admin' ? 'Admin ID:' : 'Student ID:'}</span>
                  <span className="ml-2 font-semibold text-slate-900">{user?.studentId ?? user?.accountId ?? profile?.id ?? user?.id}</span>
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-700">{profile?.email ?? user?.email}</div>
              </div>
            </div>
          </div>
          <div className="card-surface relative h-full overflow-hidden border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-6 shadow-sm">
            <div className="absolute inset-y-0 right-0 hidden sm:flex items-center justify-center pr-4 text-emerald-200/70">
              <School size={76} className="animate-[spin_12s_linear_infinite]" />
            </div>
            <div className="relative flex h-full flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <MapPin size={12} />
                    </span>
                    <span>Department info</span>
                  </div>
                  <div className="mt-3 text-xl font-bold text-slate-900">{user?.department ?? 'Department pending'}</div>
                  <div className="mt-2 text-sm text-emerald-600">This shows the department you're assigned to.</div>
                  {/* removed duplicate "View department" button to keep single department label */}
                  <p className="mt-2 text-sm italic text-emerald-600">“Stay focused, stay consistent, and let your department lead the way.”</p>
                </div>
              </div>
          </div>
          <div className="card-surface relative overflow-hidden border-sky-200 bg-gradient-to-br from-sky-50 via-white to-slate-50 p-6 shadow-sm">
            <div className="absolute right-4 top-4 hidden sm:flex items-center gap-2 text-sky-200/70">
              <ShieldCheck size={40} className="animate-bounce" />
            </div>
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                  <Building2 size={14} /> {user?.department ?? 'Department pending'}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">Stay connected with your academic department</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Use this section to quickly confirm your academic unit and stay aligned with the right department updates.</p>
                
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <section className="card-surface p-6 border-indigo-200 bg-gradient-to-br from-indigo-50 via-slate-50 to-white">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-lg font-semibold text-slate-900">Your Attendance status</div>
                  <div className="text-sm text-slate-500">Mark attendance from one of your approved listed cities.</div>
                </div>
                <button
                  type="button"
                  onClick={markAttendance}
                  disabled={attendanceLoading}
                  className="btn-primary inline-flex w-full sm:w-auto items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {attendanceLoading ? 'Checking...' : 'Check in'}
                </button>
              </div>

              <div className="mt-4 space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <p className="text-sm text-slate-700">{attendanceStatus}</p>
                {lastDistance !== null ? <p className="text-sm text-slate-500">Distance from city center: {lastDistance} meters</p> : null}
                {attendanceError ? <p className="text-sm text-rose-600">{attendanceError}</p> : null}
              </div>
            </section>

            <section className="card-surface p-6 overflow-hidden h-64 flex flex-col min-h-0">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-slate-900">Your Attendance history</div>
                  <div className="text-sm text-slate-500">Your attendance record for the last 30 days.</div>
                  <p className="mt-2 text-sm italic text-slate-600">“Consistency turns effort into excellence.”</p>
                </div>
              </div>

              {filteredHistory.length ? (
                <div className="space-y-3 flex-1 overflow-y-auto pr-2 min-h-0">
                  {filteredHistory.map((record) => (
                    <div key={record.id} className="rounded-3xl border border-slate-200 bg-white px-3 py-3 sm:px-4 sm:py-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-6 min-w-0">
                          <div className="font-semibold text-sm sm:text-base text-slate-900 break-words">{formatHistoryDate(record.date)}</div>
                          <div className="text-xs sm:text-sm text-slate-500 break-words">{formatHistoryStatus(record.status)}</div>
                        </div>
                        <div className="text-xs sm:text-sm text-slate-500 sm:text-right">{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : 'No clock-in'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl bg-slate-50 p-6 text-sm text-slate-500">No attendance history for the current month. Mark attendance to add your first record.</div>
              )}
            </section>
          </div>

          <div className="flex flex-col gap-6 justify-between">
            <div className="card-surface p-6">
              <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-lg font-semibold text-slate-900">Notifications</div>
                  <div className="text-sm text-slate-500">Latest alerts from the system.</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-600">{unreadCount} unread</div>
                  <button type="button" onClick={() => setShowAllNotifications((open) => !open)} className="btn-secondary rounded-xl px-4 py-2 text-xs font-semibold tracking-wide">
                    {showAllNotifications ? 'Hide all' : 'View all'}
                  </button>
                </div>
              </div>

              {recentNotifications.length ? (
                <div className="space-y-3">
                  {recentNotifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => void markNotificationRead(notification.id)}
                      className={`w-full rounded-2xl border px-4 py-4 text-left transition ${notification.read ? 'border-slate-200 bg-slate-100' : 'border-brand-200 bg-white shadow-sm hover:border-brand-400 hover:bg-slate-50'}`}
                    >
                      <div className="text-sm text-slate-700">{notification.message}</div>
                      <div className="mt-2 text-xs text-slate-500">{new Date(notification.createdAt).toLocaleString()}</div>
                      {!notification.read ? (
                        <div className="mt-3 inline-flex rounded-full bg-brand-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">Mark read</div>
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No notifications at the moment.</div>
              )}
              {showAllNotifications ? (
                <div className="mt-4 space-y-3 rounded-3xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-semibold text-slate-900">All notifications</div>
                  {notifications.length ? (
                    notifications.map((notification) => (
                      <div key={notification.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-sm text-slate-700">{notification.message}</div>
                        <div className="mt-2 text-xs text-slate-500">{new Date(notification.createdAt).toLocaleString()}</div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl bg-white p-4 text-sm text-slate-500">No notifications available.</div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="card-surface p-6 border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-slate-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                    <MapPin size={14} /> City check-in
                  </div>
                  <div className="mt-4 text-lg font-semibold text-slate-900">Attendance ready</div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">Your attendance is validated using your listed city access. Check in from an approved city to complete the process.</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-600 text-white shadow-lg shadow-cyan-500/20">
                  <MapPin size={24} />
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="rounded-xl bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm">City access active</div>
                <button type="button" className="btn-secondary rounded-xl px-4 py-2 text-xs font-semibold tracking-wide">Refresh status</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
