import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BellRing, Building2, ClipboardList, MapPinned, ShieldCheck, Users } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../hooks/useAuth';

type StudentRow = {
  id: string;
  name: string;
  email: string;
  studentId?: string;
  accountId?: string;
  department?: string;
  profile?: {
    department?: string;
    year?: string;
    phone?: string;
  };
};

type Notification = {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
};

type AttendanceRecord = {
  id: string;
  date: string;
  status: 'present' | 'late' | 'absent' | 'out_of_range' | 'duplicate_attempt';
  checkInTime?: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
};

type AdminStats = {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  outOfRangeAttempts: number;
};

export function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>({ totalStudents: 0, presentToday: 0, absentToday: 0, outOfRangeAttempts: 0 });
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const searchButtonRef = useRef<HTMLButtonElement | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const popupRef = useRef<HTMLDivElement | null>(null);
  const popupShowTimerRef = useRef<number | null>(null);
  const popupHideTimerRef = useRef<number | null>(null);
  const popupUnmountTimerRef = useRef<number | null>(null);
  const [popupAnimated, setPopupAnimated] = useState(false);

  useEffect(() => {
    apiFetch<AdminStats>('/admin/dashboard')
      .then(setStats)
      .catch(() => setError('Unable to load dashboard stats.'));

    apiFetch<StudentRow[]>('/admin/students')
      .then(setStudents)
      .catch(() => setStudents([]));

    apiFetch<Notification[]>('/notifications')
      .then(setNotifications)
      .catch(() => {});

    apiFetch<AttendanceRecord[]>('/admin/attendance')
      .then(setAttendanceRecords)
      .catch(() => {});
  }, []);

  const recentNotifications = useMemo(() => notifications.slice(0, 3), [notifications]);
  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.read).length, [notifications]);
  const selectedStudentLatestAttendance = useMemo(() => {
    if (!selectedStudent) return null;
    const matching = attendanceRecords
      .filter((record) => record.student._id === selectedStudent.id)
      .sort((a, b) => (a.date === b.date ? 0 : a.date > b.date ? -1 : 1));
    return matching[0] ?? null;
  }, [attendanceRecords, selectedStudent]);

  const handleNotificationClick = async (notificationId: string) => {
    try {
      await apiFetch(`/notifications/${notificationId}/read`, { method: 'PATCH' });
      setNotifications((current) => current.map((item) => (item.id === notificationId ? { ...item, read: true } : item)));
    } catch {
      // Ignore read state update failure for now
    }
  };

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) => {
      return [student.name, student.email, student.studentId, student.accountId]
        .some((value) => value?.toLowerCase().includes(query));
    });
  }, [students, searchQuery]);

  useEffect(() => {
    if (searchInput.trim() === '') {
      setSearchQuery('');
    }

    if (error && searchInput.trim().length > 0) {
      setError('');
    }
  }, [searchInput, error]);

  const handleSearch = () => {
    if (!searchInput.trim()) {
      // show a small anchored popup above the Find Students button
      const btn = searchButtonRef.current;
      if (btn) {
        const rect = btn.getBoundingClientRect();
        // set initial approximate position; we'll measure and adjust after render
        setPopupPos({ top: rect.top - 8, left: rect.left + rect.width * 0.6 });
      }
      // clear any existing timers
      if (popupShowTimerRef.current) {
        window.clearTimeout(popupShowTimerRef.current);
        popupShowTimerRef.current = null;
      }
      if (popupHideTimerRef.current) {
        window.clearTimeout(popupHideTimerRef.current);
        popupHideTimerRef.current = null;
      }

      // show after 1500ms, then hide 2000ms after showing
      popupShowTimerRef.current = window.setTimeout(() => {
        setShowPopup(true);
        // trigger entrance animation on next frame
        setPopupAnimated(false);
        requestAnimationFrame(() => setPopupAnimated(true));

        // start hide timer (visible duration = 2000ms)
        popupHideTimerRef.current = window.setTimeout(() => {
          // start exit animation
          setPopupAnimated(false);
          // after animation completes, unmount popup
          popupUnmountTimerRef.current = window.setTimeout(() => {
            setShowPopup(false);
            popupUnmountTimerRef.current = null;
          }, 300); // match transition duration

          popupHideTimerRef.current = null;
        }, 1500);

        popupShowTimerRef.current = null;
      }, 1000);
      return;
    }

    // clear any other error state and proceed with the search
    setError('');
    setSearchQuery(searchInput.trim());
  };

  // measure popup after it renders and position it exactly above the button
  useEffect(() => {
    if (!showPopup) return;
    const btn = searchButtonRef.current;
    const popup = popupRef.current;
    if (!btn || !popup) return;
    const rect = btn.getBoundingClientRect();
    const popupH = popup.offsetHeight;
    const popupW = popup.offsetWidth;
    // center above the button
    const desiredLeft = rect.left + rect.width / 2;
    // clamp so tooltip stays within viewport (accounting for translateX(-50%))
    const minLeft = popupW / 2 + 8;
    const maxLeft = window.innerWidth - popupW / 2 - 8;
    const left = Math.min(Math.max(desiredLeft, minLeft), maxLeft);
    const top = Math.max(8, rect.top - popupH - 10);
    // apply the precise position
    setPopupPos({ top, left });
  }, [showPopup]);

  // clear timers on unmount
  useEffect(() => {
    return () => {
      if (popupShowTimerRef.current) {
        window.clearTimeout(popupShowTimerRef.current);
        popupShowTimerRef.current = null;
      }
      if (popupHideTimerRef.current) {
        window.clearTimeout(popupHideTimerRef.current);
        popupHideTimerRef.current = null;
      }
      if (popupUnmountTimerRef.current) {
        window.clearTimeout(popupUnmountTimerRef.current);
        popupUnmountTimerRef.current = null;
      }
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-4">
          <div className="card-surface p-5 border-blue-200 bg-gradient-to-br from-blue-50 via-slate-50 to-white">
            <div className="flex items-center gap-2 text-sm text-blue-700"><Users size={16} /> Total students</div>
            <div className="mt-3 text-3xl font-bold text-slate-900">{stats.totalStudents}</div>
          </div>
          <div className="card-surface p-5 border-emerald-200 bg-gradient-to-br from-emerald-50 via-slate-50 to-white">
            <div className="flex items-center gap-2 text-sm text-emerald-700"><ClipboardList size={16} /> Present today</div>
            <div className="mt-3 text-3xl font-bold text-slate-900">{stats.presentToday}</div>
          </div>
          <div className="card-surface p-5 border-rose-200 bg-gradient-to-br from-rose-50 via-slate-50 to-white">
            <div className="flex items-center gap-2 text-sm text-rose-700"><ClipboardList size={16} /> Absent today</div>
            <div className="mt-3 text-3xl font-bold text-slate-900">{stats.absentToday}</div>
          </div>
          <div className="card-surface p-5 border-amber-200 bg-gradient-to-br from-amber-50 via-slate-50 to-white">
            <div className="flex items-center gap-2 text-sm text-amber-700"><MapPinned size={16} /> Out-of-range</div>
            <div className="mt-3 text-3xl font-bold text-slate-900">{stats.outOfRangeAttempts}</div>
          </div>
        </section>

        <section className="card-surface relative overflow-hidden border-sky-200 bg-gradient-to-br from-sky-50 via-white to-slate-50 p-6">
          <div className="absolute right-4 top-4 flex items-center gap-2 text-sky-200/70">
            <ShieldCheck size={40} className="animate-bounce" />
          </div>
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                <Building2 size={14} /> {user?.department ?? 'Department information'}
              </div>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">Department overview</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">This panel shows your assigned department and provides a focused view of students and attendance activity within it.</p>
            </div>
            {/* department action removed to avoid duplicate display */}
          </div>
        </section>

        <section className="card-surface p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-lg font-semibold text-slate-900">Student directory</div>
              <div className="text-sm text-slate-600">Click a student to review profile details and attendance status.</div>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:w-auto sm:items-end sm:justify-end lg:mr-4">
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
                placeholder="Search students by name, email or ID"
                className="form-input h-10 px-3 py-2 w-full sm:w-[260px] min-w-0 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 placeholder:text-sm"
              />
              <div className="flex w-full flex-col gap-2 sm:w-auto">
                <button
                  type="button"
                  onClick={handleSearch}
                  ref={searchButtonRef}
                  className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold w-full sm:w-auto"
                >
                  Find Students
                </button>
                {error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700">
                    {error}
                  </div>
                ) : null}
                {showPopup && createPortal(
                  <div
                    ref={popupRef}
                    style={{
                      position: 'fixed',
                      top: popupPos.top,
                      left: popupPos.left,
                      transform: 'translateX(-50%)',
                      zIndex: 60,
                      pointerEvents: 'none',
                    }}
                  >
                    <div style={{position: 'relative', display: 'inline-block'}}>
                      <div className={`rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-lg transition-opacity transition-transform duration-300`} style={{minWidth: 220, boxShadow: '0 6px 18px rgba(15,23,42,0.12)', transform: popupAnimated ? 'translateY(0)' : 'translateY(8px)', opacity: popupAnimated ? 1 : 0}}>
                        Enter id/email/name first to search student
                      </div>
                      <div style={{position: 'absolute', left: '50%', bottom: -6, transform: 'translateX(-50%) rotate(45deg)', width: 12, height: 12, background: 'white', borderLeft: '1px solid rgba(15,23,42,0.06)', borderTop: '1px solid rgba(15,23,42,0.06)'}} />
                    </div>
                  </div>,
                  document.body
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm max-h-[420px] min-h-0 overflow-hidden">
              {filteredStudents.length ? (
                <div className="space-y-3 max-h-[340px] min-h-0 overflow-y-auto pr-2">
                  {filteredStudents.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => setSelectedStudent(student)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-left transition hover:border-brand-500 hover:bg-slate-50"
                    >
                      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">{student.name}</div>
                          <div className="text-sm text-slate-500 truncate">{student.email}</div>
                        </div>
                        <div className="text-sm text-slate-500 sm:text-right break-words">
                          {student.accountId ?? student.studentId ?? 'ID N/A'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">
                  {students.length > 0 ? 'No students match your search. Try a different name, email or ID.' : 'No students have been added yet.'}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-lg font-semibold text-slate-900">Student profile</div>
                  <div className="text-sm text-slate-600">Select a student to view their profile and attendance status.</div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
                  <BellRing size={16} /> Notifications
                </div>
              </div>

              {selectedStudent ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-xl font-bold text-slate-900">{selectedStudent.name}</div>
                    <div className="text-sm text-slate-500">{selectedStudent.email}</div>
                  </div>
                  {selectedStudentLatestAttendance ? (
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                      <div className="font-semibold text-slate-900">Latest attendance</div>
                      <div className="mt-2 flex flex-col gap-1">
                        <span>{selectedStudentLatestAttendance.date}</span>
                        <span className="text-slate-700">Status: {selectedStudentLatestAttendance.status.replace('_', ' ')}</span>
                        {selectedStudentLatestAttendance.status === 'late' ? (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">This student has logged in late.</span>
                        ) : selectedStudentLatestAttendance.status === 'out_of_range' ? (
                          <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">This student was out of range earlier.</span>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm text-slate-500">Student ID</div>
                      <div className="mt-2 text-lg font-semibold text-slate-900">{selectedStudent.studentId ?? 'N/A'}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm text-slate-500">Department</div>
                      <div className="mt-2 text-lg font-semibold text-slate-900">{selectedStudent.department ?? selectedStudent.profile?.department ?? 'N/A'}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">Select a student from the list to view their details here.</div>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-slate-900">Recent notifications</div>
                <div className="text-sm text-slate-500">These notifications are scoped to your admin user.</div>
              </div>
              <div className="rounded-full bg-blue-50 px-3 py-2 text-blue-700">
                <div className="flex flex-col items-center justify-center md:flex-row md:items-center md:justify-center gap-0 md:gap-2">
                  <span className="text-base font-semibold leading-none">{unreadCount}</span>
                  <span className="text-xs md:text-sm leading-none">unread</span>
                </div>
              </div>
            </div>

            {recentNotifications.length ? (
              <div className="space-y-3">
                {recentNotifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => void handleNotificationClick(notification.id)}
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
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No recent notifications available.</div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
