import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ViewerPanel } from './components/ViewerPanel';
import { EmptyState } from './components/EmptyState';
import { ExtractionPanel } from './components/ExtractionPanel';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import { scanDirectory } from './utils/folderScanner';
import { useLang } from './i18n/LangContext';
import type { FolderRecord } from './data/mockData';

type ScanStatus = 'idle' | 'scanning' | 'ready';
interface NamedHandle { name: string }

export default function App() {
  const { t } = useLang();
  const [folders, setFolders] = useState<FolderRecord[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>();
  const [rootFolderName, setRootFolderName] = useState<string | undefined>();
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [compareMode, setCompareMode] = useState(false);
  const [extractionMode, setExtractionMode] = useState(false);

  const selectedFolder = folders.find((f) => f.id === selectedFolderId);

  const handlePickFolder = async () => {
    try {
      const dirHandle = await (window as unknown as { showDirectoryPicker: (opts: object) => Promise<{ name: string }> })
        .showDirectoryPicker({ mode: 'read' });

      setRootFolderName(dirHandle.name);
      setSelectedFolderId(undefined);
      setScanStatus('scanning');

      const records = await scanDirectory(dirHandle as never);

      setFolders(records);
      setScanStatus('ready');

      if (records.length === 0) {
        toast.info(t.noFoldersFound);
      } else {
        const msg = records.length === 1
          ? t.foundFolder
          : t.foundFolders.replace('{n}', String(records.length));
        toast.success(msg);
        setSelectedFolderId(records[0].id);
      }
    } catch (err: unknown) {
      if ((err as { name?: string })?.name !== 'AbortError') {
        toast.error(t.couldNotOpenFolder);
        console.error('[App] folder pick error:', err);
      }
      setScanStatus('idle');
    }
  };

  const handleExtractComplete = async (dirHandle: NamedHandle) => {
    setRootFolderName(dirHandle.name);
    setSelectedFolderId(undefined);
    setScanStatus('scanning');

    try {
      const records = await scanDirectory(dirHandle as never);
      setFolders(records);
      setScanStatus('ready');
      setExtractionMode(false);

      if (records.length > 0) {
        setSelectedFolderId(records[records.length - 1].id);
        toast.success(t.extractionSuccess);
      }
    } catch {
      setScanStatus('idle');
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <Toaster />

      <Header
        folderPath={selectedFolder ? `${rootFolderName}/${selectedFolder.path}` : rootFolderName}
        onRefresh={handlePickFolder}
        compareMode={compareMode}
        onToggleCompare={() => { setCompareMode((v) => !v); setExtractionMode(false); }}
        extractionMode={extractionMode}
        onToggleExtract={() => { setExtractionMode((v) => !v); setCompareMode(false); }}
        onLogoClick={() => { setExtractionMode(false); setCompareMode(false); }}
      />

      <div className="flex flex-1 overflow-hidden">
        {!extractionMode && (
          <Sidebar
            folders={folders}
            selectedId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
            onOpenFolder={handlePickFolder}
            rootFolderName={rootFolderName}
          />
        )}

        <div className="flex-1 overflow-hidden">
          {extractionMode ? (
            <ExtractionPanel onComplete={handleExtractComplete} />
          ) : scanStatus === 'scanning' ? (
            <div className="flex h-full items-center justify-center bg-[#f8f9fc]">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 rounded-full border-2 border-brand-navy/20 border-t-brand-navy animate-spin" />
                <p className="text-sm text-gray-400">{t.scanningFolder}</p>
              </div>
            </div>
          ) : selectedFolder ? (
            compareMode ? (
              <div className="flex h-full">
                <div className="flex-1 min-w-0 border-r border-gray-200">
                  <ViewerPanel key={`${selectedFolder.id}-left`} folder={selectedFolder} />
                </div>
                <div className="flex-1 min-w-0">
                  <ViewerPanel key={`${selectedFolder.id}-right`} folder={selectedFolder} />
                </div>
              </div>
            ) : (
              <ViewerPanel key={selectedFolder.id} folder={selectedFolder} />
            )
          ) : (
            <EmptyState type="no-selection" />
          )}
        </div>
      </div>
    </div>
  );
}
