import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, X, Loader2, CheckCircle2 } from 'lucide-react';

export interface ComboboxOption {
  value: string;
  label: string;
  icon?: string;
}

export function Combobox({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  loading,
  minChars = 0,
  renderOption,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  minChars?: number;
  renderOption?: (opt: ComboboxOption, highlighted: React.ReactNode) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOpt = options.find((o) => o.value === value);
  const selectedLabel = selectedOpt?.label ?? '';
  const selectedIcon = selectedOpt?.icon;
  const filtered =
    query.length < Math.max(minChars, 1)
      ? options
      : options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    if (disabled || loading) return;
    setQuery('');
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSelect = useCallback(
    (opt: ComboboxOption) => {
      onChange(opt.value);
      setQuery('');
      setOpen(false);
    },
    [onChange]
  );

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
    if (e.key === 'Enter' && filtered.length === 1) handleSelect(filtered[0]);
  };

  function highlight(text: string, q: string) {
    if (!q) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-gold/25 text-gold rounded px-0.5 not-italic">
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-semibold text-ink mb-2">{label}</label>
      <div
        onClick={handleOpen}
        className={`relative flex items-center rounded-[13px] px-3 py-2.5 bg-bg-2 transition-all cursor-pointer min-h-[50px]
          border ${open ? 'border-acc ring-[3px] ring-acc/20' : 'border-line-2 hover:border-acc'}
          ${disabled || loading ? 'opacity-50 cursor-not-allowed bg-surface-2' : ''}`}
      >
        {open ? (
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={minChars > 0 ? `Type ${minChars}+ chars to filter…` : `Search ${options.length} options…`}
            className="flex-1 outline-none text-sm text-ink bg-transparent font-sans"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className={`flex-1 text-sm truncate flex items-center gap-2 ${
              selectedLabel ? 'text-ink font-semibold' : 'text-faint'
            }`}
          >
            {loading ? (
              'Loading…'
            ) : (
              <>
                {selectedIcon && (
                  <img src={selectedIcon} alt="" className="w-5 h-5 object-contain rounded flex-shrink-0" />
                )}
                {selectedLabel || placeholder || `Select ${label}`}
              </>
            )}
          </span>
        )}
        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          {loading && <Loader2 className="w-4 h-4 text-muted animate-spin" />}
          {!loading && value && !open && (
            <button onClick={handleClear} className="p-0.5 rounded-full hover:bg-surface-2 text-muted hover:text-acc">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-muted transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scaleY: 0.97 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            style={{ transformOrigin: 'top' }}
            className="absolute z-50 mt-1 w-full bg-surface-2 border border-line-2 rounded-[13px] shadow-2xl max-h-60 overflow-y-auto"
          >
            {minChars > 0 && query.length < minChars && options.length > 20 && (
              <div className="px-3 py-2 text-xs text-faint border-b border-line flex items-center gap-1.5 sticky top-0 bg-surface-2 rounded-t-[13px]">
                <Search className="w-3 h-3" /> Type {minChars}+ characters to filter {options.length} options
              </div>
            )}
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-sm text-faint text-center">No matches for "{query}"</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2
                    ${opt.value === value ? 'bg-acc-deep text-acc font-semibold' : 'text-ink hover:bg-surface'}`}
                >
                  {opt.value === value ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-acc flex-shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 flex-shrink-0" />
                  )}
                  {renderOption ? renderOption(opt, highlight(opt.label, query)) : <span>{highlight(opt.label, query)}</span>}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
