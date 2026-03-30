import { formatKey, formatValue } from '../../utils/formatters';
import { Field, FieldGroup } from './Field';

export function SectionValue({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined || typeof value !== 'object') {
    return <Field label={label} value={value} />;
  }

  if (Array.isArray(value)) {
    return (
      <div className="col-span-2 flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</span>
        <div className="flex flex-col gap-2">
          {value.map((item, i) => (
            <div key={i} className="rounded-md border border-gray-200 bg-gray-50 p-3">
              {typeof item === 'object' && item !== null
                ? <FieldGroup data={item as Record<string, unknown>} />
                : <span className="text-sm text-gray-800">{formatValue(item)}</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-2 flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</span>
      <div className="rounded-md border border-gray-100 bg-gray-50/50 p-3">
        <FieldGroup data={value as Record<string, unknown>} />
      </div>
    </div>
  );
}
