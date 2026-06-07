import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, MessageSquare, Clock, HelpCircle, Search, Calculator, Send, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../utils/api';

const FAQS = [
  {
    q: 'Is Rupeepedia free to use?',
    a: 'Yes — 100% free. No registration, no login, no fees. All IFSC lookups, calculators, and guides are completely free.',
  },
  {
    q: 'How do I report an incorrect IFSC code or branch detail?',
    a: 'Use the contact form or email us at contact@rupeepedia.in with the IFSC code, what is wrong, and the correct information. We sync from RBI-authorised data and will fix discrepancies within 48 hours.',
  },
  {
    q: 'Can I use Rupeepedia data for my app or website?',
    a: 'Please reach out via the contact form. We review API/data partnership requests case by case.',
  },
  {
    q: 'I found a bug or the site is showing wrong data.',
    a: 'Use the contact form with the URL and description. Bugs are typically fixed within 24–48 hours.',
  },
];

const SUBJECTS = [
  'Report incorrect IFSC / branch data',
  'Bug report',
  'API / data partnership',
  'Feature request',
  'General enquiry',
  'Other',
];

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject || !form.message.trim()) return;
    setStatus('sending');
    setErrorMsg('');
    try {
      await apiClient.post('/contact', form);
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err?.response?.data?.error ?? 'Something went wrong. Please try again.');
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | Rupeepedia</title>
        <meta name="description" content="Get in touch with the Rupeepedia team. Report incorrect IFSC data, ask questions, or share feedback." />
        <link rel="canonical" href="https://rupeepedia.in/contact" />
      </Helmet>

      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 text-white py-14 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-5">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">Contact Us</h1>
          <p className="text-white/70 text-base max-w-md mx-auto">
            Questions, incorrect data, bugs, or partnership requests — we read every message.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10">

        {/* Left — Contact form */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Send us a message</h2>

          {status === 'success' ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 text-lg mb-2">Message sent!</h3>
              <p className="text-sm text-gray-600 mb-5">
                We typically reply within 24–48 hours on weekdays.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="text-sm font-medium text-brand-600 hover:text-brand-800 transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Your name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="Ravi Kumar"
                    required
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email address *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    placeholder="you@example.com"
                    required
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject *</label>
                <select
                  value={form.subject}
                  onChange={set('subject')}
                  required
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white transition"
                >
                  <option value="">— Select a topic —</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Message *</label>
                <textarea
                  value={form.message}
                  onChange={set('message')}
                  required
                  rows={5}
                  placeholder="Describe your query in detail. For data issues, include the IFSC code and what's incorrect."
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none transition"
                />
              </div>

              {status === 'error' && (
                <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-60 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                {status === 'sending' ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}

          {/* Info cards */}
          <div className="mt-8 space-y-3">
            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-0.5">Direct email</p>
                <a href="mailto:contact@rupeepedia.in" className="text-brand-600 hover:text-brand-800 font-medium text-sm transition-colors">
                  contact@rupeepedia.in
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-0.5">Response time</p>
                <p className="text-sm text-gray-600">Within 24–48 hours on weekdays</p>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick links</p>
            <div className="flex flex-wrap gap-2">
              <a href="/ifsc-finder" className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-full transition-colors">
                <Search className="w-3.5 h-3.5" /> IFSC Finder
              </a>
              <a href="/calculators" className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-full transition-colors">
                <Calculator className="w-3.5 h-3.5" /> Calculators
              </a>
              <a href="/privacy" className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>

        {/* Right — FAQ */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-brand-500" />
            Common questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((item) => (
              <div key={item.q} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm font-semibold text-gray-800 mb-2">{item.q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-5 bg-brand-50 rounded-2xl border border-brand-100">
            <MessageSquare className="w-6 h-6 text-brand-600 mb-3" />
            <p className="text-sm font-semibold text-gray-800 mb-1">What to include</p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside mt-2">
              <li>URL of the page with the issue</li>
              <li>What's wrong and what it should be</li>
              <li>IFSC code (for data corrections)</li>
              <li>Screenshot if relevant</li>
            </ul>
          </div>
        </div>

      </div>

      {/* Bottom CTA */}
      <div className="bg-gray-50 border-t border-gray-100 py-10 text-center px-4">
        <p className="text-gray-500 text-sm">
          Not finding what you need?{' '}
          <a href="mailto:contact@rupeepedia.in" className="text-brand-600 hover:text-brand-800 font-medium transition-colors">
            Email us directly
          </a>{' '}
          and we'll get back to you.
        </p>
      </div>
    </>
  );
}
