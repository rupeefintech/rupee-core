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
  blue:   { bg: 'bg-brand-50',   text: 'text-brand-700',   accent: 'accent-brand-600',   focus: 'focus:border-brand-400',   btn: 'bg-brand-100 hover:bg-brand-200 text-brand-700'   },
  green:  { bg: 'bg-green-50',   text: 'text-green-700',   accent: 'accent-green-600',   focus: 'focus:border-green-400',   btn: 'bg-green-100 hover:bg-green-200 text-green-700'   },
  amber:  { bg: 'bg-amber-50',   text: 'text-amber-700',   accent: 'accent-amber-600',   focus: 'focus:border-amber-400',   btn: 'bg-amber-100 hover:bg-amber-200 text-amber-700'   },
  violet: { bg: 'bg-violet-50',  text: 'text-violet-700',  accent: 'accent-violet-600',  focus: 'focus:border-violet-400',  btn: 'bg-violet-100 hover:bg-violet-200 text-violet-700' },
  rose:   { bg: 'bg-rose-50',    text: 'text-rose-700',    accent: 'accent-rose-600',    focus: 'focus:border-rose-400',    btn: 'bg-rose-100 hover:bg-rose-200 text-rose-700'       },
  teal:   { bg: 'bg-teal-50',    text: 'text-teal-700',    accent: 'accent-teal-600',    focus: 'focus:border-teal-400',    btn: 'bg-teal-100 hover:bg-teal-200 text-teal-700'       },
  indigo: { bg: 'bg-brand-50',   text: 'text-brand-700',   accent: 'accent-brand-600',   focus: 'focus:border-brand-400',   btn: 'bg-brand-100 hover:bg-brand-200 text-brand-700'   },
  orange: { bg: 'bg-orange-50',  text: 'text-orange-700',  accent: 'accent-orange-600',  focus: 'focus:border-orange-400',  btn: 'bg-orange-100 hover:bg-orange-200 text-orange-700' },
  purple: { bg: 'bg-purple-50',  text: 'text-purple-700',  accent: 'accent-purple-600',  focus: 'focus:border-purple-400',  btn: 'bg-purple-100 hover:bg-purple-200 text-purple-700' },
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
    ? 'bg-red-50 text-red-600 border-red-400 focus:border-red-500'
    : `${c.bg} ${c.text} ${c.focus} border-transparent hover:border-slate-300`;

  const btnBase = `w-7 h-7 rounded-md flex items-center justify-center text-base font-bold leading-none select-none transition-colors
    ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`;

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={decrement}
            disabled={disabled || value <= min}
            className={`${btnBase} ${isZero ? 'bg-red-100 text-red-600' : c.btn} disabled:opacity-30`}
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
            className={`${btnBase} ${isZero ? 'bg-red-100 text-red-600' : c.btn} disabled:opacity-30`}
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
        className={`w-full ${isZero ? 'accent-red-500' : c.accent} cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
      {isZero && <p className="text-xs text-red-500 mt-1">Please enter a value greater than 0</p>}
      {hint && !isZero && <p className={`text-xs mt-1 ${c.text} opacity-80`}>{hint}</p>}
    </div>
  );
}
