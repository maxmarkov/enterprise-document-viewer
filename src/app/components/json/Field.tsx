import { formatValue } from '../../utils/formatters';
import { useHighlight } from './HighlightContext';
import { cn } from '../ui/utils';

export function Field({ label, value }: { label: string; value: unknown }) {
  const { activeHighlight, setHighlight } = useHighlight();
  const formatted = formatValue(value);
  const isHighlightable = value !== null && value !== undefined && formatted !== '—';
  const isActive = isHighlightable && activeHighlight === formatted;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </span>
      <div
        onClick={isHighlightable ? () => setHighlight(isActive ? null : formatted) : undefined}
        className={cn(
          'rounded-md border px-3 py-2 text-sm text-gray-800 min-h-[36px] transition-colors duration-100',
          isHighlightable && 'cursor-pointer',
          isActive
            ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-300'
            : isHighlightable
            ? 'bg-gray-50 border-gray-200 hover:bg-amber-50/40 hover:border-amber-200'
            : 'bg-gray-50 border-gray-200',
        )}
      >
        {formatted}
      </div>
    </div>
  );
}

export function FieldGroup({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Object.entries(data).map(([k, v]) => (
        <Field
          key={k}
          label={k.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/^./, s => s.toUpperCase()).trim()}
          value={typeof v === 'object' && v !== null ? JSON.stringify(v) : v}
        />
      ))}
    </div>
  );
}
