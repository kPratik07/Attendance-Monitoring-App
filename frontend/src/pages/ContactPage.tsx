import { motion } from 'framer-motion';
import { Mail, PhoneCall, MapPin, MessageSquareHeart } from 'lucide-react';

const contactCards = [
  {
    icon: Mail,
    title: 'Email support',
    text: 'Reach out for onboarding, account issues, or attendance troubleshooting.',
    value: 'support@attendance-monitor.app',
  },
  {
    icon: PhoneCall,
    title: 'Call us',
    text: 'Talk with the operations team for urgent campus assistance.',
    value: '+91 9062144984',
  },
  {
    icon: MapPin,
    title: 'Campus office',
    text: 'Visit our support desk during working hours for in-person help.',
    value: 'Mumbai, Maharashtra',
  },
];

export function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="container-shell py-16">
        <div className="grid gap-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="page-surface">
            <div className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
              Contact support
            </div>
            <h1 className="mt-5 text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
              We are here to help.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              If you have trouble logging in, marking attendance, or need help with campus access, our support team is ready to guide you.
            </p>
            <div className="mt-8 rounded-[32px] border border-slate-200 bg-slate-900 p-6 text-white shadow-xl shadow-slate-300/30">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <MessageSquareHeart size={20} />
                </div>
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Need a quick response?</div>
                  <div className="text-xl font-semibold">Share your concern and we will help you resolve it.</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45 }} className="grid gap-4">
            {contactCards.map(({ icon: Icon, title, text, value }) => (
              <div key={title} className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm shadow-slate-200/40 transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
                    <div className="mt-3 inline-flex rounded-full bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white">{value}</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
