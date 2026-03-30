import { FolderOpen, FileText, Image, FileJson, FolderSearch } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { cn } from './ui/utils';
import type { FolderRecord } from '../data/mockData';

interface SidebarProps {
  folders: FolderRecord[];
  selectedId?: string;
  onSelectFolder: (id: string) => void;
  onOpenFolder: () => void;
  rootFolderName?: string;
}

function countComplete(folders: FolderRecord[]) {
  return folders.filter((f) => f.files.document && f.files.markdown && f.files.json).length;
}

export function Sidebar({ folders, selectedId, onSelectFolder, onOpenFolder, rootFolderName }: SidebarProps) {
  return (
    <div className="flex h-full w-64 flex-col bg-[#f8f9fc] border-r border-gray-200 flex-shrink-0">
      <div className="px-3 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        <Button
          onClick={onOpenFolder}
          className="w-full gap-2 bg-brand-navy hover:bg-brand-navy-dark text-white shadow-sm h-9 text-sm"
        >
          <FolderOpen className="h-4 w-4" />
          Open Folder
        </Button>
        {rootFolderName && (
          <p className="mt-2 text-[11px] text-gray-400 truncate text-center" title={rootFolderName}>
            📁 {rootFolderName}
          </p>
        )}
      </div>

      <ScrollArea className="flex-1 min-h-0">
        {folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
            <div className="rounded-2xl bg-gray-100 p-5">
              <FolderSearch className="h-9 w-9 text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">No folder open</p>
              <p className="text-xs text-gray-400 mt-0.5">Click "Open Folder" to get started</p>
            </div>
          </div>
        ) : (
          <div className="p-2.5 space-y-1">
            <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 tabular-nums">
              {folders.length} Records
              {countComplete(folders) > 0 && (
                <span className="normal-case font-normal">
                  {' '}· {countComplete(folders)} complete
                </span>
              )}
            </p>
            {folders.map((folder) => {
              const isSelected = selectedId === folder.id;
              return (
                <button
                  key={folder.id}
                  onClick={() => onSelectFolder(folder.id)}
                  className={cn(
                    'w-full rounded-lg p-3 text-left transition-all duration-100 border-l-[3px]',
                    isSelected
                      ? 'border-l-brand-navy bg-white shadow-sm'
                      : 'border-l-transparent bg-white/60 hover:bg-white hover:shadow-sm'
                  )}
                >
                  <p className={cn(
                    'text-sm truncate leading-tight',
                    isSelected ? 'font-semibold text-brand-navy' : 'font-medium text-gray-700'
                  )}>
                    {folder.name}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1">
                    {folder.files.document && (
                      <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-700">
                        {folder.files.document.type === 'pdf' ? <FileText className="h-2.5 w-2.5" /> : <Image className="h-2.5 w-2.5" />}
                        {folder.files.document.type.toUpperCase()}
                      </span>
                    )}
                    {folder.files.markdown && (
                      <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium bg-violet-50 text-violet-700">
                        <FileText className="h-2.5 w-2.5" />MD
                      </span>
                    )}
                    {folder.files.json && (
                      <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700">
                        <FileJson className="h-2.5 w-2.5" />JSON
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
