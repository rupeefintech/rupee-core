import {
  Home, User, Car, GraduationCap, Briefcase, Landmark,
  TrendingUp, PiggyBank, BarChart3, ArrowUpCircle, LineChart, PercentCircle, Target,
  Wallet, CalendarClock, Coins, BadgeIndianRupee,
  CheckSquare, ClipboardCheck, CreditCard, Receipt,
  IndianRupee, Building, FileText, Calculator, 
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface CalcItem {
  label: string;
  path: string;
  desc: string;
  icon: LucideIcon;
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
      { label: 'Home Loan EMI',          path: '/calculators/home-loan-emi',      desc: 'Plan your home loan repayment',         icon: Home },
      { label: 'Personal Loan EMI',      path: '/calculators/personal-loan-emi',  desc: 'Check personal loan EMI instantly',     icon: User },
      { label: 'Car Loan EMI',           path: '/calculators/car-loan-emi',       desc: 'Know your car loan monthly payment',    icon: Car },
      { label: 'Education Loan EMI',     path: '/calculators/education-loan-emi', desc: 'Plan education loan repayment',         icon: GraduationCap },
      { label: 'Business Loan EMI',      path: '/calculators/business-loan-emi',  desc: 'Calculate business loan EMI',           icon: Briefcase },
      { label: 'Loan Against Property',  path: '/calculators/lap-emi',            desc: 'Calculate LAP EMI & eligibility',       icon: Landmark },
    ],
  },
  {
    title: 'Investment Calculators',
    categoryIcon: TrendingUp,
    color: 'purple',
    items: [
      { label: 'SIP Calculator',         path: '/calculators/sip',         desc: 'Project your SIP returns',            icon: TrendingUp },
      { label: 'Lumpsum Calculator',     path: '/calculators/lumpsum',     desc: 'Calculate lumpsum investment growth',  icon: Coins },
      { label: 'SWP Calculator',         path: '/calculators/swp',         desc: 'Plan systematic withdrawals',         icon: Wallet },
      { label: 'Step-Up SIP',            path: '/calculators/step-up-sip', desc: 'SIP with annual step-up increments',  icon: ArrowUpCircle },
      { label: 'Mutual Fund Returns',    path: '/calculators/mutual-fund', desc: 'Estimate mutual fund returns',        icon: BarChart3 },
      { label: 'CAGR Calculator',        path: '/calculators/cagr',        desc: 'Find compound annual growth rate',    icon: LineChart },
      { label: 'XIRR Calculator',        path: '/calculators/xirr',        desc: 'Calculate returns on irregular flows', icon: PercentCircle },
      { label: 'FD Calculator',          path: '/calculators/fd',          desc: 'Calculate fixed deposit maturity',    icon: PiggyBank },
      { label: 'RD Calculator',          path: '/calculators/rd',          desc: 'Know your RD maturity amount',        icon: CalendarClock },
      { label: 'PPF Calculator',         path: '/calculators/ppf',         desc: 'Calculate PPF maturity value',        icon: BadgeIndianRupee },
      { label: 'NPS Calculator',         path: '/calculators/nps',         desc: 'Plan your NPS pension corpus',        icon: Target },
    ],
  },
  {
    title: 'Loan Eligibility Calculators',
    categoryIcon: CheckSquare,
    color: 'purple',
    items: [
      { label: 'Home Loan Eligibility',       path: '/calculators/home-loan-eligibility',     desc: 'Check max home loan you qualify for',  icon: ClipboardCheck },
      { label: 'Personal Loan Eligibility',   path: '/calculators/personal-loan-eligibility', desc: 'Know your personal loan eligibility',  icon: CheckSquare },
      { label: 'Home Prepayment Calculator',  path: '/calculators/home-prepayment',           desc: 'See savings from prepayment',          icon: Home },
      { label: 'Personal Prepayment',         path: '/calculators/personal-prepayment',       desc: 'Calculate prepayment savings',         icon: CreditCard },
      { label: 'GST Calculator',              path: '/calculators/gst',                       desc: 'Calculate GST on any amount',          icon: Receipt },
    ],
  },
  {
    title: 'Tax & Salary Calculators',
    categoryIcon: IndianRupee,
    color: 'blue',
    items: [
      { label: 'Salary Calculator',    path: '/calculators/salary-calculator', desc: 'CTC to in-hand with tax breakdown',   icon: IndianRupee },
      { label: 'HRA Calculator',       path: '/calculators/hra-calculator',    desc: 'Calculate HRA tax exemption',         icon: Building },
      { label: 'Income Tax Calculator', path: '/calculators/income-tax', desc: 'Old vs New regime tax comparison', icon: Landmark },
    ],
  },
];
