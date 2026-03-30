import { formatValue } from './formatters';

export interface HighlightEntry {
  text: string;
  color: string;
}

export const BLOCK_COLORS = [
  '#bfdbfe', // blue-200
  '#bbf7d0', // green-200
  '#fed7aa', // orange-200
  '#ddd6fe', // purple-200
  '#fbcfe8', // pink-200
  '#fef08a', // yellow-200
  '#99f6e4', // teal-200
  '#fecaca', // red-200
];

export function getBlockColor(blockIndex: number): string {
  return BLOCK_COLORS[blockIndex % BLOCK_COLORS.length];
}

function collectStrings(obj: Record<string, unknown>): string[] {
  const results: string[] = [];
  for (const v of Object.values(obj)) {
    if (v === null || v === undefined || typeof v === 'object') continue;
    const formatted = formatValue(v);
    if (formatted !== '—' && formatted.trim().length >= 3) {
      results.push(formatted.trim());
    }
  }
  return results;
}

/**
 * Extracts highlight entries from JSON data.
 * Each dict (object) in an array gets a unique color based on its global block index.
 */
export function extractHighlights(jsonData: unknown): HighlightEntry[] {
  const entries: HighlightEntry[] = [];
  let blockIndex = 0;

  function processArray(arr: unknown[]) {
    for (const item of arr) {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        const color = getBlockColor(blockIndex++);
        for (const text of collectStrings(item as Record<string, unknown>)) {
          entries.push({ text, color });
        }
      }
    }
  }

  if (Array.isArray(jsonData)) {
    for (const item of jsonData) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
      const record = item as Record<string, unknown>;

      if ('section_data' in record) {
        const sdata = record.section_data;
        if (Array.isArray(sdata)) {
          processArray(sdata);
        } else if (sdata && typeof sdata === 'object' && !Array.isArray(sdata)) {
          const color = getBlockColor(blockIndex++);
          for (const text of collectStrings(sdata as Record<string, unknown>)) {
            entries.push({ text, color });
          }
        }
      } else {
        // plain array of dicts — each item is its own block
        const color = getBlockColor(blockIndex++);
        for (const text of collectStrings(record)) {
          entries.push({ text, color });
        }
      }
    }
  } else if (jsonData && typeof jsonData === 'object') {
    for (const v of Object.values(jsonData as Record<string, unknown>)) {
      if (Array.isArray(v)) {
        processArray(v);
      } else if (v && typeof v === 'object' && !Array.isArray(v)) {
        const color = getBlockColor(blockIndex++);
        for (const text of collectStrings(v as Record<string, unknown>)) {
          entries.push({ text, color });
        }
      }
    }
  }

  return entries;
}

/**
 * Finds the surrounding text snippet in markdown for a given field value.
 * Returns the snippet with the matched portion marked, or null if not found.
 */
export function extractMarkdownContext(
  text: string,
  markdown: string,
  contextChars = 110,
): { before: string; match: string; after: string } | null {
  const lower = markdown.toLowerCase();
  const idx = lower.indexOf(text.toLowerCase());
  if (idx === -1) return null;

  const start = Math.max(0, idx - contextChars);
  const end = Math.min(markdown.length, idx + text.length + contextChars);

  // Strip markdown syntax for cleaner display
  function clean(s: string) {
    return s
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*(.+?)\*\*/gs, '$1')
      .replace(/\*(.+?)\*/gs, '$1')
      .replace(/`(.+?)`/gs, '$1')
      .replace(/\[(.+?)\]\(.+?\)/gs, '$1')
      .replace(/\n+/g, ' ')
      .trim();
  }

  let before = markdown.slice(start, idx);
  const match = markdown.slice(idx, idx + text.length);
  let after = markdown.slice(idx + text.length, end);

  if (start > 0) before = before.replace(/^\S*\s?/, '');
  if (end < markdown.length) after = after.replace(/\s?\S*$/, '');

  return {
    before: (start > 0 ? '…' : '') + clean(before),
    match: clean(match),
    after: clean(after) + (end < markdown.length ? '…' : ''),
  };
}

/**
 * Computes the global block offset for each section so colors are stable
 * across the entire JSON viewer (not resetting per section).
 */
export function computeBlockOffsets(
  sections: Array<{ value: unknown }>,
): number[] {
  const offsets: number[] = [];
  let offset = 0;
  for (const { value } of sections) {
    offsets.push(offset);
    if (Array.isArray(value)) {
      offset += value.filter(
        x => x && typeof x === 'object' && !Array.isArray(x),
      ).length;
    } else {
      offset += 1;
    }
  }
  return offsets;
}
