import { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { useLang } from '../i18n/LangContext';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { visit } from 'unist-util-visit';
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

function createRehypeHighlight(highlights: HighlightEntry[], activeText: string | null) {
  return () => (tree: Root) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || index === undefined) return;

      const value = node.value;
      const valueLower = value.toLowerCase();

      const matches: Array<{ start: number; end: number; color: string; isActive: boolean }> = [];

      for (const { text, color } of highlights) {
        const searchLower = text.toLowerCase();
        let pos = 0;
        while (pos < valueLower.length) {
          const found = valueLower.indexOf(searchLower, pos);
          if (found === -1) break;
          matches.push({
            start: found,
            end: found + text.length,
            color,
            isActive: activeText !== null && searchLower === activeText.toLowerCase(),
          });
          pos = found + text.length;
        }
      }

      if (matches.length === 0) return;

      // Sort by position; prefer longer matches on ties, then remove overlaps
      matches.sort((a, b) => a.start - b.start || b.end - a.end);
      const nonOverlapping: typeof matches = [];
      let lastEnd = 0;
      for (const m of matches) {
        if (m.start >= lastEnd) {
          nonOverlapping.push(m);
          lastEnd = m.end;
        }
      }

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

      if (parts.length > 0) {
        (parent.children as ElementContent[]).splice(index, 1, ...parts);
      }
    });
  };
}

export function MarkdownViewer({ markdown, json }: MarkdownViewerProps) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const { activeHighlight } = useHighlight();
  const contentRef = useRef<HTMLDivElement>(null);

  const highlights = useMemo(() => {
    const base = json ? extractHighlights(json.data) : [];
    // If activeHighlight is not covered by auto-highlights, add it as a fallback
    if (
      activeHighlight &&
      activeHighlight.length >= 2 &&
      !base.some(h => h.text.toLowerCase() === activeHighlight.toLowerCase())
    ) {
      return [...base, { text: activeHighlight, color: '#fef08a' }];
    }
    return base;
  }, [json, activeHighlight]);

  const rehypePlugins = useMemo(
    () =>
      highlights.length > 0
        ? [rehypeRaw, createRehypeHighlight(highlights, activeHighlight)]
        : [rehypeRaw],
    [highlights, activeHighlight],
  );

  // Scroll to the active highlight when it changes
  useEffect(() => {
    if (!activeHighlight || !contentRef.current) return;
    const el =
      contentRef.current.querySelector<HTMLElement>('.search-highlight--active') ??
      contentRef.current.querySelector<HTMLElement>('.search-highlight');
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
