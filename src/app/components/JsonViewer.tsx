import { useState } from 'react';
import { FileJson, Copy, Check } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { Button } from './ui/button';
import { EmptyState } from './EmptyState';
import { Section } from './json/Section';
import { formatValue } from '../utils/formatters';
import { computeBlockOffsets } from '../utils/highlights';
import { COPY_FEEDBACK_MS } from '../constants';
import type { FolderRecord } from '../data/mockData';

interface JsonViewerProps {
  json?: FolderRecord['files']['json'];
}

type SectionItem = { section_name: string; section_data: unknown };

function isSectionList(data: unknown): data is SectionItem[] {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    typeof (data[0] as Record<string, unknown>)?.section_name === 'string' &&
    'section_data' in (data[0] as Record<string, unknown>)
  );
}

export function JsonViewer({ json }: JsonViewerProps) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);

  if (!json) return <EmptyState type="no-json" />;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(json.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
  };

  const data = json.data;
  const isObject = typeof data === 'object' && data !== null && !Array.isArray(data);

  // Build section descriptors to compute global block offsets for consistent coloring
  const sections: Array<{ key: string; label?: string; value: unknown }> = isSectionList(data)
    ? data.map(item => ({ key: item.section_name, label: item.section_name, value: item.section_data }))
    : isObject
    ? Object.entries(data as Record<string, unknown>).map(([k, v]) => ({ key: k, value: v }))
    : [];

  const blockOffsets = computeBlockOffsets(sections.map(s => ({ value: s.value })));

  return (
    <div className="flex h-full flex-col bg-[#f8f9fc]">
      <div className="h-[3px] bg-emerald-500 flex-shrink-0" />

      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50">
            <FileJson className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <span className="font-semibold text-sm text-gray-800">{t.structuredData}</span>
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">JSON</span>
          <span className="text-xs text-gray-400">{json.size}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 gap-1.5 text-xs px-2">
          {copied
            ? <><Check className="h-3.5 w-3.5 text-green-600" />{t.copied}</>
            : <><Copy className="h-3.5 w-3.5" />{t.copy}</>}
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-4 flex flex-col gap-3">
          {sections.length > 0 ? (
            sections.map((s, i) => (
              <Section
                key={s.key}
                sectionKey={s.key}
                label={s.label}
                value={s.value}
                blockOffset={blockOffsets[i]}
              />
            ))
          ) : (
            <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800">
              {formatValue(data)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
