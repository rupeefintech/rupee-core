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
    <header className="py-8 md:py-10">
      <div className={`${widthClass} mx-auto px-4 sm:px-6`}>
        <div className="relative overflow-hidden force-dark rounded-3xl border border-line bg-surface py-10 md:py-14 px-6 md:px-10">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-120px] right-[-80px] w-[380px] h-[380px] rounded-full opacity-25 blur-[30px]"
                 style={{ background: 'radial-gradient(50% 50% at 50% 50%, var(--acc-glow), transparent 70%)' }} />
          </div>
          <div className="relative z-[2]">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-muted text-xs uppercase tracking-wider mb-6 font-mono">
              <Link to="/" className="hover:text-ink transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3 text-faint" />
              <Link to="/calculators" className="hover:text-ink transition-colors">Calculators</Link>
              <ChevronRight className="w-3 h-3 text-faint" />
              <span className="text-ink font-medium">{crumb}</span>
            </nav>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold flex items-center gap-3 text-ink">
              <Icon className="text-acc w-9 h-9 flex-shrink-0" />
              <span>{title}{accent ? <> <span className="text-acc">{accent}</span></> : null}</span>
            </h1>
            <p className="text-body mt-3 text-lg max-w-xl border-l-2 border-acc/30 pl-4">{subtitle}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
