import { useState, useEffect } from 'react';
import { File, FileText, FileJson } from 'lucide-react';
import { DocumentViewer } from './DocumentViewer';
import { MarkdownViewer } from './MarkdownViewer';
import { JsonViewer } from './JsonViewer';
import { cn } from './ui/utils';
import type { FolderRecord } from '../data/mockData';
import { useLang } from '../i18n/LangContext';
import { HighlightContext } from './json/HighlightContext';

type Tab = 'document' | 'notes' | 'data';

const TAB_STYLE: Record<Tab, { Icon: React.ElementType; activeClass: string; dotClass: string }> = {
  document: { Icon: File,     activeClass: 'text-brand-navy border-brand-navy',       dotClass: 'bg-brand-navy'   },
  notes:    { Icon: FileText, activeClass: 'text-violet-600 border-violet-500',        dotClass: 'bg-violet-500'   },
  data:     { Icon: FileJson, activeClass: 'text-emerald-600 border-emerald-500',      dotClass: 'bg-emerald-500'  },
};

function defaultTab(folder: FolderRecord): Tab {
  if (folder.files.markdown) return 'notes';
  if (folder.files.document) return 'document';
  return 'data';
}

interface ViewerPanelProps {
  folder: FolderRecord;
}

export function ViewerPanel({ folder }: ViewerPanelProps) {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState<Tab>(() => defaultTab(folder));
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);

  // Clear highlight when the folder changes
  useEffect(() => {
    setActiveHighlight(null);
  }, [folder.id]);

  function handleSetHighlight(text: string | null) {
    setActiveHighlight(text);
    if (text && folder.files.markdown) {
      setActiveTab('notes');
    }
  }

  const hasFile: Record<Tab, boolean> = {
    document: !!folder.files.document,
    notes: !!folder.files.markdown,
    data: !!folder.files.json,
  };

  const tabLabels: Record<Tab, string> = {
    document: t.tabDocument,
    notes: t.tabNotes,
    data: t.tabData,
  };

  return (
    <HighlightContext.Provider value={{ activeHighlight, setHighlight: handleSetHighlight }}>
      <div className="flex h-full flex-col">
        {/* Tab bar */}
        <div className="flex items-end bg-white border-b border-gray-200 px-4 flex-shrink-0">
          {(Object.keys(TAB_STYLE) as Tab[]).map((id) => {
            const { Icon, activeClass, dotClass } = TAB_STYLE[id];
            const isActive = activeTab === id;
            const isAvailable = hasFile[id];

            return (
              <button
                key={id}
                onClick={() => isAvailable && setActiveTab(id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors duration-100',
                  isActive && isAvailable
                    ? activeClass
                    : isAvailable
                    ? 'text-gray-500 border-transparent hover:text-gray-800'
                    : 'text-gray-300 border-transparent cursor-default',
                  !isActive && 'border-transparent',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tabLabels[id]}
                {!isAvailable && (
                  <span className="rounded-full bg-gray-200 w-1.5 h-1.5 inline-block" />
                )}
                {isAvailable && isActive && (
                  <span className={cn('rounded-full w-1.5 h-1.5 inline-block', dotClass)} />
                )}
              </button>
            );
          })}
        </div>

        {/* Active panel */}
        <div className="flex-1 min-h-0">
          {activeTab === 'document' && <DocumentViewer document={folder.files.document} />}
          {activeTab === 'notes'    && <MarkdownViewer markdown={folder.files.markdown} />}
          {activeTab === 'data'     && <JsonViewer json={folder.files.json} />}
        </div>
      </div>
    </HighlightContext.Provider>
  );
}
