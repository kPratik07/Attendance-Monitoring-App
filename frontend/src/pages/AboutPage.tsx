import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, UsersRound } from 'lucide-react';

const highlights = [
  {
    icon: ShieldCheck,
    title: 'Secure by design',
    text: 'Role-based access keeps students and admins focused on the right actions with protected routes.',
  },
  {
    icon: UsersRound,
    title: 'Clear collaboration',
    text: 'Department owners can review attendance and respond faster with targeted alerts and summaries.',
  },
  {
    icon: Sparkles,
    title: 'Modern experience',
    text: 'The portal feels polished and consistent, from the landing experience to the dashboard itself.',
  },
];

export function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="container-shell py-16">
        <div className="grid gap-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="page-surface">
            <div className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
              About the platform
            </div>
            <h1 className="mt-5 text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
              A smarter way to manage campus attendance.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Attendance Monitor helps institutions keep attendance simple, accurate, and transparent. Students check in from approved cities, while department admins receive the right updates without being overwhelmed.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">
                Geo-aware check-ins
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                Department-focused alerts
              </div>
            </div>
          </motion.div>
        </div>

        <section className="mt-8 grid gap-4 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
          <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-950 via-blue-800 to-cyan-500 p-6 text-white shadow-[0_20px_60px_-24px_rgba(15,23,42,0.45)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_45%)]" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="max-w-xl">
                <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-100">
                  Why it matters
                </div>
                <h2 className="mt-4 text-2xl font-semibold leading-tight">
                  A more reliable attendance experience for everyone.
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-100/90">
                  This platform helps colleges move from paper-based attendance to a digital, location-aware system that is faster to manage and easier to trust.
                </p>
              </div>
              <div className="mt-6 grid gap-2 text-sm text-slate-100 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <div className="font-semibold text-white">Location-aware check-ins</div>
                  <div className="mt-1 text-slate-100/85">Students can mark attendance from verified campus areas, making every entry more dependable.</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <div className="font-semibold text-white">Smart admin visibility</div>
                  <div className="mt-1 text-slate-100/85">Department admins receive timely updates for late arrivals, successful submissions, and attendance changes.</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <div className="font-semibold text-white">Clear, organized records</div>
                  <div className="mt-1 text-slate-100/85">The portal keeps attendance history easy to review, helping colleges stay transparent and efficient.</div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-1">
            {highlights.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <Icon size={18} />
                </div>
                <h2 className="mt-3 text-lg font-semibold text-slate-900">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
