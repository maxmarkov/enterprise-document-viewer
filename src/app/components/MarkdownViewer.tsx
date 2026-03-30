import { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { useLang } from '../i18n/LangContext';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { visit, SKIP } from 'unist-util-visit';
import { FileText, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { EmptyState } from './EmptyState';
import { COPY_FEEDBACK_MS } from '../constants';
import type { FolderRecord } from '../data/mockData';
import { useHighlight } from './json/HighlightContext';
import { extractHighlights, type HighlightEntry } from '../utils/highlights';
import type { Root, Text, Element, ElementContent } from 'hast';

interface MarkdownViewerProps {
  markdown?: FolderRecord['files']['markdown'];
  json?: FolderRecord['files']['json'];
}

function buildNonOverlappingMatches(
  text: string,
  highlights: HighlightEntry[],
  activeText: string | null,
): Array<{ start: number; end: number; color: string; isActive: boolean }> {
  const textLower = text.toLowerCase();
  const matches: Array<{ start: number; end: number; color: string; isActive: boolean }> = [];

  for (const { text: ht, color } of highlights) {
    const searchLower = ht.toLowerCase();
    let pos = 0;
    while (pos < textLower.length) {
      const found = textLower.indexOf(searchLower, pos);
      if (found === -1) break;
      matches.push({
        start: found,
        end: found + ht.length,
        color,
        isActive: activeText !== null && searchLower === activeText.toLowerCase(),
      });
      pos = found + ht.length;
    }
  }

  // Sort by position; prefer longer matches on ties, then remove overlaps
  matches.sort((a, b) => a.start - b.start || b.end - a.end);
  const result: typeof matches = [];
  let lastEnd = 0;
  for (const m of matches) {
    if (m.start >= lastEnd) {
      result.push(m);
      lastEnd = m.end;
    }
  }
  return result;
}

/** Wraps matched text in <mark> tags within a raw HTML string, leaving HTML tags untouched. */
function applyMatchesToRawHtml(
  html: string,
  highlights: HighlightEntry[],
  activeText: string | null,
): string {
  return html.replace(/<[^>]*>|[^<>]+/gs, (chunk: string) => {
    if (chunk.startsWith('<')) return chunk;

    const matches = buildNonOverlappingMatches(chunk, highlights, activeText);
    if (matches.length === 0) return chunk;

    let result = '';
    let pos = 0;
    for (const m of matches) {
      result += chunk.slice(pos, m.start);
      const cls = m.isActive
        ? 'search-highlight search-highlight--active'
        : 'search-highlight';
      result += `<mark class="${cls}" style="background-color: ${m.color}; border-radius: 2px; padding: 0 2px;">${chunk.slice(m.start, m.end)}</mark>`;
      pos = m.end;
    }
    result += chunk.slice(pos);
    return result;
  });
}

function createRehypeHighlight(highlights: HighlightEntry[], activeText: string | null) {
  return () => (tree: Root) => {
    // Handle plain text nodes (regular markdown paragraphs, headings, etc.)
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || index === undefined) return;

      const value = node.value;
      const nonOverlapping = buildNonOverlappingMatches(value, highlights, activeText);

      if (nonOverlapping.length === 0) return;

      const parts: ElementContent[] = [];
      let pos = 0;
      for (const m of nonOverlapping) {
        if (m.start > pos) {
          parts.push({ type: 'text', value: value.slice(pos, m.start) });
        }
        const mark: Element = {
          type: 'element',
          tagName: 'mark',
          properties: {
            className: m.isActive
              ? ['search-highlight', 'search-highlight--active']
              : ['search-highlight'],
            style: `background-color: ${m.color}; border-radius: 2px; padding: 0 2px;`,
          },
          children: [{ type: 'text', value: value.slice(m.start, m.end) }],
        };
        parts.push(mark);
        pos = m.end;
      }
      if (pos < value.length) {
        parts.push({ type: 'text', value: value.slice(pos) });
      }

      (parent.children as ElementContent[]).splice(index, 1, ...parts);
      // Skip past the newly inserted nodes to avoid double-visiting
      return [SKIP, index + parts.length];
    });

    // Handle raw HTML nodes (e.g. HTML tables: <table>, <tr>, <td>, …)
    // rehypeRaw will later parse these modified HTML strings, preserving the <mark> tags.
    visit(tree, 'raw', (node: any) => {
      if (typeof node.value !== 'string') return;
      node.value = applyMatchesToRawHtml(node.value, highlights, activeText);
    });
  };
}

export function MarkdownViewer({ markdown, json }: MarkdownViewerProps) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const { activeHighlight } = useHighlight();
  const contentRef = useRef<HTMLDivElement>(null);

  const baseHighlights = useMemo(() => (json ? extractHighlights(json.data) : []), [json]);

  const highlights = useMemo(() => {
    // If activeHighlight is not covered by auto-highlights, add it as a fallback
    if (
      activeHighlight &&
      activeHighlight.length >= 2 &&
      !baseHighlights.some(h => h.text.toLowerCase() === activeHighlight.toLowerCase())
    ) {
      return [...baseHighlights, { text: activeHighlight, color: '#fef08a' }];
    }
    return baseHighlights;
  }, [baseHighlights, activeHighlight]);

  const rehypePlugins = useMemo(
    () =>
      highlights.length > 0
        ? [createRehypeHighlight(highlights, activeHighlight), rehypeRaw]
        : [rehypeRaw],
    [highlights, activeHighlight],
  );

  // Scroll to the active highlight when it changes
  useEffect(() => {
    if (!activeHighlight || !contentRef.current) return;
    const el = contentRef.current.querySelector<HTMLElement>('.search-highlight--active');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeHighlight, markdown?.content]);

  if (!markdown) return <EmptyState type="no-markdown" />;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown.content);
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="h-[3px] bg-violet-500 flex-shrink-0" />

      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-50">
            <FileText className="h-3.5 w-3.5 text-violet-600" />
          </div>
          <span className="font-semibold text-sm text-gray-800">{t.notes}</span>
          <span className="rounded-md bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-600">MD</span>
          <span className="text-xs text-gray-400">{markdown.size}</span>
          {baseHighlights.length > 0 && (
            <div className="flex items-center gap-1" title="Fields found in notes">
              {[...new Map(baseHighlights.map(h => [h.color, h.color])).values()].map(color => (
                <span
                  key={color}
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: color, boxShadow: `inset 0 0 0 1px rgba(0,0,0,0.15)` }}
                />
              ))}
            </div>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 gap-1.5 text-xs px-2">
          {copied
            ? <><Check className="h-3.5 w-3.5 text-green-600" />{t.copied}</>
            : <><Copy className="h-3.5 w-3.5" />{t.copy}</>}
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div ref={contentRef} className="markdown-body px-6 py-5">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={rehypePlugins}>
            {markdown.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
