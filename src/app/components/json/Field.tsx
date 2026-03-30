import { formatValue } from '../../utils/formatters';

export function Field({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </span>
      <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 min-h-[36px]">
        {formatValue(value)}
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
