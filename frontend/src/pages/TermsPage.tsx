import { Helmet } from 'react-helmet-async';
import { FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using RupeePedia (rupeepedia.in), you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree with any part of these terms, please discontinue use of the platform immediately.

These Terms are governed by the laws of India, including the Information Technology Act, 2000 and applicable Reserve Bank of India (RBI) guidelines.`,
  },
  {
    title: '2. Nature of the Service',
    body: `RupeePedia is a free, informational platform that provides:
- **IFSC code lookup** — search IFSC and MICR codes for over 1,77,000 bank branches across India
- **Branch details** — addresses, payment mode availability (NEFT, RTGS, IMPS, UPI), and contact information
- **Financial calculators** — EMI, SIP, FD/RD, PPF, NPS, income tax, GST, and more
- **Educational content** — guides on banking transfers, payment systems, and financial planning

**RupeePedia is not a bank, NBFC, payment aggregator, or registered investment advisor.** We are not regulated by the Reserve Bank of India (RBI), Securities and Exchange Board of India (SEBI), Insurance Regulatory and Development Authority (IRDAI), or any other financial regulator. Nothing on this platform constitutes financial, investment, legal, or tax advice.`,
  },
  {
    title: '3. IFSC & Branch Data — Accuracy Disclaimer',
    body: `IFSC codes, MICR codes, branch addresses, and related banking data on RupeePedia are sourced from publicly available datasets published by the Reserve Bank of India (RBI) and the National Payments Corporation of India (NPCI). We update this data periodically.

However, we cannot guarantee real-time accuracy because:
- Banks may open, close, merge, or relocate branches without prior public notice
- RBI may reassign or deactivate IFSC codes following bank mergers or restructuring
- Branch phone numbers and addresses are subject to change at any time

**You must verify all IFSC codes, MICR codes, and branch details directly with your bank or on the official bank website before initiating any NEFT, RTGS, IMPS, or other financial transaction.** RupeePedia is not responsible for any failed, delayed, or misdirected transactions resulting from the use of information on this platform.`,
  },
  {
    title: '4. Financial Calculators — Not Financial Advice',
    body: `All calculators on RupeePedia (EMI, SIP, FD, income tax, GST, etc.) are mathematical tools that produce estimates based solely on the inputs you provide. They are designed for general educational and planning purposes only.

Calculator results:
- Do not account for bank-specific processing fees, prepayment charges, or foreclosure penalties
- Do not reflect real-time or bank-specific interest rates — use rates published by your bank
- Are not personalised financial advice and are not tailored to your individual financial situation
- Do not factor in tax implications specific to your income slab, deductions, or exemptions

**Do not make financial, investment, or borrowing decisions based solely on calculator output.** Consult a SEBI-registered investment advisor, AMFI-registered mutual fund distributor, or a qualified chartered accountant for personalised financial guidance.`,
  },
  {
    title: '5. No Banking or Payment Services',
    body: `RupeePedia does not:
- Process, facilitate, or initiate any financial transactions
- Hold, transfer, or manage any funds on behalf of users
- Provide banking, lending, insurance, or investment services
- Act as a payment aggregator, payment gateway, or wallet service

We are a pure information and tools platform. Any banking transaction you initiate using information found on this platform is solely between you and your bank.`,
  },
  {
    title: '6. Intellectual Property',
    body: `All content on RupeePedia — including platform design, text, logos, icons, code, and original educational content — is the intellectual property of RupeePedia or its licensors and is protected under the Copyright Act, 1957 and other applicable Indian intellectual property laws.

IFSC codes, bank names, branch addresses, and RBI/NPCI data are public information and remain the property of their respective owners (RBI, NPCI, and the individual banks).

You may not reproduce, redistribute, scrape, resell, or commercially exploit any content from this platform without prior written permission from RupeePedia. Personal, non-commercial use — such as copying an IFSC code for your own bank transfer — is permitted.`,
  },
  {
    title: '7. Prohibited Use',
    body: `You agree not to:
- Use automated bots, scrapers, crawlers, or scripts to bulk-download data from RupeePedia
- Use the platform for any purpose that violates Indian law, including the IT Act 2000
- Attempt to gain unauthorised access to any part of the platform, its APIs, or infrastructure
- Introduce or transmit any malware, virus, or malicious code
- Impersonate RupeePedia or misrepresent our data as your own product or service
- Use RupeePedia data to build a competing IFSC lookup service without permission
- Engage in any activity that disrupts, overloads, or damages the platform or its servers`,
  },
  {
    title: '8. Limitation of Liability',
    body: `To the fullest extent permitted by applicable Indian law, RupeePedia, its owners, operators, employees, and contributors shall not be liable for:
- Any direct, indirect, incidental, special, or consequential loss or damage arising from your use of the platform
- Errors, omissions, or inaccuracies in IFSC, MICR, or branch data
- Failed, delayed, or incorrectly routed financial transactions
- Loss of funds due to use of an incorrect or outdated IFSC code found on this platform
- Service downtime, data unavailability, or platform interruptions
- Any reliance on financial calculator results for actual financial decisions

Your use of RupeePedia is entirely at your own risk. The platform is provided "as is" without warranties of any kind, express or implied.`,
  },
  {
    title: '9. Third-Party Links & Resources',
    body: `RupeePedia may contain links to official bank websites, RBI resources, NPCI portals, or other third-party sites. These links are provided for convenience and reference only. We have no control over, and are not responsible for, the content, accuracy, privacy practices, or availability of any third-party website. Visiting any external link is at your own risk.`,
  },
  {
    title: '10. Modifications to the Platform',
    body: `We reserve the right to modify, update, suspend, or discontinue any feature or part of RupeePedia at any time without prior notice. We may also revise these Terms at any time. When we do, we will update the "Last updated" date at the top of this page. Your continued use of the platform after any revision constitutes your acceptance of the updated Terms.`,
  },
  {
    title: '11. Governing Law & Jurisdiction',
    body: `These Terms & Conditions are governed by and construed in accordance with the laws of India, including the Information Technology Act, 2000 and Consumer Protection Act, 2019 where applicable.

Any dispute, claim, or controversy arising out of or relating to these Terms or your use of RupeePedia shall be subject to the exclusive jurisdiction of the competent courts in Hyderabad, Telangana, India.`,
  },
  {
    title: '12. Contact Us',
    body: `For any questions, concerns, or notices regarding these Terms, please contact:\n\n**RupeePedia**\nWebsite: rupeepedia.in\nEmail: hello@rupeepedia.in`,
  },
];

export default function TermsPage() {
  return (
    <>
      <Helmet>
        <title>Terms & Conditions — RupeePedia</title>
        <meta name="description" content="Terms and conditions for using RupeePedia — India's IFSC code and financial knowledge platform. Governed by Indian law including the IT Act 2000." />
        <link rel="canonical" href="https://rupeepedia.in/terms" />
      </Helmet>

      <section className="hero-bg py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div {...fadeUp()}>
            <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-brand-600" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-900 mb-3">Terms & Conditions</h1>
            <p className="text-gray-500 text-sm">Last updated: April 23, 2026</p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">

        <motion.div {...fadeUp(0.05)} className="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm leading-relaxed">
          <strong>Important:</strong> RupeePedia provides IFSC codes, branch details, and financial calculators for informational purposes only. We are not a bank or financial advisor. Always verify IFSC codes and branch details directly with your bank before initiating any transaction.
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
          These Terms & Conditions are governed by the laws of India. IFSC data is sourced from public datasets published by the Reserve Bank of India (RBI) and the National Payments Corporation of India (NPCI).
        </motion.div>

      </div>
    </>
  );
}
