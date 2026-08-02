import { motion } from 'framer-motion';
import { ShieldCheck, Users, MapPinned, BellRing, ArrowRight, HelpCircle, MessageCircleQuestion, Sparkles, BadgeCheck, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  { icon: ShieldCheck, title: 'Secure RBAC', text: 'Role-based access for students and admin staff with token-protected routes.' },
  { icon: MapPinned, title: 'GPS Geofencing', text: 'Attendance is validated against the configured campus boundary using coordinates.' },
  { icon: BellRing, title: 'Real-Time Alerts', text: 'Students and admins receive immediate notifications for success and violation events.' },
];

const heroHighlights = [
  { icon: BadgeCheck, label: 'Reliable verification' },
  { icon: Clock3, label: 'Live attendance updates' },
  { icon: Sparkles, label: 'Modern campus UX' },
];

export function LandingPage() {
  return (
    <div className="min-h-screen text-slate-900">
      <main>
        <section className="relative overflow-hidden py-16">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_40%)]" />
          <div className="container-shell relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700 shadow-sm">
                <Sparkles size={14} /> Smart attendance platform
              </div>
              <h1 className="max-w-3xl text-5xl font-black leading-tight text-slate-900 sm:text-6xl">
                Modern attendance tracking that works for campuses.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Mark attendance using live geolocation, prevent duplicate submissions, and keep staff and students informed in real time.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {heroHighlights.map(({ icon: Icon, label }) => (
                  <div key={label} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-sm font-medium text-slate-600 shadow-sm">
                    <Icon size={14} className="text-brand-600" /> {label}
                  </div>
                ))}
              </div>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link to="/login" className="btn-primary-animated inline-flex items-center gap-2 rounded-full px-6 py-3 shadow-xl shadow-brand-500/20">
                  Open Dashboard <ArrowRight size={16} />
                </Link>
                <Link to="/admin" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Admin Preview
                </Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="relative overflow-hidden rounded-[40px] border border-slate-200 bg-white/90 p-6 shadow-2xl shadow-slate-300/20 before:absolute before:-left-10 before:-top-10 before:h-40 before:w-40 before:rounded-full before:bg-gradient-to-br before:from-brand-500 before:to-cyan-400 before:blur-3xl">
              <div className="grid gap-4">
                <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/20">
                  <div className="text-sm uppercase tracking-[0.2em] text-brand-200">Platform summary</div>
                  <div className="mt-4 text-2xl font-semibold">Geo-verified attendance control</div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">Role-aware access, real-time alerts, and campus-boundary enforcement for every login.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-blue-50 p-5 shadow-sm shadow-slate-200/60">
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Access model</div>
                    <div className="mt-3 text-lg font-semibold text-slate-900">Student + Admin</div>
                  </div>
                  <div className="rounded-3xl bg-emerald-50 p-5 shadow-sm shadow-slate-200/60">
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Verification</div>
                    <div className="mt-3 text-lg font-semibold text-slate-900">GPS + policy checks</div>
                  </div>
                </div>
                <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span className="font-medium">Live campus readiness</span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Online</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-200">
                    <div className="h-2 w-[88%] rounded-full bg-gradient-to-r from-brand-500 to-cyan-400" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="features" className="container-shell py-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Why this system works</h2>
            <p className="mt-3 max-w-2xl mx-auto text-sm text-slate-600">A premium SaaS-style implementation for universities and training institutions.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <motion.div key={title} whileHover={{ y: -8, scale: 1.01 }} className="card-surface group p-6 transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-100">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
                <div className="mt-5 h-1.5 w-16 rounded-full bg-gradient-to-r from-brand-500 to-cyan-400" />
              </motion.div>
            ))}
          </div>
        </section>

        <section id="help" className="container-shell py-16">
          <div className="rounded-[40px] border border-slate-200 bg-gradient-to-br from-brand-50 via-white to-emerald-50 p-8 shadow-lg shadow-slate-200/40">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700 shadow-sm">
                  Help & support
                </div>
                <h2 className="mt-4 text-3xl font-bold text-slate-900">Need help with attendance?</h2>
                <p className="mt-3 text-lg text-slate-600">
                  Students can quickly reach out for account access, location issues, or attendance concerns through our support flow.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><HelpCircle size={20} /></div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">Guided support</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">Find quick answers for common issues before you reach out.</p>
                </div>
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><MessageCircleQuestion size={20} /></div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">Contact the team</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">Our support team is always ready to help with attendance and access problems.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="container-shell py-16">
          <div className="grid gap-8 rounded-[40px] bg-slate-900 p-8 text-white lg:grid-cols-[1fr_1fr]">
            <div>
              <h2 className="text-3xl font-bold">Built for real campus operations</h2>
              <p className="mt-4 text-slate-300">
                The system provides admin visibility, student accountability, policy enforcement via geofencing, and instant alerts for abnormal attendance attempts.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[32px] bg-white/10 p-5 shadow-lg shadow-slate-950/20">
                <div className="flex items-center gap-2 text-sm font-semibold text-brand-100"><Users size={18} /> Student-first</div>
                <p className="mt-3 text-sm text-slate-300">Modern dashboard with attendance transparency.</p>
              </div>
              <div className="rounded-[32px] bg-white/10 p-5 shadow-lg shadow-slate-950/20">
                <div className="flex items-center gap-2 text-sm font-semibold text-brand-100"><ShieldCheck size={18} /> Admin-ready</div>
                <p className="mt-3 text-sm text-slate-300">Search, filter, summaries, and records at a glance.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-slate-700/20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-slate-100">
        <div className="container-shell grid gap-4 py-8 text-sm md:grid-cols-3 md:items-center">
          <div className="text-center md:text-left text-slate-300">© 2026 Attendance Monitor. All rights reserved.</div>
          <div className="text-center text-slate-300">MIT License • Secure • Responsive • Real-Time</div>
          <div className="text-center md:text-right text-slate-300">Made with <span className="text-rose-400">♥</span> by Pratik Raj</div>
        </div>
      </footer>
    </div>
  );
}
