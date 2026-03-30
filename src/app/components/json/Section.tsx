import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { formatKey, formatValue } from '../../utils/formatters';
import { Field, FieldGroup } from './Field';
import { SectionValue } from './SectionValue';

interface SectionProps {
  sectionKey: string;
  value: unknown;
  label?: string;
}

export function Section({ sectionKey, value, label }: SectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between bg-brand-green/10 hover:bg-brand-green/18 border-b border-brand-green/25 px-4 py-2.5 text-left transition-colors duration-100"
      >
        <span className="text-sm font-semibold text-brand-green/80">
          {label ?? formatKey(sectionKey)}
        </span>
        <ChevronRight
          className="h-4 w-4 text-brand-green/50 transition-transform duration-150"
          style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)' }}
        />
      </button>

      {!collapsed && (
        <div className="p-4">
          {value === null || value === undefined || typeof value !== 'object' ? (
            <Field label={formatKey(sectionKey)} value={value} />
          ) : Array.isArray(value) ? (
            <div className="flex flex-col gap-2">
              {(value as unknown[]).map((item, i) => (
                <div key={i} className="rounded-md border border-gray-200 bg-gray-50 p-3">
                  {typeof item === 'object' && item !== null
                    ? <FieldGroup data={item as Record<string, unknown>} />
                    : <span className="text-sm text-gray-800">{formatValue(item)}</span>}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                <SectionValue key={k} label={formatKey(k)} value={v} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
