import { Helmet } from 'react-helmet-async';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

const SECTIONS = [
  {
    title: '1. About RupeePedia',
    body: `RupeePedia (rupeepedia.in) is a free, informational platform that provides IFSC code lookup, bank branch details, and financial calculators for users across India. We are not a bank, payment service provider, or registered financial advisor.

This Privacy Policy explains what information we collect when you use RupeePedia, how we use it, and your rights under applicable Indian law including the Digital Personal Data Protection Act, 2023 (DPDP Act) and the Information Technology Act, 2000.`,
  },
  {
    title: '2. Information We Collect',
    body: `RupeePedia does not require account registration or login for any core feature. We do not collect your name, email address, phone number, Aadhaar, PAN, or any other personally identifiable information during normal use.

We automatically collect limited technical data:
- **Search queries** (e.g., bank name, branch name, IFSC code entered) — recorded alongside a one-way cryptographic hash of your IP address. Your actual IP address is never stored.
- **Standard access logs** — HTTP request method, URL path, response code, and timestamp. Retained for up to 30 days for debugging and security purposes only.

We do not use tracking cookies, advertising pixels, or third-party analytics scripts.`,
  },
  {
    title: '3. How We Use Your Information',
    body: `The limited data we collect is used solely to:
- Improve search relevance and platform performance
- Identify which bank branches or IFSC codes are most frequently searched so we can prioritise data accuracy updates
- Detect and prevent misuse or abuse of the platform

We do not use your data for advertising, personalised profiling, or any commercial purpose. We do not sell, rent, or share your data with third parties for marketing.`,
  },
  {
    title: '4. IFSC & Bank Data',
    body: `IFSC codes, MICR codes, branch addresses, and related bank data displayed on RupeePedia are sourced from publicly available datasets published by the Reserve Bank of India (RBI) and the National Payments Corporation of India (NPCI). This data is public information and does not include any personal user data.

We update this data periodically but cannot guarantee real-time accuracy. Always verify directly with your bank before initiating any financial transaction.`,
  },
  {
    title: '5. Financial Calculators',
    body: `All financial calculators on RupeePedia (EMI, SIP, FD, income tax, etc.) run entirely within your browser. No input data — loan amounts, salaries, investment figures, or tax details — is transmitted to our servers or stored anywhere. Your financial information never leaves your device when using these tools.`,
  },
  {
    title: '6. Cookies & Tracking',
    body: `RupeePedia does not set any advertising or analytics cookies. We do not use Google Analytics, Meta Pixel, or any similar third-party tracking technology.

The platform may store a session token in your browser's localStorage if you access the administrative panel (internal use only). This token is used solely for authentication and is not shared with any third party.`,
  },
  {
    title: '7. Data Retention',
    body: `- Hashed search query logs: retained for up to 90 days, then permanently deleted
- Server access logs: retained for up to 30 days, then permanently deleted
- No other user data is collected or retained`,
  },
  {
    title: '8. Data Security',
    body: `We implement industry-standard security measures including HTTPS encryption for all data in transit, hashing of identifiers before storage, and access controls on our infrastructure. However, no system is completely secure. While we take reasonable precautions, we cannot guarantee absolute security of data transmitted over the internet.`,
  },
  {
    title: '9. Children\'s Privacy',
    body: `RupeePedia is an informational platform available to users of all ages. We do not knowingly collect personal data from anyone, including children under the age of 18. Since no personal data is collected from any user, no special processing for minors is required.`,
  },
  {
    title: '10. Your Rights Under Indian Law',
    body: `Under the Digital Personal Data Protection Act, 2023 (DPDP Act), you have the right to access, correct, and request erasure of your personal data. Since RupeePedia does not collect personally identifiable information, there is no personal data profile associated with your usage.

If you believe we may hold any data related to you, or have a privacy concern, please contact us at the address below and we will respond within a reasonable timeframe.`,
  },
  {
    title: '11. Third-Party Links',
    body: `RupeePedia may contain links to official bank websites, RBI resources, or other external sites. We are not responsible for the privacy practices or content of those sites. We encourage you to review their privacy policies before sharing any personal information.`,
  },
  {
    title: '12. Changes to This Policy',
    body: `We may revise this Privacy Policy from time to time to reflect changes in our practices or applicable law. When updated, we will change the "Last updated" date at the top of this page. Your continued use of RupeePedia after any changes constitutes acceptance of the updated policy.`,
  },
  {
    title: '13. Contact Us',
    body: `For any privacy-related questions or concerns, please contact:\n\n**RupeePedia**\nWebsite: rupeepedia.in\nEmail: hello@rupeepedia.in`,
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy — RupeePedia</title>
        <meta name="description" content="RupeePedia's privacy policy. We do not collect personal data, show ads, or use tracking cookies. Compliant with India's DPDP Act 2023." />
        <link rel="canonical" href="https://rupeepedia.in/privacy" />
      </Helmet>

      <section className="hero-bg py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div {...fadeUp()}>
            <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-brand-600" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-900 mb-3">Privacy Policy</h1>
            <p className="text-gray-500 text-sm">Last updated: April 23, 2026</p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">

        <motion.div {...fadeUp(0.05)} className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm leading-relaxed">
          <strong>Summary:</strong> RupeePedia does not collect your name, email, phone number, or any personally identifiable information. We do not show ads, sell data, or use tracking cookies. All financial calculator inputs stay in your browser and are never sent to our servers.
        </motion.div>

        {SECTIONS.map((section, i) => (
          <motion.section key={section.title} {...fadeUp(0.05 + i * 0.03)}>
            <h2 className="font-display text-base font-bold text-brand-900 mb-3 pb-2 border-b border-gray-100">
              {section.title}
            </h2>
            <div className="text-gray-600 text-sm leading-relaxed space-y-2">
              {section.body.split('\n\n').map((para, j) => (
                <p key={j} dangerouslySetInnerHTML={{
                  __html: para
                    .replace(/\n/g, '<br/>')
                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'),
                }} />
              ))}
            </div>
          </motion.section>
        ))}

        <motion.div {...fadeUp(0.5)} className="p-5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-500 text-xs leading-relaxed">
          This Privacy Policy is governed by the laws of India, including the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023.
        </motion.div>

      </div>
    </>
  );
}
