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

const TAB_STYLE: Record<Tab, { Icon: React.ElementType; activeClass: string }> = {
  document: { Icon: File,     activeClass: 'bg-brand-navy/10 text-brand-navy'   },
  notes:    { Icon: FileText, activeClass: 'bg-violet-100 text-violet-700'      },
  data:     { Icon: FileJson, activeClass: 'bg-emerald-100 text-emerald-700'    },
};

function defaultTab(folder: FolderRecord): Tab {
  if (folder.files.markdown) return 'notes';
  if (folder.files.document) return 'document';
  return 'data';
}

interface ViewerPanelProps {
  folder: FolderRecord;
  initialTab?: Tab;
}

export function ViewerPanel({ folder, initialTab }: ViewerPanelProps) {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (initialTab && folder.files[initialTab === 'notes' ? 'markdown' : initialTab === 'data' ? 'json' : 'document']) {
      return initialTab;
    }
    return defaultTab(folder);
  });
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);

  // When folder changes: clear highlight, keep current tab if the new folder has that file
  useEffect(() => {
    setActiveHighlight(null);
    if (!hasFile[activeTab]) {
      setActiveTab(defaultTab(folder));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <HighlightContext.Provider value={{ activeHighlight, setHighlight: handleSetHighlight, markdownContent: folder.files.markdown?.content ?? null }}>
      <div className="flex h-full flex-col">
        {/* Tab bar */}
        <div className="flex items-center gap-1 bg-white border-b border-gray-200 px-3 py-2 flex-shrink-0">
          {(Object.keys(TAB_STYLE) as Tab[]).map((id) => {
            const { Icon, activeClass } = TAB_STYLE[id];
            const isActive = activeTab === id;
            const isAvailable = hasFile[id];

            return (
              <button
                key={id}
                onClick={() => isAvailable && setActiveTab(id)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-100',
                  isActive && isAvailable
                    ? activeClass
                    : isAvailable
                    ? 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                    : 'text-gray-300 cursor-default',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tabLabels[id]}
                {!isAvailable && (
                  <span className="rounded-full bg-gray-200 w-1.5 h-1.5 inline-block" />
                )}
              </button>
            );
          })}
        </div>

        {/* Active panel */}
        <div className="flex-1 min-h-0">
          {activeTab === 'document' && <DocumentViewer document={folder.files.document} />}
          {activeTab === 'notes'    && <MarkdownViewer markdown={folder.files.markdown} json={folder.files.json} />}
          {activeTab === 'data'     && <JsonViewer json={folder.files.json} />}
        </div>
      </div>
    </HighlightContext.Provider>
  );
}
