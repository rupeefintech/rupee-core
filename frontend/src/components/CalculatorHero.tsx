import { Link } from "react-router-dom";
import { Calculator, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface CalculatorHeroProps {
  /** Last breadcrumb segment, e.g. "Income Tax" */
  crumb: string;
  /** First (white) part of the H1 */
  title: string;
  /** Highlighted (light) part of the H1 */
  accent?: string;
  /** One-line subtitle under the H1 */
  subtitle: string;
  icon?: LucideIcon;
  /** Tailwind max-width class matching the page content (default max-w-3xl) */
  widthClass?: string;
}

export default function CalculatorHero({ crumb, title, accent, subtitle, icon: Icon = Calculator, widthClass = "max-w-3xl" }: CalculatorHeroProps) {
  return (
    <div className="bg-gradient-to-br from-brand-700 to-brand-900 text-white py-12 px-4">
      <div className={`${widthClass} mx-auto`}>
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-brand-200 text-xs uppercase tracking-wider mb-6">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-brand-300" />
          <Link to="/calculators" className="hover:text-white transition-colors">Calculators</Link>
          <ChevronRight className="w-3 h-3 text-brand-300" />
          <span className="text-white font-medium">{crumb}</span>
        </nav>
        <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
          <Icon className="text-brand-200 w-9 h-9 flex-shrink-0" />
          <span>{title}{accent ? <> <span className="text-brand-200">{accent}</span></> : null}</span>
        </h1>
        <p className="text-brand-100 mt-3 text-lg max-w-xl border-l-2 border-brand-300/30 pl-4">{subtitle}</p>
      </div>
    </div>
  );
}
