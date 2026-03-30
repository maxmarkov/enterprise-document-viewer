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
import type { Root, Text, Element, ElementContent } from 'hast';

interface MarkdownViewerProps {
  markdown?: FolderRecord['files']['markdown'];
}

function createRehypeHighlight(searchText: string) {
  return () => (tree: Root) => {
    const searchLower = searchText.toLowerCase();

    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || index === undefined) return;
      const valueLower = node.value.toLowerCase();
      if (!valueLower.includes(searchLower)) return;

      const parts: ElementContent[] = [];
      let pos = 0;
      while (pos <= node.value.length) {
        const found = valueLower.indexOf(searchLower, pos);
        if (found === -1) {
          if (pos < node.value.length) {
            parts.push({ type: 'text', value: node.value.slice(pos) });
          }
          break;
        }
        if (found > pos) {
          parts.push({ type: 'text', value: node.value.slice(pos, found) });
        }
        const mark: Element = {
          type: 'element',
          tagName: 'mark',
          properties: { className: ['search-highlight'] },
          children: [{ type: 'text', value: node.value.slice(found, found + searchText.length) }],
        };
        parts.push(mark);
        pos = found + searchLower.length;
        if (pos >= node.value.length) break;
      }

      if (parts.length > 0) {
        (parent.children as ElementContent[]).splice(index, 1, ...parts);
      }
    });
  };
}

export function MarkdownViewer({ markdown }: MarkdownViewerProps) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const { activeHighlight } = useHighlight();
  const contentRef = useRef<HTMLDivElement>(null);

  const rehypePlugins = useMemo(
    () =>
      activeHighlight
        ? [rehypeRaw, createRehypeHighlight(activeHighlight)]
        : [rehypeRaw],
    [activeHighlight],
  );

  useEffect(() => {
    if (!activeHighlight || !contentRef.current) return;
    const first = contentRef.current.querySelector<HTMLElement>('.search-highlight');
    first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
