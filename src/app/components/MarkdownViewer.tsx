import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { FileText, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { EmptyState } from './EmptyState';
import { COPY_FEEDBACK_MS } from '../constants';
import type { FolderRecord } from '../data/mockData';

interface MarkdownViewerProps {
  markdown?: FolderRecord['files']['markdown'];
}

export function MarkdownViewer({ markdown }: MarkdownViewerProps) {
  const [copied, setCopied] = useState(false);

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
          <span className="font-semibold text-sm text-gray-800">Notes</span>
          <span className="rounded-md bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-600">MD</span>
          <span className="text-xs text-gray-400">{markdown.size}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 gap-1.5 text-xs px-2">
          {copied
            ? <><Check className="h-3.5 w-3.5 text-green-600" />Copied</>
            : <><Copy className="h-3.5 w-3.5" />Copy</>}
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="markdown-body px-6 py-5">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {markdown.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
