import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import { EmptyState } from './EmptyState';
import { ZOOM_DEFAULT, ZOOM_STEP, ZOOM_MIN, ZOOM_MAX } from '../constants';
import type { FolderRecord } from '../data/mockData';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

interface DocumentViewerProps {
  document?: FolderRecord['files']['document'];
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(ZOOM_DEFAULT);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + ZOOM_STEP, ZOOM_MAX));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - ZOOM_STEP, ZOOM_MIN));

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
    setCurrentPage(1);
  }, []);

  if (!document) return <EmptyState type="no-document" />;

  const isImage = document.type === 'jpeg' || document.type === 'png';
  const showPagination = !isImage && totalPages > 1;

  return (
    <div className="flex h-full flex-col bg-slate-100">
      <div className="h-[3px] bg-brand-navy flex-shrink-0" />

      <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-navy/10">
            <FileText className="h-3.5 w-3.5 text-brand-navy" />
          </div>
          <span className="font-semibold text-sm text-gray-800">Document</span>
          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
            {document.type.toUpperCase()}
          </span>
          <span className="text-xs text-gray-400">{document.size}</span>
        </div>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost" size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={!showPagination || currentPage === 1}
            className={cn('h-7 w-7 p-0', !showPagination && 'invisible')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className={cn('text-xs text-gray-500 w-[52px] text-center tabular-nums', !showPagination && 'invisible')}>
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="ghost" size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={!showPagination || currentPage === totalPages}
            className={cn('h-7 w-7 p-0', !showPagination && 'invisible')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="mx-1.5 h-4 w-px bg-gray-200" />

          <Button variant="ghost" size="sm" onClick={handleZoomOut} className="h-7 w-7 p-0">
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-gray-500 w-[38px] text-center tabular-nums">{zoom}%</span>
          <Button variant="ghost" size="sm" onClick={handleZoomIn} className="h-7 w-7 p-0">
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-5">
        <div className="flex justify-center">
          {isImage ? (
            <div className="bg-white shadow-xl rounded-sm" style={{ width: `${zoom * 8}px` }}>
              <img src={document.url} alt="Document" className="w-full h-auto" />
            </div>
          ) : (
            <Document
              file={document.url}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex flex-col items-center justify-center gap-3 w-[600px] h-[800px] bg-white shadow-xl rounded-sm">
                  <div className="h-7 w-7 rounded-full border-2 border-brand-navy/20 border-t-brand-navy animate-spin" />
                  <span className="text-xs text-gray-400">Loading PDF…</span>
                </div>
              }
              error={
                <div className="flex items-center justify-center w-[600px] h-[800px] bg-white shadow-xl rounded-sm">
                  <span className="text-sm text-red-400">Failed to load PDF.</span>
                </div>
              }
            >
              <Page
                pageNumber={currentPage}
                scale={zoom / 100}
                className="shadow-xl rounded-sm"
                renderTextLayer
                renderAnnotationLayer
              />
            </Document>
          )}
        </div>
      </div>
    </div>
  );
}
