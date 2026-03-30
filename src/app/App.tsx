import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DocumentViewer } from './components/DocumentViewer';
import { MarkdownViewer } from './components/MarkdownViewer';
import { JsonViewer } from './components/JsonViewer';
import { EmptyState } from './components/EmptyState';
import type { FolderRecord } from './data/mockData';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './components/ui/resizable';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import { scanDirectory } from './utils/folderScanner';

type ScanStatus = 'idle' | 'scanning' | 'ready';

export default function App() {
  const [folders, setFolders] = useState<FolderRecord[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>();
  const [rootFolderName, setRootFolderName] = useState<string | undefined>();
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [showPdf, setShowPdf] = useState(false);

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
        toast.info('No document folders found.');
      } else {
        toast.success(`Found ${records.length} folder${records.length !== 1 ? 's' : ''}`);
        setSelectedFolderId(records[0].id);
      }
    } catch (err: unknown) {
      if ((err as { name?: string })?.name !== 'AbortError') {
        toast.error('Could not open folder.');
        console.error('[App] folder pick error:', err);
      }
      setScanStatus('idle');
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <Toaster />

      <Header
        folderPath={selectedFolder ? `${rootFolderName}/${selectedFolder.path}` : rootFolderName}
        onRefresh={handlePickFolder}
        showPdf={showPdf}
        onTogglePdf={() => setShowPdf((v) => !v)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          folders={folders}
          selectedId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          onOpenFolder={handlePickFolder}
          rootFolderName={rootFolderName}
        />

        <div className="flex-1 overflow-hidden">
          {scanStatus === 'scanning' ? (
            <div className="flex h-full items-center justify-center bg-[#f8f9fc]">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 rounded-full border-2 border-brand-navy/20 border-t-brand-navy animate-spin" />
                <p className="text-sm text-gray-400">Scanning folder…</p>
              </div>
            </div>
          ) : selectedFolder ? (
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {showPdf && (
                <>
                  <ResizablePanel defaultSize={35} minSize={20} maxSize={50} collapsible collapsedSize={0}>
                    <div className="h-full border-r border-gray-200">
                      <DocumentViewer document={selectedFolder.files.document} />
                    </div>
                  </ResizablePanel>
                  <ResizableHandle className="w-[3px] bg-gray-200 hover:bg-brand-navy transition-colors duration-150" />
                </>
              )}

              <ResizablePanel defaultSize={showPdf ? 65 : 100} minSize={30}>
                <div className="h-full flex">
                  <div className="flex-1 overflow-hidden border-r border-gray-200">
                    <MarkdownViewer markdown={selectedFolder.files.markdown} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <JsonViewer json={selectedFolder.files.json} />
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <EmptyState type="no-selection" />
          )}
        </div>
      </div>
    </div>
  );
}
