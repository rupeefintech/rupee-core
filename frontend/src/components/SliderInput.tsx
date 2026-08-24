import { useState, useEffect } from 'react';

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
  parseInput?: (raw: string) => number;
  color?: 'blue' | 'green' | 'amber' | 'violet' | 'rose' | 'teal' | 'indigo' | 'orange' | 'purple';
  disabled?: boolean;
  hint?: string;
  isZero?: boolean;
}

const colorMap: Record<string, { bg: string; text: string; accent: string; focus: string; btn: string }> = {
  blue:   { bg: 'bg-acc-deep',      text: 'text-acc',    accent: 'accent-acc',    focus: 'focus:border-acc',    btn: 'bg-acc-deep hover:bg-acc/20 text-acc'       },
  green:  { bg: 'bg-mint/10',       text: 'text-mint',   accent: 'accent-mint',   focus: 'focus:border-mint',   btn: 'bg-mint/10 hover:bg-mint/20 text-mint'      },
  amber:  { bg: 'bg-gold/10',       text: 'text-gold',   accent: 'accent-gold',   focus: 'focus:border-gold',   btn: 'bg-gold/10 hover:bg-gold/20 text-gold'      },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet', accent: 'accent-violet', focus: 'focus:border-violet', btn: 'bg-violet-500/10 hover:bg-violet-500/20 text-violet' },
  rose:   { bg: 'bg-coral/10',      text: 'text-coral',  accent: 'accent-coral',  focus: 'focus:border-coral',  btn: 'bg-coral/10 hover:bg-coral/20 text-coral'   },
  teal:   { bg: 'bg-cyan-500/10',   text: 'text-cyan',   accent: 'accent-cyan',   focus: 'focus:border-cyan',   btn: 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan' },
  indigo: { bg: 'bg-acc-deep',      text: 'text-acc',    accent: 'accent-acc',    focus: 'focus:border-acc',    btn: 'bg-acc-deep hover:bg-acc/20 text-acc'       },
  orange: { bg: 'bg-gold/10',       text: 'text-gold',   accent: 'accent-gold',   focus: 'focus:border-gold',   btn: 'bg-gold/10 hover:bg-gold/20 text-gold'      },
  purple: { bg: 'bg-violet-500/10', text: 'text-violet', accent: 'accent-violet', focus: 'focus:border-violet', btn: 'bg-violet-500/10 hover:bg-violet-500/20 text-violet' },
};

export default function SliderInput({
  label, value, min, max, step, display, onChange,
  parseInput, color = 'blue', disabled = false, hint, isZero = false,
}: Props) {
  const c = colorMap[color];

  const [localText, setLocalText] = useState(display);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) setLocalText(display);
  }, [display, isFocused]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    const raw = String(value === 0 ? '' : value);
    setLocalText(raw);
    setTimeout(() => e.target.select(), 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setLocalText(text);
    const stripped = text.replace(/[^0-9.]/g, '');
    if (stripped === '' || stripped === '0') { onChange(0); return; }
    const parsed = parseInput ? parseInput(text) : parseFloat(stripped);
    if (!isNaN(parsed)) onChange(Math.min(Math.max(parsed, 0), max));
  };

  const handleBlur = () => {
    setIsFocused(false);
    setLocalText(display);
  };

  const decrement = () => {
    if (disabled) return;
    onChange(Math.max(min, Math.round((value - step) / step) * step));
  };

  const increment = () => {
    if (disabled) return;
    onChange(Math.min(max, Math.round((value + step) / step) * step));
  };

  const minLabel = display.includes('%') ? `${min}%`
    : display.includes('Yr') ? `${min} Yr`
    : display.includes('Mo') ? `${min} Mo`
    : `₹${min.toLocaleString('en-IN')}`;

  const maxLabel = display.includes('%') ? `${max}%`
    : display.includes('Yr') ? `${max} Yr`
    : display.includes('Mo') ? `${max} Mo`
    : `₹${max.toLocaleString('en-IN')}`;

  const inputClass = isZero
    ? 'bg-coral/10 text-coral border-coral focus:border-coral'
    : `${c.bg} ${c.text} ${c.focus} border-transparent hover:border-line-2`;

  const btnBase = `w-7 h-7 rounded-md flex items-center justify-center text-base font-bold leading-none select-none transition-colors
    ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`;

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-body">{label}</label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={decrement}
            disabled={disabled || value <= min}
            className={`${btnBase} ${isZero ? 'bg-coral/10 text-coral' : c.btn} disabled:opacity-30`}
            aria-label={`Decrease ${label}`}
          >
            −
          </button>
          <input
            type="text"
            value={isFocused ? localText : display}
            disabled={disabled}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`
              ${inputClass}
              text-sm font-bold px-2 py-1.5 rounded-lg w-28 text-center
              border focus:outline-none transition-colors
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
            `}
          />
          <button
            type="button"
            onClick={increment}
            disabled={disabled || value >= max}
            className={`${btnBase} ${isZero ? 'bg-coral/10 text-coral' : c.btn} disabled:opacity-30`}
            aria-label={`Increase ${label}`}
          >
            +
          </button>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={e => onChange(Number(e.target.value))}
        className={`w-full ${isZero ? 'accent-coral' : c.accent} cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      <div className="flex justify-between text-xs text-faint mt-1">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
      {isZero && <p className="text-xs text-coral mt-1">Please enter a value greater than 0</p>}
      {hint && !isZero && <p className={`text-xs mt-1 ${c.text} opacity-80`}>{hint}</p>}
    </div>
  );
}
