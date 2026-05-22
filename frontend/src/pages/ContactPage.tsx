import { Helmet } from 'react-helmet-async';
import { Mail, MessageSquare, Clock, HelpCircle, Search, Calculator } from 'lucide-react';

const FAQS = [
  {
    q: 'Is Rupeepedia free to use?',
    a: 'Yes — 100% free. No registration, no login, no fees. All IFSC lookups, calculators, and guides are completely free.',
  },
  {
    q: 'How do I report an incorrect IFSC code or branch detail?',
    a: 'Email us at contact@rupeepedia.in with the IFSC code, what is wrong, and the correct information. We sync from RBI-authorised data and will fix discrepancies within 48 hours.',
  },
  {
    q: 'Can I use Rupeepedia data for my app or website?',
    a: 'Please email us. We review API/data partnership requests case by case.',
  },
  {
    q: 'I found a bug or the site is showing wrong data.',
    a: 'Email us with the URL and a screenshot. Bugs are typically fixed within 24–48 hours.',
  },
];

export default function ContactPage() {
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
            Questions, incorrect data, bugs, or partnership requests — we read every email.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10">

        {/* Left — get in touch */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Get in touch</h2>

          <div className="space-y-5">
            <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-0.5">Email</p>
                <a
                  href="mailto:contact@rupeepedia.in"
                  className="text-brand-600 hover:text-brand-800 font-medium text-sm transition-colors"
                >
                  contact@rupeepedia.in
                </a>
                <p className="text-xs text-gray-400 mt-1">For all queries — data, bugs, partnerships</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-0.5">Response time</p>
                <p className="text-sm text-gray-600">Within 24–48 hours on weekdays</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-0.5">What to include</p>
                <ul className="text-sm text-gray-500 space-y-0.5 mt-1 list-disc list-inside">
                  <li>URL of the page with the issue</li>
                  <li>What's wrong and what it should be</li>
                  <li>Screenshot if relevant</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-8">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick links</p>
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
