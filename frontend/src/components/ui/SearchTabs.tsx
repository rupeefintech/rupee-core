import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchTab {
  key: string;
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  examples: string[];
}

export function SearchTabs({
  tabs,
  activeKey,
  onTabChange,
  value,
  onValueChange,
  onSubmit,
}: {
  tabs: SearchTab[];
  activeKey: string;
  onTabChange: (key: string) => void;
  value: string;
  onValueChange: (v: string) => void;
  onSubmit: () => void;
}) {
  const active = tabs.find((t) => t.key === activeKey) ?? tabs[0];

  return (
    <div className="relative z-[2] max-w-[760px] mx-auto mt-9 bg-gradient-to-b from-surface-2 to-surface border border-line-2 rounded-[20px] p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,.8),0_0_60px_-20px_var(--acc-glow)]">
      <div role="tablist" className="flex gap-1.5 bg-bg-2 border border-line rounded-[13px] p-[5px] mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={t.key === activeKey}
            onClick={() => onTabChange(t.key)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 font-semibold text-[.92rem] rounded-[9px] py-2.5 px-2 transition-colors',
              t.key === activeKey ? 'bg-raise text-ink' : 'text-muted hover:text-ink'
            )}
          >
            <span className={cn('w-[17px] h-[17px]', t.key === activeKey ? 'text-acc' : 'opacity-80')}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2.5">
        <label className="flex-1 relative flex items-center">
          <Search className="absolute left-[15px] w-[19px] h-[19px] text-muted pointer-events-none" />
          <input
            type="text"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
            placeholder={active.placeholder}
            autoComplete="off"
            aria-label="Search"
            className="w-full text-[1.02rem] text-ink bg-bg-2 border border-line-2 rounded-[13px] py-[15px] pl-11 pr-4 outline-none placeholder:text-faint focus:border-acc focus:ring-[3px] focus:ring-acc/20 transition-all"
          />
        </label>
        <button
          onClick={onSubmit}
          className="px-[22px] py-[15px] rounded-[13px] text-[1rem] font-semibold bg-gradient-to-br from-mint to-acc text-white shadow-acc-glow hover:-translate-y-px hover:shadow-acc-glow-lg transition-all"
        >
          Search
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap mt-3.5">
        <span className="font-mono text-[.78rem] text-muted">Try:</span>
        {active.examples.map((ex) => (
          <button
            key={ex}
            onClick={() => onValueChange(ex)}
            className="font-mono text-[.8rem] text-body bg-bg-2 border border-line rounded-lg px-[11px] py-[5px] hover:border-acc hover:text-ink transition-colors"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
