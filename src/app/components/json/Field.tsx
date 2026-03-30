import { useState } from 'react';
import { formatValue } from '../../utils/formatters';
import { extractMarkdownContext } from '../../utils/highlights';
import { useHighlight } from './HighlightContext';
import { cn } from '../ui/utils';

function MarkdownSnippet({ text, markdownContent, color }: { text: string; markdownContent: string; color: string }) {
  const ctx = extractMarkdownContext(text, markdownContent);
  if (!ctx) return null;
  return (
    <div className="absolute bottom-full left-0 mb-1.5 z-50 w-72 rounded-lg border border-gray-200 bg-white p-2.5 text-xs text-gray-600 shadow-lg pointer-events-none">
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        Found in notes
      </div>
      <div className="leading-relaxed">
        {ctx.before}
        <mark
          className="rounded-sm px-0.5 font-medium text-gray-800"
          style={{ backgroundColor: color }}
        >
          {ctx.match}
        </mark>
        {ctx.after}
      </div>
    </div>
  );
}

export function Field({ label, value, color }: { label: string; value: unknown; color?: string }) {
  const { activeHighlight, setHighlight, markdownContent } = useHighlight();
  const [hovered, setHovered] = useState(false);
  const formatted = formatValue(value);
  const isHighlightable = value !== null && value !== undefined && formatted !== '—';
  const isActive = isHighlightable && activeHighlight === formatted;
  const showTooltip = hovered && !!color && isHighlightable && !!markdownContent;
  const isFoundInMarkdown = isHighlightable && !!markdownContent && formatted.trim().length >= 3 && !!extractMarkdownContext(formatted, markdownContent);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </span>
      <div
        className="relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          onClick={isHighlightable ? () => setHighlight(isActive ? null : formatted) : undefined}
          className={cn(
            'rounded-md border px-3 py-2 text-sm text-gray-800 min-h-[36px] transition-colors duration-100',
            isHighlightable && 'cursor-pointer',
            isActive
              ? color ? '' : 'bg-amber-50 border-amber-300 ring-1 ring-amber-300'
              : isHighlightable
              ? 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
              : 'bg-gray-50 border-gray-200',
            isFoundInMarkdown && !isActive && 'border-l-2 border-l-emerald-400',
          )}
          style={
            isActive && color
              ? { backgroundColor: color, borderColor: color, boxShadow: `0 0 0 1px ${color}` }
              : !isActive && color && isHighlightable
              ? { backgroundColor: color + '38', borderColor: color + '90' }
              : undefined
          }
        >
          {formatted}
        </div>
        {showTooltip && (
          <MarkdownSnippet text={formatted} markdownContent={markdownContent!} color={color!} />
        )}
      </div>
    </div>
  );
}

export function FieldGroup({ data, color }: { data: Record<string, unknown>; color?: string }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Object.entries(data).map(([k, v]) => (
        <Field
          key={k}
          label={k.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/^./, s => s.toUpperCase()).trim()}
          value={typeof v === 'object' && v !== null ? JSON.stringify(v) : v}
          color={color}
        />
      ))}
    </div>
  );
}
