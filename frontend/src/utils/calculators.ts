import {
  Home, User, Car, GraduationCap, Briefcase, Landmark,
  TrendingUp, PiggyBank, BarChart3, ArrowUpCircle, LineChart, PercentCircle, Target,
  Wallet, CalendarClock, Coins, BadgeIndianRupee,
  CheckSquare, ClipboardCheck, CreditCard, Receipt,
  IndianRupee, Building, FileText, Calculator, Globe, Plane,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface CalcItem {
  label: string;
  path: string;
  desc: string;
  icon: LucideIcon;
  color: string; // Tailwind bg class for icon background e.g. "bg-purple-500"
}

export interface CalcCategory {
  title: string;
  categoryIcon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'amber';
  items: CalcItem[];
}

export const calculatorCategories: CalcCategory[] = [
  {
    title: 'Loan EMI Calculators',
    categoryIcon: Landmark,
    color: 'blue',
    items: [
      { label: 'Home Loan EMI',         path: '/calculators/home-loan-emi',      desc: 'Plan your home loan repayment',        icon: Home,          color: 'bg-purple-500' },
      { label: 'Personal Loan EMI',     path: '/calculators/personal-loan-emi',  desc: 'Check personal loan EMI instantly',    icon: User,          color: 'bg-blue-500' },
      { label: 'Car Loan EMI',          path: '/calculators/car-loan-emi',       desc: 'Know your car loan monthly payment',   icon: Car,           color: 'bg-orange-500' },
      { label: 'Education Loan EMI',    path: '/calculators/education-loan-emi', desc: 'Plan education loan repayment',        icon: GraduationCap, color: 'bg-emerald-500' },
      { label: 'Business Loan EMI',     path: '/calculators/business-loan-emi',  desc: 'Calculate business loan EMI',          icon: Briefcase,     color: 'bg-indigo-500' },
      { label: 'Loan Against Property', path: '/calculators/lap-emi',            desc: 'Calculate LAP EMI & eligibility',      icon: Landmark,      color: 'bg-amber-500' },
    ],
  },
  {
    title: 'Investment Calculators',
    categoryIcon: TrendingUp,
    color: 'purple',
    items: [
      { label: 'SIP Calculator',      path: '/calculators/sip',         desc: 'Project your SIP returns',             icon: TrendingUp,      color: 'bg-emerald-500' },
      { label: 'Lumpsum Calculator',  path: '/calculators/lumpsum',     desc: 'Calculate lumpsum investment growth',  icon: Coins,           color: 'bg-teal-500' },
      { label: 'SWP Calculator',      path: '/calculators/swp',         desc: 'Plan systematic withdrawals',          icon: Wallet,          color: 'bg-pink-500' },
      { label: 'Step-Up SIP',         path: '/calculators/step-up-sip', desc: 'SIP with annual step-up increments',   icon: ArrowUpCircle,   color: 'bg-violet-500' },
      { label: 'Mutual Fund Returns', path: '/calculators/mutual-fund', desc: 'Estimate mutual fund returns',         icon: BarChart3,       color: 'bg-cyan-500' },
      { label: 'CAGR Calculator',     path: '/calculators/cagr',        desc: 'Find compound annual growth rate',     icon: LineChart,       color: 'bg-lime-600' },
      { label: 'XIRR Calculator',     path: '/calculators/xirr',        desc: 'Calculate returns on irregular flows', icon: PercentCircle,   color: 'bg-sky-500' },
      { label: 'FD Calculator',       path: '/calculators/fd',          desc: 'Calculate fixed deposit maturity',     icon: PiggyBank,       color: 'bg-brand-600' },
      { label: 'RD Calculator',       path: '/calculators/rd',          desc: 'Know your RD maturity amount',         icon: CalendarClock,   color: 'bg-blue-500' },
      { label: 'PPF Calculator',      path: '/calculators/ppf',         desc: 'Calculate PPF maturity value',         icon: BadgeIndianRupee,color: 'bg-green-600' },
      { label: 'NPS Calculator',      path: '/calculators/nps',         desc: 'Plan your NPS pension corpus',         icon: Target,          color: 'bg-rose-500' },
    ],
  },
  {
    title: 'Loan Eligibility Calculators',
    categoryIcon: CheckSquare,
    color: 'purple',
    items: [
      { label: 'Home Loan Eligibility',      path: '/calculators/home-loan-eligibility',     desc: 'Check max home loan you qualify for', icon: ClipboardCheck, color: 'bg-purple-500' },
      { label: 'Personal Loan Eligibility',  path: '/calculators/personal-loan-eligibility', desc: 'Know your personal loan eligibility',  icon: CheckSquare,    color: 'bg-blue-500' },
      { label: 'Home Prepayment Calculator', path: '/calculators/home-prepayment',           desc: 'See savings from prepayment',          icon: Home,           color: 'bg-teal-500' },
      { label: 'Personal Prepayment',        path: '/calculators/personal-prepayment',       desc: 'Calculate prepayment savings',         icon: CreditCard,     color: 'bg-indigo-500' },
      { label: 'GST Calculator',             path: '/calculators/gst',                       desc: 'Calculate GST on any amount',          icon: Receipt,        color: 'bg-orange-500' },
    ],
  },
  {
    title: 'Tax & Salary Calculators',
    categoryIcon: IndianRupee,
    color: 'blue',
    items: [
      { label: 'Salary Calculator',     path: '/calculators/salary-calculator', desc: 'CTC to in-hand with tax breakdown',  icon: IndianRupee, color: 'bg-brand-600' },
      { label: 'HRA Calculator',        path: '/calculators/hra-calculator',    desc: 'Calculate HRA tax exemption',        icon: Building,    color: 'bg-teal-500' },
      { label: 'Income Tax Calculator', path: '/calculators/income-tax',        desc: 'Old vs New regime tax comparison',   icon: Landmark,    color: 'bg-rose-500' },
    ],
  },
  {
    title: 'NRI Calculators',
    categoryIcon: Globe,
    color: 'purple',
    items: [
      { label: 'RNOR Status',       path: '/calculators/rnor-status',       desc: 'Check NRI / RNOR / ROR residential status',    icon: Plane,      color: 'bg-sky-500' },
      { label: 'NRI FD Calculator', path: '/calculators/nri-fd',            desc: 'Compare NRE, NRO & FCNR FD returns after tax', icon: PiggyBank,  color: 'bg-emerald-500' },
      { label: 'Capital Gains Tax', path: '/calculators/nri-capital-gains', desc: 'Tax on sale of Indian property or equity',     icon: TrendingUp, color: 'bg-rose-500' },
      { label: 'Rental Income Tax', path: '/calculators/nri-rental-income', desc: 'Tax & TDS on rent from Indian property',       icon: Building,   color: 'bg-amber-500' },
    ],
  },
];
