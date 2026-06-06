import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin, Search, ChevronRight, ArrowRight } from 'lucide-react';

export default function PinCodeIndiaPage() {
  return (
    <>
      <Helmet>
        <title>PIN Code in India — What It Is, Structure & How to Find It | RupeePedia</title>
        <meta name="description" content="PIN code full form is Postal Index Number — a 6-digit code used by India Post to identify post offices and delivery areas. Learn PIN code structure, zones, and how to find your PIN code." />
        <link rel="canonical" href="https://rupeepedia.in/pin-code-india" />
        <meta property="og:title" content="PIN Code in India — Structure, Zones & How to Find It" />
        <meta property="og:description" content="PIN code (Postal Index Number) is a 6-digit code used by India Post. Learn what each digit means and how to find any PIN code in India." />
        <meta property="og:url" content="https://rupeepedia.in/pin-code-india" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://rupeepedia.in/logo.png" />
        <meta name="twitter:card" content="summary" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Article',
              headline: 'PIN Code in India — What It Is, Structure & How to Find It',
              url: 'https://rupeepedia.in/pin-code-india',
              description: 'PIN code (Postal Index Number) is a 6-digit code used by India Post to identify post offices and delivery areas in India.',
              author: { '@type': 'Organization', name: 'RupeePedia', url: 'https://rupeepedia.in' },
              publisher: { '@type': 'Organization', name: 'RupeePedia', url: 'https://rupeepedia.in', logo: { '@type': 'ImageObject', url: 'https://rupeepedia.in/logo.png' } },
              breadcrumb: {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rupeepedia.in' },
                  { '@type': 'ListItem', position: 2, name: 'PIN Code Finder', item: 'https://rupeepedia.in/pin-codes' },
                  { '@type': 'ListItem', position: 3, name: 'PIN Code India Guide', item: 'https://rupeepedia.in/pin-code-india' },
                ],
              },
            },
            {
              '@type': 'FAQPage',
              mainEntity: [
                { '@type': 'Question', name: 'What is the full form of PIN code?', acceptedAnswer: { '@type': 'Answer', text: 'PIN code stands for Postal Index Number. It is a 6-digit code introduced by India Post in 1972 to simplify the sorting and delivery of mail across India.' } },
                { '@type': 'Question', name: 'How many digits is an Indian PIN code?', acceptedAnswer: { '@type': 'Answer', text: 'An Indian PIN code is always 6 digits long. The first digit represents the postal zone (1–9), the second digit represents the sub-zone, and the remaining digits identify the specific sorting district and delivery post office.' } },
                { '@type': 'Question', name: 'How do I find the PIN code of my area?', acceptedAnswer: { '@type': 'Answer', text: 'Use the PIN Code Finder at rupeepedia.in/pin-codes. Search by 6-digit PIN code, post office name, or browse by state and district to find any PIN code in India.' } },
                { '@type': 'Question', name: 'What does the first digit of a PIN code indicate?', acceptedAnswer: { '@type': 'Answer', text: 'The first digit of an Indian PIN code indicates the postal zone: 1 = Delhi/Haryana/Punjab, 2 = UP/Uttarakhand, 3 = Rajasthan/Gujarat, 4 = Maharashtra/MP/Chhattisgarh, 5 = Andhra Pradesh/Karnataka/Telangana, 6 = Tamil Nadu/Kerala, 7 = West Bengal/Odisha/Northeast, 8 = Bihar/Jharkhand/Odisha, 9 = Army Post Offices.' } },
              ],
            },
          ],
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-gradient-to-br from-indigo-800 to-indigo-700 text-white px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <nav className="flex items-center gap-1.5 text-indigo-300 text-xs mb-5">
              <Link to="/" className="hover:text-white">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link to="/pin-codes" className="hover:text-white">PIN Code Finder</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white">PIN Code India Guide</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">PIN Code in India</h1>
            <p className="text-indigo-200 text-lg">Full form, structure, zones, and how to find your postal code</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

          {/* Definition */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-3">What is a PIN Code?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>PIN code</strong> stands for <strong>Postal Index Number</strong>. It is a <strong>6-digit numerical code</strong> introduced by India Post on <strong>15 August 1972</strong> to simplify sorting and delivery of mail across India. Every post office, town, and rural area in India has a unique PIN code.
            </p>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <p className="text-sm text-indigo-800 font-semibold mb-1">Example PIN Code — Mumbai (Fort)</p>
              <p className="font-mono text-3xl text-indigo-700 font-bold tracking-widest">400 001</p>
              <div className="grid grid-cols-3 mt-2 text-xs text-indigo-600 gap-1">
                <span><strong>4</strong> — Zone (Maharashtra)</span>
                <span><strong>0</strong> — Sub-zone</span>
                <span><strong>0001</strong> — Sort district + delivery office</span>
              </div>
            </div>
          </section>

          {/* Structure */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">PIN Code Structure — What Each Digit Means</h2>
            <div className="space-y-3">
              {[
                { pos: '1st digit', desc: 'Postal zone — India is divided into 9 zones (1–9). Indicates the region of India.' },
                { pos: '2nd digit', desc: 'Sub-zone — further divides the postal zone into sub-regions (states or groups of states).' },
                { pos: '3rd digit', desc: 'Sorting district — identifies the sorting/distribution office for that area.' },
                { pos: '4th–6th digits', desc: 'Delivery post office — uniquely identifies the specific post office responsible for final delivery.' },
              ].map(({ pos, desc }) => (
                <div key={pos} className="flex gap-3">
                  <span className="w-28 shrink-0 text-sm font-semibold text-indigo-700">{pos}</span>
                  <span className="text-sm text-gray-600">{desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Zones */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">India PIN Code Zones (First Digit)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-600">First Digit</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-600">Zone</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-600">States Covered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['1', 'Northern', 'Delhi, Haryana, Punjab, Himachal Pradesh, Jammu & Kashmir, Chandigarh'],
                    ['2', 'Northern', 'Uttar Pradesh, Uttarakhand'],
                    ['3', 'Western', 'Rajasthan, Gujarat, Dadra & Nagar Haveli, Daman & Diu'],
                    ['4', 'Western', 'Maharashtra, Madhya Pradesh, Chhattisgarh, Goa'],
                    ['5', 'Southern', 'Andhra Pradesh, Telangana, Karnataka'],
                    ['6', 'Southern', 'Tamil Nadu, Kerala, Puducherry, Lakshadweep'],
                    ['7', 'Eastern', 'West Bengal, Odisha, Assam, Northeast states'],
                    ['8', 'Eastern', 'Bihar, Jharkhand, Andaman & Nicobar Islands'],
                    ['9', 'Army Post Office', 'APS and FPO (Armed Forces)'],
                  ].map(([d, z, s]) => (
                    <tr key={d}>
                      <td className="px-4 py-2.5 font-mono font-bold text-indigo-700 text-lg">{d}XXXXX</td>
                      <td className="px-4 py-2.5 text-gray-700 font-medium">{z}</td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs">{s}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Post office types */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Types of Post Offices in India</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { t: 'H.O — Head Post Office', d: 'The main administrative hub for a postal district. Manages all sub-offices and branch offices in the district. Usually located in the district headquarters.' },
                { t: 'S.O — Sub Post Office', d: 'Serves urban towns and sub-urban areas under a Head Post Office. Handles most postal services including speed post, money orders, and savings accounts.' },
                { t: 'B.O — Branch Post Office', d: 'The smallest unit, usually in villages and remote areas. Limited services. Operates under a Sub Post Office or Head Post Office.' },
              ].map(({ t, d }) => (
                <div key={t} className="p-4 bg-gray-50 rounded-xl">
                  <p className="font-bold text-gray-800 text-sm mb-1.5">{t}</p>
                  <p className="text-xs text-gray-500">{d}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is PIN code same as ZIP code?', a: 'PIN code (Postal Index Number) is the Indian equivalent of ZIP code used in the USA. Both identify specific delivery areas, but the format differs — Indian PIN codes are 6 digits; US ZIP codes are 5 digits.' },
                { q: 'Can two areas have the same PIN code?', a: 'Yes. A single PIN code can cover multiple localities, villages, or areas that fall under the same delivery post office. Conversely, large cities may have dozens of different PIN codes.' },
                { q: 'How many PIN codes are there in India?', a: 'India has approximately 1,50,000+ post offices with unique PIN codes, covering all 28 states and 8 union territories. All are searchable on RupeePedia\'s PIN code directory.' },
                { q: 'What is India Post?', a: 'India Post (Department of Posts) is the government postal service of India, operating under the Ministry of Communications. It operates the largest postal network in the world by number of post offices.' },
              ].map(({ q, a }) => (
                <div key={q} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <p className="font-semibold text-gray-800 mb-1">{q}</p>
                  <p className="text-sm text-gray-600">{a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related links */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Related Tools</h2>
            <div className="space-y-2">
              {[
                { label: 'PIN Code Finder — Search any post office in India', to: '/pin-codes', icon: MapPin },
                { label: 'IFSC Code Finder — Find bank branch IFSC codes', to: '/ifsc-finder', icon: Search },
                { label: 'What is IFSC Code? — Full guide', to: '/what-is-ifsc-code', icon: ArrowRight },
              ].map(({ label, to, icon: Icon }) => (
                <Link key={to} to={to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 transition-all">
                  <Icon className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="text-sm text-gray-700">{label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                </Link>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center">
            <p className="text-indigo-800 font-semibold mb-3">Find the PIN code for any post office in India</p>
            <Link to="/pin-codes" className="inline-flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              <Search className="w-4 h-4" /> Open PIN Code Finder
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
